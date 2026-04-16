'use client';

import { History, Layers, LogOut, Package, RefreshCw, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { ADMIN_SUBNAV_LINK } from '@/app/admin/adminSubnavStyles';
import { TW_ACCENT_SOFT_GRADIENT } from '@/lib/ui/chromeClassStrings';

export type ContentWorkflowToolbarProps = {
  syncing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
};

export function ContentWorkflowToolbar({ syncing, onRefresh, onLogout }: ContentWorkflowToolbarProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${TW_ACCENT_SOFT_GRADIENT}`}>
          <Layers className="h-6 w-6 text-accent-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site content</h1>
          <p className="text-sm text-muted">Draft, publish, and restore versioned content</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <a href="/admin/upload" className={ADMIN_SUBNAV_LINK}>
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </a>
        <Link href="/admin/imports" className={ADMIN_SUBNAV_LINK}>
          <Package className="h-4 w-4" />
          <span>Imports</span>
        </Link>
        <a href="/admin/history" className={ADMIN_SUBNAV_LINK}>
          <History className="h-4 w-4" />
          <span>History</span>
        </a>
        <a href="/admin/devices" className={ADMIN_SUBNAV_LINK}>
          <Settings className="h-4 w-4" />
          <span>Devices</span>
        </a>
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={syncing}
          className={`${ADMIN_SUBNAV_LINK} disabled:opacity-50`}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
        <button
          type="button"
          onClick={() => void onLogout()}
          className={ADMIN_SUBNAV_LINK}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
