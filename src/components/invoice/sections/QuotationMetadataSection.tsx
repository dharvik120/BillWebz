'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { BentoCard } from '@/components/invoice/BentoCard';

interface QuotationMetadataSectionProps {
  metadata: {
    invoiceNumber: string;
    referenceNumber?: string;
    invoiceDate: string;
    validityDays?: number;
    validUntilDate?: string;
    expectedDeliveryDate?: string;
    paymentTerms?: string;
    [key: string]: any;
  };
  onUpdateField: (field: string, value: any) => void;
  onUpdateValidityDays: (days: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export function QuotationMetadataSection({
  metadata,
  onUpdateField,
  onUpdateValidityDays,
  isCollapsed = false,
  onToggleCollapse,
  accentColor = 'emerald',
}: QuotationMetadataSectionProps) {
  return (
    <BentoCard
      id="metadata"
      title="Estimation Dates & Validity"
      subtitle="Quotation number, proposal date, expiry validity & payment terms"
      icon={Calendar}
      badgeColor={accentColor}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Quotation Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={metadata.invoiceNumber}
            onChange={(e) => onUpdateField('invoiceNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Reference / Inquiry No
          </label>
          <input
            type="text"
            placeholder="e.g. INQ-2026-004"
            value={metadata.referenceNumber || ''}
            onChange={(e) => onUpdateField('referenceNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Quotation Date
          </label>
          <input
            type="date"
            value={metadata.invoiceDate}
            onChange={(e) => onUpdateField('invoiceDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Validity (Days)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="30"
            value={metadata.validityDays === 0 ? '' : (metadata.validityDays ?? '')}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              let raw = e.target.value;
              if (!/^\d*$/.test(raw)) return;
              if (/^0\d+/.test(raw)) raw = raw.replace(/^0+/, '');
              const val = raw === '' ? 0 : parseInt(raw, 10) || 0;
              onUpdateValidityDays(val);
            }}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Valid Until Date
          </label>
          <input
            type="date"
            value={metadata.validUntilDate || ''}
            onChange={(e) => onUpdateField('validUntilDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Expected Delivery / Execution Time
          </label>
          <input
            type="text"
            placeholder="e.g. 7-10 Business Days"
            value={metadata.expectedDeliveryDate || ''}
            onChange={(e) => onUpdateField('expectedDeliveryDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Payment Terms
          </label>
          <input
            type="text"
            placeholder="e.g. 50% Advance, 50% on completion"
            value={metadata.paymentTerms || ''}
            onChange={(e) => onUpdateField('paymentTerms', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
          />
        </div>
      </div>
    </BentoCard>
  );
}
