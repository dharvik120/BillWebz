'use client';

import React from 'react';
import { Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { BentoCard } from '@/components/invoice/BentoCard';

interface ProformaMetadataSectionProps {
  metadata: {
    invoiceNumber: string;
    referenceNumber?: string;
    invoiceDate: string;
    validityDays?: number;
    validUntilDate?: string;
    expectedDeliveryDate?: string;
    paymentTerms?: string;
    deliveryNote?: string;
    transportMode?: string;
    [key: string]: any;
  };
  showTax: boolean;
  onUpdateField: (field: string, value: any) => void;
  onUpdateValidityDays: (days: number) => void;
  onToggleTax: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export function ProformaMetadataSection({
  metadata,
  showTax,
  onUpdateField,
  onUpdateValidityDays,
  onToggleTax,
  isCollapsed = false,
  onToggleCollapse,
  accentColor = 'indigo',
}: ProformaMetadataSectionProps) {
  return (
    <BentoCard
      id="metadata"
      title="Proforma Dates & Validity"
      subtitle="Proforma document number, issue date, validity days & delivery notes"
      icon={Calendar}
      badgeColor={accentColor}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Proforma Invoice Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={metadata.invoiceNumber}
            onChange={(e) => onUpdateField('invoiceNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Reference / Inquiry No
          </label>
          <input
            type="text"
            placeholder="e.g. PI-REF-009"
            value={metadata.referenceNumber || ''}
            onChange={(e) => onUpdateField('referenceNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Proforma Date
          </label>
          <input
            type="date"
            value={metadata.invoiceDate}
            onChange={(e) => onUpdateField('invoiceDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Validity Days
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
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Proforma Valid Until Date
          </label>
          <input
            type="date"
            value={metadata.validUntilDate || ''}
            onChange={(e) => onUpdateField('validUntilDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Expected Delivery Date
          </label>
          <input
            type="date"
            value={metadata.expectedDeliveryDate || ''}
            onChange={(e) => onUpdateField('expectedDeliveryDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Payment Terms
          </label>
          <input
            type="text"
            placeholder="e.g. 50% Advance, 50% Net 30"
            value={metadata.paymentTerms || ''}
            onChange={(e) => onUpdateField('paymentTerms', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Delivery Note
          </label>
          <input
            type="text"
            placeholder="e.g. Dispatch after advance realization"
            value={metadata.deliveryNote || ''}
            onChange={(e) => onUpdateField('deliveryNote', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Vehicle / Transport Mode
          </label>
          <input
            type="text"
            placeholder="e.g. Courier / Hand Delivered"
            value={metadata.transportMode || ''}
            onChange={(e) => onUpdateField('transportMode', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        {/* Tax Toggler */}
        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onToggleTax}
            className="focus:outline-none cursor-pointer"
          >
            {showTax ? (
              <ToggleRight className="h-8 w-8 text-indigo-600" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-muted-foreground/50" />
            )}
          </button>
          <div>
            <span className="text-xs font-bold text-foreground">Apply GST Calculations</span>
            <p className="text-[11px] text-muted-foreground">Toggle standard GST tax calculations vs non-tax estimate</p>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
