'use client';

import React from 'react';
import { FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { BentoCard } from '@/components/invoice/BentoCard';

interface TermsSectionProps {
  termsAndConditions?: string;
  notes?: string;
  declaration?: string;
  authorizedSignatoryName?: string;
  isComputerGenerated?: boolean;
  watermark?: boolean;
  onUpdateField: (field: string, value: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export function TermsSection({
  termsAndConditions = '',
  notes = '',
  declaration = '',
  authorizedSignatoryName = '',
  isComputerGenerated = true,
  watermark = true,
  onUpdateField,
  isCollapsed = false,
  onToggleCollapse,
  accentColor = 'blue',
}: TermsSectionProps) {
  const toggleColorClass = accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  return (
    <BentoCard
      id="terms"
      title="Terms, Declaration & Notes"
      subtitle="Legal disclaimers, warranty notes, watermark & signature name"
      icon={FileText}
      badgeColor={accentColor}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className="grid grid-cols-1 gap-4 text-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Terms & Conditions
          </label>
          <textarea
            placeholder="Payment terms, dispute jurisdiction, warranty/return policies..."
            value={termsAndConditions}
            onChange={(e) => onUpdateField('termsAndConditions', e.target.value)}
            rows={3}
            className="w-full p-3 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Invoice Notes (Internal/External)
          </label>
          <textarea
            placeholder="Special delivery notes or thank you messages..."
            value={notes}
            onChange={(e) => onUpdateField('notes', e.target.value)}
            rows={2}
            className="w-full p-3 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Legal Declaration
          </label>
          <textarea
            placeholder="We declare that this document shows the actual price of the goods and that all particulars are true and correct..."
            value={declaration}
            onChange={(e) => onUpdateField('declaration', e.target.value)}
            rows={2}
            className="w-full p-3 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Authorized Signatory Name
            </label>
            <input
              type="text"
              placeholder="e.g. Authorized Signatory"
              value={authorizedSignatoryName}
              onChange={(e) => onUpdateField('authorizedSignatoryName', e.target.value)}
              className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={() => onUpdateField('isComputerGenerated', !isComputerGenerated)}
              className="focus:outline-none cursor-pointer"
            >
              {isComputerGenerated ? (
                <ToggleRight className={`h-8 w-8 ${toggleColorClass}`} />
              ) : (
                <ToggleLeft className="h-8 w-8 text-muted-foreground/50" />
              )}
            </button>
            <span className="text-xs font-bold text-foreground">Show "Computer Generated" Footer</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border/40 pt-4">
          <button
            type="button"
            onClick={() => onUpdateField('watermark', !watermark)}
            className="focus:outline-none cursor-pointer"
          >
            {watermark ? (
              <ToggleRight className={`h-8 w-8 ${toggleColorClass}`} />
            ) : (
              <ToggleLeft className="h-8 w-8 text-muted-foreground/50" />
            )}
          </button>
          <div>
            <span className="text-xs font-bold text-foreground">Show "ORIGINAL" Diagonal Watermark</span>
            <p className="text-[11px] text-muted-foreground">Watermark for original recipient document copy</p>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
