'use client';

import { History, Layers, LogOut, Package, Settings, Upload } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { ADMIN_SUBNAV_LINK } from '@/app/admin/adminSubnavStyles';
import { TW_ACCENT_SOFT_GRADIENT } from '@/lib/ui/chromeClassStrings';

type Props = {
  onLogout: () => void;
};

export function UploadPageToolbar({ onLogout }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${TW_ACCENT_SOFT_GRADIENT}`}>
          <Upload className="w-6 h-6 text-accent-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload CV</h1>
          <p className="text-muted text-sm">
            Parse DOCX into an import candidate — prefer <strong>Imports</strong> → merge to draft →{' '}
            <strong>Site content</strong> → publish for the live site.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <a href="/admin/history" className={ADMIN_SUBNAV_LINK}>
          <History className="w-4 h-4" />
          <span>History</span>
        </a>
        <a href="/admin/content" className={ADMIN_SUBNAV_LINK}>
          <Layers className="w-4 h-4" />
          <span>Site content</span>
        </a>
        <Link href="/admin/imports" className={ADMIN_SUBNAV_LINK}>
          <Package className="w-4 h-4" />
          <span>Imports</span>
        </Link>
        <a href="/admin/devices" className={ADMIN_SUBNAV_LINK}>
          <Settings className="w-4 h-4" />
          <span>Devices</span>
        </a>
        <button type="button" onClick={() => void onLogout()} className={ADMIN_SUBNAV_LINK}>
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
