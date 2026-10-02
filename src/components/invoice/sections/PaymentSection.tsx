'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import { BentoCard } from '@/components/invoice/BentoCard';

interface PaymentSectionProps {
  paymentDetails: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    ifsc?: string;
    accountType?: string;
    branch?: string;
    upiId?: string;
    paymentInstructions?: string;
    [key: string]: any;
  };
  sellerDetails: {
    bankName?: string;
    accountNumber?: string;
    name?: string;
    ifsc?: string;
    branch?: string;
    upiId?: string;
    [key: string]: any;
  };
  onUpdatePaymentField: (field: string, value: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export function PaymentSection({
  paymentDetails,
  sellerDetails,
  onUpdatePaymentField,
  isCollapsed = false,
  onToggleCollapse,
  accentColor = 'blue',
}: PaymentSectionProps) {
  return (
    <BentoCard
      id="payment"
      title="Bank & Payment Credentials"
      subtitle="Bank account details, IFSC, branch & UPI QR code link"
      icon={CreditCard}
      badgeColor={accentColor}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Bank Name
          </label>
          <input
            type="text"
            placeholder="e.g. HDFC Bank Ltd."
            value={paymentDetails?.bankName || sellerDetails?.bankName || ''}
            onChange={(e) => onUpdatePaymentField('bankName', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Account Number
          </label>
          <input
            type="text"
            placeholder="e.g. 50200012345678"
            value={paymentDetails?.accountNumber || sellerDetails?.accountNumber || ''}
            onChange={(e) => onUpdatePaymentField('accountNumber', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Account Holder Name
          </label>
          <input
            type="text"
            placeholder="e.g. Acme Technologies LLP"
            value={paymentDetails?.accountHolderName || sellerDetails?.name || ''}
            onChange={(e) => onUpdatePaymentField('accountHolderName', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            IFSC Code
          </label>
          <input
            type="text"
            placeholder="e.g. HDFC0001234"
            value={paymentDetails?.ifsc || sellerDetails?.ifsc || ''}
            onChange={(e) => onUpdatePaymentField('ifsc', e.target.value.toUpperCase())}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Account Type
          </label>
          <select
            value={paymentDetails?.accountType || 'Current'}
            onChange={(e) => onUpdatePaymentField('accountType', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs cursor-pointer"
          >
            <option value="Current">Current Account</option>
            <option value="Savings">Savings Account</option>
            <option value="Overdraft">Overdraft (OD)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Branch Name
          </label>
          <input
            type="text"
            placeholder="e.g. Connaught Place, New Delhi"
            value={paymentDetails?.branch || sellerDetails?.branch || ''}
            onChange={(e) => onUpdatePaymentField('branch', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            UPI ID / VPA (For Dynamic QR Code)
          </label>
          <input
            type="text"
            placeholder="e.g. merchant@upi"
            value={paymentDetails?.upiId || sellerDetails?.upiId || ''}
            onChange={(e) => onUpdatePaymentField('upiId', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Payment Instructions / Remarks
          </label>
          <input
            type="text"
            placeholder="e.g. Please quote invoice # in bank reference"
            value={paymentDetails?.paymentInstructions || ''}
            onChange={(e) => onUpdatePaymentField('paymentInstructions', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>
      </div>
    </BentoCard>
  );
}
