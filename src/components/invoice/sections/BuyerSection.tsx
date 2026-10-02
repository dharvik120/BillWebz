'use client';

import React from 'react';
import { User } from 'lucide-react';
import { INDIAN_STATES } from '@/components/invoice/StateSelector';
import { BentoCard } from '@/components/invoice/BentoCard';

interface BuyerSectionProps {
  buyerDetails: {
    name: string;
    companyName?: string;
    contactPerson?: string;
    gstin?: string;
    phone?: string;
    email?: string;
    website?: string;
    billingAddress?: string;
    state?: string;
    stateCode?: string;
    country?: string;
    pincode?: string;
    placeOfSupply?: string;
    [key: string]: any;
  };
  onUpdateField: (field: string, value: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export function BuyerSection({
  buyerDetails,
  onUpdateField,
  isCollapsed = false,
  onToggleCollapse,
  accentColor = 'blue',
}: BuyerSectionProps) {
  return (
    <BentoCard
      id="buyer"
      title="Client / Buyer Details"
      subtitle="Client name, organization, GSTIN, addresses & place of supply"
      icon={User}
      badgeColor={accentColor}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Customer / Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={buyerDetails.name || ''}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Company / Organization Name
          </label>
          <input
            type="text"
            placeholder="e.g. Acme Enterprises Ltd."
            value={buyerDetails.companyName || ''}
            onChange={(e) => onUpdateField('companyName', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Contact Person (Attn)
          </label>
          <input
            type="text"
            placeholder="e.g. Procurement Manager"
            value={buyerDetails.contactPerson || ''}
            onChange={(e) => onUpdateField('contactPerson', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            GSTIN (Optional)
          </label>
          <input
            type="text"
            placeholder="07AAAAA1111A1Z1"
            value={buyerDetails.gstin || ''}
            onChange={(e) => onUpdateField('gstin', e.target.value.toUpperCase())}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+91 98765 43210"
            value={buyerDetails.phone || ''}
            onChange={(e) => onUpdateField('phone', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="client@company.com"
            value={buyerDetails.email || ''}
            onChange={(e) => onUpdateField('email', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Website URL
          </label>
          <input
            type="text"
            placeholder="www.company.com"
            value={buyerDetails.website || ''}
            onChange={(e) => onUpdateField('website', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Country
          </label>
          <input
            type="text"
            placeholder="e.g. India"
            value={buyerDetails.country || ''}
            onChange={(e) => onUpdateField('country', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Billing Address
          </label>
          <textarea
            placeholder="Complete street address, unit, building..."
            value={buyerDetails.billingAddress || ''}
            onChange={(e) => onUpdateField('billingAddress', e.target.value)}
            rows={2}
            className="w-full p-3 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Billing State / UT
          </label>
          <input
            type="text"
            list="buyer-states-list"
            placeholder="Type state (e.g. Maharashtra, Delhi, Gujarat...)"
            value={buyerDetails.state || ''}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateField('state', val);
              if (!buyerDetails.placeOfSupply || buyerDetails.placeOfSupply === buyerDetails.state) {
                onUpdateField('placeOfSupply', val);
              }
            }}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
          <datalist id="buyer-states-list">
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            State Code (GST)
          </label>
          <input
            type="text"
            placeholder="e.g. 07"
            value={buyerDetails.stateCode || ''}
            onChange={(e) => onUpdateField('stateCode', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            PIN Code / ZIP
          </label>
          <input
            type="text"
            placeholder="e.g. 110001"
            value={buyerDetails.pincode || ''}
            onChange={(e) => onUpdateField('pincode', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Place of Supply (State)
          </label>
          <input
            type="text"
            list="pos-states-list"
            placeholder="Type place of supply state..."
            value={buyerDetails.placeOfSupply || ''}
            onChange={(e) => onUpdateField('placeOfSupply', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
          <datalist id="pos-states-list">
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>
    </BentoCard>
  );
}
