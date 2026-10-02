'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('BillWebz Root Layout Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 text-2xl font-bold">
            B
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white">BillWebz Workspace</h2>
            <p className="text-xs text-slate-400">
              An unexpected layout state was encountered. Click below to refresh your billing session safely.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
