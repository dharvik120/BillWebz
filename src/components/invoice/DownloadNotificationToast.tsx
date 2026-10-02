'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ExternalLink, X, CheckCircle2, FolderDown } from 'lucide-react';

interface ToastData {
  id: string;
  filename: string;
  blobUrl?: string;
  message?: string;
}

export function DownloadNotificationToast() {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    setMounted(true);
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ filename: string; blobUrl?: string; message?: string }>;
      if (!customEvent.detail) return;
      const { filename, blobUrl, message } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => [...prev, { id, filename, blobUrl, message }]);

      // Auto dismiss after 9 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 9000);
    };

    window.addEventListener('billwebz-download-notification', handleNotification);
    return () => {
      window.removeEventListener('billwebz-download-notification', handleNotification);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenPdf = (blobUrl?: string) => {
    if (blobUrl && typeof window !== 'undefined') {
      window.open(blobUrl, '_blank');
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 max-w-[92vw] sm:max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto bg-slate-900/95 dark:bg-slate-900/95 text-white border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-300">
                    PDF Downloaded Successfully!
                  </h4>
                  <p className="text-xs text-slate-300 font-mono mt-0.5 break-all line-clamp-1">
                    {toast.filename}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-300 bg-white/5 rounded-xl px-3 py-2 border border-white/10 flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {toast.message || 'Saved to your device’s Downloads folder.'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {toast.blobUrl && (
                <button
                  type="button"
                  onClick={() => handleOpenPdf(toast.blobUrl)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open PDF</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
