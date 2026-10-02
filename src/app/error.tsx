'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, FileText } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostic tracking
    console.error('BillWebz App Error Caught:', error);
  }, [error]);

  const handleClearCacheAndReset = () => {
    try {
      // If corrupted data caused the issue, safely reset
      sessionStorage.removeItem('billwebz_temp_draft');
    } catch (e) {}
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Workspace Recovery
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            BillWebz encountered an unexpected issue while loading this document workspace. Your data in storage is secure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
          <button
            onClick={handleClearCacheAndReset}
            className="w-full sm:flex-1 h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Workspace</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <span>Full Refresh</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-800 w-full text-xs text-slate-400">
          <Link href="/invoice/gst" className="hover:text-blue-400 flex items-center gap-1.5 transition-colors">
            <FileText className="w-3.5 h-3.5" />
            <span>GST Workspace</span>
          </Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:text-blue-400 flex items-center gap-1.5 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
