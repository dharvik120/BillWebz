'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Smartphone
} from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { InvoicePreview } from './InvoicePreview';

interface InvoicePreviewViewportProps {
  invoice: Invoice;
  id?: string;
  themeColor?: string;
}

export function InvoicePreviewViewport({
  invoice,
  id = 'invoice-render-sheet',
  themeColor = 'blue'
}: InvoicePreviewViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [isFitMode, setIsFitMode] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Standard A4 document target width in pixels
  const DOCUMENT_WIDTH = 800;
  // Approximate standard A4 document target height in pixels
  const DOCUMENT_HEIGHT = 1130;

  // Calculate dynamic scale to fit container width
  const calculateFitScale = useCallback((width: number) => {
    if (!width || width <= 0) return 0.5;
    // Leave horizontal margin/padding
    const availableWidth = Math.max(width - 24, 260);
    const fitScale = availableWidth / DOCUMENT_WIDTH;
    // Bound scale between 0.30 (small phone) and 1.0 (desktop)
    return Math.min(1.0, Math.max(0.30, Math.round(fitScale * 100) / 100));
  }, [DOCUMENT_WIDTH]);

  // Handle ResizeObserver on container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const width = el.clientWidth;
      setContainerWidth(width);
      if (isFitMode) {
        setScale(calculateFitScale(width));
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(el);
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isFitMode, calculateFitScale]);

  // Auto-enable Fit mode on smaller viewports upon initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsFitMode(true);
    }
  }, []);

  const handleZoomIn = () => {
    setIsFitMode(false);
    setScale(prev => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setIsFitMode(false);
    setScale(prev => Math.max(0.3, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleToggleFit = () => {
    if (!isFitMode) {
      setIsFitMode(true);
      if (containerRef.current) {
        setScale(calculateFitScale(containerRef.current.clientWidth));
      }
    } else {
      setIsFitMode(false);
      setScale(1.0);
    }
  };

  const handleResetOriginal = () => {
    setIsFitMode(false);
    setScale(1.0);
  };

  const scaledWidth = Math.round(DOCUMENT_WIDTH * scale);
  const scaledHeight = Math.round(DOCUMENT_HEIGHT * scale);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Interactive Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-card border border-border/80 shadow-xs no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs tracking-tight text-foreground flex items-center gap-1.5">
              Live Document Preview
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary font-bold text-muted-foreground uppercase">
                {invoice.paperSize || 'A4'}
              </span>
            </h3>
            <span className="text-[10px] text-muted-foreground hidden sm:inline-block">
              {isFitMode ? 'Auto-fitted to screen' : `Zoom: ${Math.round(scale * 100)}%`}
            </span>
          </div>
        </div>

        {/* Zoom & Fit Controller Group */}
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/50 text-xs">
          {/* Fit Screen Button */}
          <button
            type="button"
            onClick={handleToggleFit}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isFitMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/70'
            }`}
            title="Auto Fit entire document width to screen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Fit Screen</span>
          </button>

          <div className="w-px h-4 bg-border/40 mx-0.5" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.3}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/70 disabled:opacity-30 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          {/* Percentage */}
          <button
            type="button"
            onClick={handleResetOriginal}
            className="px-1.5 py-1 min-w-[42px] text-center font-mono text-[11px] font-bold text-foreground hover:text-blue-600 transition-colors"
            title="Reset to 100% scale"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 1.4}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/70 disabled:opacity-30 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Scroller Canvas */}
      <div 
        ref={containerRef}
        className="w-full min-h-[460px] max-h-[82vh] border border-border/70 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 p-2 sm:p-4 overflow-x-auto overflow-y-auto shadow-inner relative flex justify-center preview-container-parent"
        style={{
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Exact Layout Flow Placeholder (matches visual scaled size) */}
        <div
          className="transition-all duration-150 mx-auto"
          style={{
            width: `${scaledWidth}px`,
            minHeight: `${scaledHeight}px`,
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Unscaled 800px document scaled smoothly via CSS transform */}
          <div
            style={{
              width: `${DOCUMENT_WIDTH}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0
            }}
            className="shadow-xl rounded-sm"
          >
            <InvoicePreview invoice={invoice} id={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
