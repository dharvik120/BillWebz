'use client';

import React from 'react';
import { Building, ChevronDown, ChevronUp } from 'lucide-react';
import { INDIAN_STATES } from '@/components/invoice/StateSelector';
import { BentoCard } from '@/components/invoice/BentoCard';

interface SellerSectionProps {
  sellerDetails: {
    name: string;
    gstin?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;
    state?: string;
    pincode?: string;
    logoUrl?: string;
    signatureUrl?: string;
    [key: string]: any;
  };
  onUpdateField: (field: string, value: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  accentColor?: 'blue' | 'emerald' | 'indigo';
}

export function SellerSection({
  sellerDetails,
  onUpdateField,
  onImageUpload,
  isCollapsed = false,
  onToggleCollapse,
  accentColor = 'blue',
}: SellerSectionProps) {
  return (
    <BentoCard
      id="seller"
      title="Seller Business Details"
      subtitle="Your business identity, GSTIN, address, contact & branding"
      icon={Building}
      badgeColor={accentColor}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Business / Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. BillWebz Solutions LLP"
            value={sellerDetails.name || ''}
            onChange={(e) => onUpdateField('name', e.target.value)}
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
            value={sellerDetails.gstin || ''}
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
            value={sellerDetails.phone || ''}
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
            placeholder="support@company.com"
            value={sellerDetails.email || ''}
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
            value={sellerDetails.website || ''}
            onChange={(e) => onUpdateField('website', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Business Street Address
          </label>
          <textarea
            placeholder="Floor, building, street, landmark..."
            value={sellerDetails.address || ''}
            onChange={(e) => onUpdateField('address', e.target.value)}
            rows={2}
            className="w-full p-3 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            City
          </label>
          <input
            type="text"
            placeholder="e.g. Mundra, Mumbai, Delhi..."
            value={sellerDetails.city || ''}
            onChange={(e) => onUpdateField('city', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            State / UT
          </label>
          <input
            type="text"
            list="seller-states-list"
            placeholder="Type state (e.g. Maharashtra, Gujarat...)"
            value={sellerDetails.state || ''}
            onChange={(e) => onUpdateField('state', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
          <datalist id="seller-states-list">
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Country
          </label>
          <input
            type="text"
            placeholder="e.g. India"
            value={sellerDetails.country || ''}
            onChange={(e) => onUpdateField('country', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            PIN Code
          </label>
          <input
            type="text"
            placeholder="e.g. 110001"
            value={sellerDetails.pincode || ''}
            onChange={(e) => onUpdateField('pincode', e.target.value)}
            className="w-full h-11 px-3.5 bg-background border border-border/80 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Upload Business Logo (Full Quality Print Output)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-secondary/40 border border-border/70 rounded-2xl">
            {sellerDetails.logoUrl ? (
              <div className="relative group flex-shrink-0">
                <img 
                  src={sellerDetails.logoUrl} 
                  alt="Logo Preview" 
                  className="h-16 w-auto max-w-[150px] object-contain rounded-xl border border-border bg-white p-2 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => onUpdateField('logoUrl', '')}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md text-xs hover:bg-red-700 transition-colors"
                  title="Remove Logo"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="h-16 w-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground text-[10px] font-semibold flex-shrink-0">
                No Logo
              </div>
            )}
            <div className="flex-1 w-full min-w-0">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageUpload(e, 'logoUrl')}
                className="w-full text-xs text-muted-foreground file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition-all"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Upload your company or brand logo in PNG, JPG, or SVG format. The original resolution will be rendered cleanly on your invoices.
              </p>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Upload Authorized Signature
          </label>
          <div className="flex items-center gap-3">
            {sellerDetails.signatureUrl && (
              <img 
                src={sellerDetails.signatureUrl} 
                alt="Signature Preview" 
                className="w-16 h-10 object-contain rounded-lg border border-border bg-white p-1"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageUpload(e, 'signatureUrl')}
              className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
