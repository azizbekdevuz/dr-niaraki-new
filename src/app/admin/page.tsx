'use client';

/**
 * Admin login page
 */

import { Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if already logged in
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/admin/status');
        const data = await res.json();
        
        if (data.isLoggedIn) {
          if (data.hasValidDevice) {
            router.push('/admin/upload');
          } else {
            router.push('/admin/devices');
          }
        }
      } catch {
        // Not logged in
      } finally {
        setCheckingStatus(false);
      }
    }
    checkStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include', // Ensure cookies are sent and received
      });

      const data = await res.json();

      if (data.success) {
        // Wait a moment for cookie to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (data.isDeviceRegistered) {
          router.push('/admin/upload');
        } else {
          router.push('/admin/devices');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-accent-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
            <p className="text-muted text-sm">
              Enter your password to access the admin dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error text-sm bg-error/10 px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-primary">
            <div className="flex items-start gap-3 text-muted text-xs">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                This admin area requires device registration for sensitive operations. 
                After login, you&apos;ll be prompted to register your device.
              </p>
            </div>
          </div>
        </div>

        {/* Back to site link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-muted text-sm hover:text-foreground transition-colors"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
