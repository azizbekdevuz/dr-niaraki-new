'use client';

import { AlertCircle } from 'lucide-react';
import React from 'react';

export function CvUploadErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-error text-sm bg-error/10 px-4 py-3 rounded-lg mb-6">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
