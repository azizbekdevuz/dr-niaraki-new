import 'server-only';

import fs from 'fs/promises';
import path from 'path';

import { Prisma } from '@prisma/client';

import { commitFile, getFileContent, isGitHubConfigured } from '@/lib/github';
import { prisma } from '@/server/db/prisma';
import type { AdminDevicesData, DeviceRecord } from '@/types/admin';

const DEVICES_FILE = path.join(process.cwd(), 'src', 'datasets', 'admin_devices.json');
const DEVICES_GITHUB_PATH = 'src/datasets/admin_devices.json';

let legacyMigrationAttempted = false;

function emptyDevices(): AdminDevicesData {
  return {
    devices: [],
    lastModified: new Date().toISOString(),
  };
}

function rowToDevice(r: {
  id: string;
  label: string;
  userAgent: string;
  ipHash: string;
  registeredAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
}): DeviceRecord {
  return {
    id: r.id,
    label: r.label,
    userAgent: r.userAgent,
    ipHash: r.ipHash,
    registeredAt: r.registeredAt.toISOString(),
    lastUsedAt: r.lastUsedAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
  };
}

export function adminDevicesUsePostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function readLegacyAdminDevicesFromMirrorOrDisk(): Promise<AdminDevicesData> {
  if (isGitHubConfigured()) {
    try {
      const content = await getFileContent(DEVICES_GITHUB_PATH);
      if (content) {
        return JSON.parse(content) as AdminDevicesData;
      }
    } catch (error) {
      console.warn('[admin-devices] Failed to read devices from GitHub, trying filesystem:', error);
    }
  }

  try {
    const content = await fs.readFile(DEVICES_FILE, 'utf-8');
    return JSON.parse(content) as AdminDevicesData;
  } catch {
    return emptyDevices();
  }
}

export async function persistLegacyAdminDevicesSnapshot(data: AdminDevicesData): Promise<void> {
  if (isGitHubConfigured()) {
    try {
      const content = JSON.stringify(data, null, 2);
      const message = `admin: update registered devices — ${new Date().toISOString()}`;
      await commitFile(DEVICES_GITHUB_PATH, content, message);
      return;
    } catch (error) {
      console.error('[admin-devices] Failed to save devices to GitHub:', error);
    }
  }

  const dir = path.dirname(DEVICES_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DEVICES_FILE, JSON.stringify(data, null, 2));
}

async function maybeMigrateLegacyDevicesIntoPostgres(): Promise<void> {
  if (!adminDevicesUsePostgres() || legacyMigrationAttempted) {
    return;
  }
  legacyMigrationAttempted = true;
  try {
    const count = await prisma.adminRegisteredDevice.count();
    if (count > 0) {
      return;
    }
    const legacy = await readLegacyAdminDevicesFromMirrorOrDisk();
    if (legacy.devices.length === 0) {
      return;
    }
    for (const d of legacy.devices) {
      try {
        await prisma.adminRegisteredDevice.create({
          data: {
            id: d.id,
            label: d.label,
            userAgent: d.userAgent,
            ipHash: d.ipHash,
            registeredAt: new Date(d.registeredAt),
            lastUsedAt: new Date(d.lastUsedAt ?? d.registeredAt),
            expiresAt: new Date(d.expiresAt),
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          continue;
        }
        throw e;
      }
    }
    console.warn(
      `[admin-devices] Migrated ${legacy.devices.length} device(s) from legacy JSON into Postgres.`,
    );
  } catch (e) {
    console.warn('[admin-devices] Legacy → Postgres device migration skipped or failed:', e);
  }
}

async function loadFromPostgres(): Promise<AdminDevicesData> {
  await maybeMigrateLegacyDevicesIntoPostgres();
  const rows = await prisma.adminRegisteredDevice.findMany({
    orderBy: { registeredAt: 'asc' },
  });
  if (rows.length === 0) {
    return emptyDevices();
  }
  let latest = rows[0]!.lastUsedAt;
  for (const r of rows) {
    if (r.lastUsedAt > latest) {
      latest = r.lastUsedAt;
    }
  }
  return {
    devices: rows.map(rowToDevice),
    lastModified: latest.toISOString(),
  };
}

/**
 * Load registered devices: Postgres when `DATABASE_URL` is set (recommended on Vercel),
 * otherwise legacy JSON (local filesystem and/or GitHub mirror).
 */
export async function loadAdminDevicesData(): Promise<AdminDevicesData> {
  if (adminDevicesUsePostgres()) {
    try {
      return await loadFromPostgres();
    } catch (e) {
      console.warn('[admin-devices] Postgres load failed; falling back to legacy JSON.', e);
    }
  }
  return readLegacyAdminDevicesFromMirrorOrDisk();
}

export async function adminRegisterDevice(device: DeviceRecord): Promise<void> {
  if (adminDevicesUsePostgres()) {
    try {
      await prisma.adminRegisteredDevice.create({
        data: {
          id: device.id,
          label: device.label,
          userAgent: device.userAgent,
          ipHash: device.ipHash,
          registeredAt: new Date(device.registeredAt),
          lastUsedAt: new Date(device.lastUsedAt ?? device.registeredAt),
          expiresAt: new Date(device.expiresAt),
        },
      });
      return;
    } catch (e) {
      console.warn('[admin-devices] Postgres register failed; falling back to legacy snapshot.', e);
    }
  }
  const data = await readLegacyAdminDevicesFromMirrorOrDisk();
  const next: AdminDevicesData = {
    devices: [...data.devices, device],
    lastModified: new Date().toISOString(),
  };
  await persistLegacyAdminDevicesSnapshot(next);
}

export async function adminRevokeDevice(deviceId: string): Promise<boolean> {
  if (adminDevicesUsePostgres()) {
    try {
      const r = await prisma.adminRegisteredDevice.deleteMany({ where: { id: deviceId } });
      return r.count > 0;
    } catch (e) {
      console.warn('[admin-devices] Postgres revoke failed; trying legacy snapshot.', e);
    }
  }
  const data = await readLegacyAdminDevicesFromMirrorOrDisk();
  const initial = data.devices.length;
  const devices = data.devices.filter((d) => d.id !== deviceId);
  if (devices.length === initial) {
    return false;
  }
  await persistLegacyAdminDevicesSnapshot({
    devices,
    lastModified: new Date().toISOString(),
  });
  return true;
}

export async function adminFindDeviceById(deviceId: string): Promise<DeviceRecord | null> {
  if (adminDevicesUsePostgres()) {
    try {
      const row = await prisma.adminRegisteredDevice.findUnique({ where: { id: deviceId } });
      return row ? rowToDevice(row) : null;
    } catch (e) {
      console.warn('[admin-devices] Postgres lookup failed; using legacy JSON.', e);
    }
  }
  const data = await readLegacyAdminDevicesFromMirrorOrDisk();
  return data.devices.find((d) => d.id === deviceId) ?? null;
}

const DEFAULT_TOUCH_INTERVAL_MS = 15 * 60 * 1000;

/** Cheap throttled `lastUsedAt` write — safe on the device validation hot path. */
export async function adminTouchDeviceLastUsedThrottled(
  deviceId: string,
  minIntervalMs: number = DEFAULT_TOUCH_INTERVAL_MS,
): Promise<void> {
  if (!adminDevicesUsePostgres()) {
    return;
  }
  try {
    const row = await prisma.adminRegisteredDevice.findUnique({
      where: { id: deviceId },
      select: { lastUsedAt: true },
    });
    if (!row) {
      return;
    }
    if (Date.now() - row.lastUsedAt.getTime() < minIntervalMs) {
      return;
    }
    await prisma.adminRegisteredDevice.update({
      where: { id: deviceId },
      data: { lastUsedAt: new Date() },
    });
  } catch (e) {
    console.warn('[admin-devices] Throttled lastUsedAt touch failed (non-fatal):', e);
  }
}
