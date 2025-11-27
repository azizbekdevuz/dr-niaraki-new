'use client';

/**
 * Admin device management page
 */

import {
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Shield,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface Device {
  id: string;
  label: string;
  userAgent: string;
  registeredAt: string;
  lastUsedAt?: string;
  expiresAt: string;
}

export default function AdminDevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDeviceLabel, setNewDeviceLabel] = useState('');
  const [registering, setRegistering] = useState(false);
  const [hasValidDevice, setHasValidDevice] = useState(false);

  // Load devices and status
  useEffect(() => {
    async function loadData() {
      try {
        // Check auth status
        const statusRes = await fetch('/api/admin/status');
        const statusData = await statusRes.json();
        
        if (!statusData.isLoggedIn) {
          router.push('/admin');
          return;
        }
        
        setHasValidDevice(statusData.hasValidDevice);

        // Load devices
        const devicesRes = await fetch('/api/admin/devices');
        const devicesData = await devicesRes.json();
        
        if (devicesData.success) {
          setDevices(devicesData.devices);
        }
      } catch {
        setError('Failed to load devices');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceLabel.trim()) {
      return;
    }

    setRegistering(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newDeviceLabel }),
      });

      const data = await res.json();

      if (data.success) {
        // Reload devices list
        const devicesRes = await fetch('/api/admin/devices');
        const devicesData = await devicesRes.json();
        if (devicesData.success) {
          setDevices(devicesData.devices);
        }
        setNewDeviceLabel('');
        setHasValidDevice(true);
      } else {
        setError(data.message || 'Failed to register device');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setRegistering(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to revoke this device?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/devices?id=${deviceId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setDevices(devices.filter((d) => d.id !== deviceId));
      } else {
        setError(data.message || 'Failed to revoke device');
      }
    } catch {
      setError('Failed to connect to server');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin');
    } catch {
      setError('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Device Management</h1>
              <p className="text-muted text-sm">Manage your registered devices</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Status Banner */}
        {!hasValidDevice && (
          <div className="card p-4 mb-6 border-warning bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Device Registration Required</p>
                <p className="text-muted text-sm mt-1">
                  You need to register this device to perform sensitive operations like committing changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-error text-sm bg-error/10 px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register New Device */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Register This Device</h2>
          <form onSubmit={handleRegisterDevice} className="flex gap-4">
            <input
              type="text"
              value={newDeviceLabel}
              onChange={(e) => setNewDeviceLabel(e.target.value)}
              placeholder="Device name (e.g., 'Office Laptop')"
              className="flex-1 px-4 py-2 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
              required
            />
            <button
              type="submit"
              disabled={registering || !newDeviceLabel.trim()}
              className="btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {registering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Register</span>
            </button>
          </form>
        </div>

        {/* Registered Devices */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Registered Devices</h2>
          
          {devices.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No devices registered yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Smartphone className="w-8 h-8 text-accent-primary" />
                    <div>
                      <p className="font-medium text-foreground">{device.label}</p>
                      <p className="text-muted text-xs">{device.userAgent}</p>
                      <p className="text-muted text-xs mt-1">
                        Registered: {new Date(device.registeredAt).toLocaleDateString()}
                        {device.lastUsedAt && (
                          <> • Last used: {new Date(device.lastUsedAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeDevice(device.id)}
                    className="p-2 text-muted hover:text-error transition-colors"
                    title="Revoke device"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        {hasValidDevice && (
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/admin/upload"
              className="btn-primary px-6 py-3 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Continue to Upload</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
