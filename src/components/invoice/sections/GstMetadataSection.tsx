'use client';

import React from 'react';
import { Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { BentoCard } from '@/components/invoice/BentoCard';

interface GstMetadataSectionProps {
  metadata: {
    invoiceNumber: string;
    referenceNumber?: string;
    invoiceDate: string;
    dueDate?: string;
    transportMode?: string;
    vehicleNumber?: string;
    dispatchThrough?: string;
    ewayBillNumber?: string;
    termsOfDelivery?: string;
    reverseCharge?: boolean;
    [key: string]: any;
  };
  onUpdateField: (field: string, value: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export function GstMetadataSection({
  metadata,
  onUpdateField,
  isCollapsed = false,
  onToggleCollapse,
  accentColor = 'blue',
}: GstMetadataSectionProps) {
  return (
    <BentoCard
      id="metadata"
      title="Invoice Dates & Document Info"
      subtitle="Invoice numbering, issue date, due date & transport logistics"
      icon={Calendar}
      badgeColor={accentColor}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Invoice Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={metadata.invoiceNumber}
            onChange={(e) => onUpdateField('invoiceNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Reference / PO Number
          </label>
          <input
            type="text"
            placeholder="e.g. PO-2026-091"
            value={metadata.referenceNumber || ''}
            onChange={(e) => onUpdateField('referenceNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Invoice Date
          </label>
          <input
            type="date"
            value={metadata.invoiceDate}
            onChange={(e) => onUpdateField('invoiceDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            value={metadata.dueDate || ''}
            onChange={(e) => onUpdateField('dueDate', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Transport Mode
          </label>
          <input
            type="text"
            placeholder="Road / Air / Rail / Cargo"
            value={metadata.transportMode || ''}
            onChange={(e) => onUpdateField('transportMode', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Vehicle Number
          </label>
          <input
            type="text"
            placeholder="DL 01 XX 0000"
            value={metadata.vehicleNumber || ''}
            onChange={(e) => onUpdateField('vehicleNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Dispatch Through
          </label>
          <input
            type="text"
            placeholder="e.g. Bluedart Express / Direct"
            value={metadata.dispatchThrough || ''}
            onChange={(e) => onUpdateField('dispatchThrough', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            E-way Bill Number
          </label>
          <input
            type="text"
            placeholder="e.g. 121000000000"
            value={metadata.ewayBillNumber || ''}
            onChange={(e) => onUpdateField('ewayBillNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Terms of Delivery
          </label>
          <input
            type="text"
            placeholder="e.g. CIF / FOB / Door delivery included"
            value={metadata.termsOfDelivery || ''}
            onChange={(e) => onUpdateField('termsOfDelivery', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onUpdateField('reverseCharge', !metadata.reverseCharge)}
            className="text-blue-600 focus:outline-none cursor-pointer"
          >
            {metadata.reverseCharge ? (
              <ToggleRight className="h-8 w-8 text-blue-600" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-muted-foreground/50" />
            )}
          </button>
          <div>
            <span className="text-xs font-bold text-foreground">Apply Reverse Charge</span>
            <p className="text-[11px] text-muted-foreground">Check if recipient is liable to pay tax under RCM</p>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
