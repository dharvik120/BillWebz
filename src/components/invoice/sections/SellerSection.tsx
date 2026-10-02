'use client';

import React from 'react';
import { Building, ChevronDown, ChevronUp } from 'lucide-react';
import { StateSelector } from '@/components/invoice/StateSelector';
import { BentoCard } from '@/components/invoice/BentoCard';

interface SellerSectionProps {
  sellerDetails: {
    name: string;
    gstin?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
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
            State / UT (Manual or Dropdown)
          </label>
          <StateSelector
            value={sellerDetails.state || ''}
            onChange={(val) => onUpdateField('state', val)}
            placeholder="Type or select seller state..."
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

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Upload Logo
          </label>
          <div className="flex items-center gap-3">
            {sellerDetails.logoUrl && (
              <img 
                src={sellerDetails.logoUrl} 
                alt="Logo Preview" 
                className="w-10 h-10 object-contain rounded-lg border border-border bg-white p-1"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImageUpload(e, 'logoUrl')}
              className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
            />
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
