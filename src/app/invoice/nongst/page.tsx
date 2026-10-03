'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NonGstInvoicePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/invoice/gst?mode=nongst');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="animate-spin inline-block h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loading Non-GST Invoice Editor...</p>
      </div>
    </div>
  );
}
