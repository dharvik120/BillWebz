'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Save, 
  Download, 
  Share2, 
  RefreshCw, 
  User, 
  Building, 
  Calendar, 
  ListPlus, 
  CreditCard, 
  FileText,
  Check, 
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { calculateInvoiceTotals } from '@/utils/gstCalculator';
import { downloadInvoicePdf } from '@/utils/pdfGenerator';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { LineItemsTable } from '@/components/invoice/LineItemsTable';
import { Invoice, LineItem, InvoiceStatus, InvoiceTheme, PaperSize } from '@/types/invoice';
import { countriesList, statesByCountry } from '@/utils/locationData';
import confetti from 'canvas-confetti';

const emptyQuotation = (defaultSeller: any, defaultTerms: any, defaultDec: any, defaultCurr: any): Invoice => ({
  type: 'quotation',
  status: 'Draft',
  theme: 'emerald', // Quotation defaults to emerald theme
  paperSize: 'a4',
  currency: { symbol: defaultCurr.symbol || '₹', code: defaultCurr.code || 'INR' },
  watermark: true,
  sellerDetails: { ...defaultSeller },
  buyerDetails: {
    name: '',
    companyName: '',
    gstin: '',
    phone: '',
    email: '',
    billingAddress: '',
    shippingAddress: '',
    state: defaultSeller.state || 'Delhi',
    country: 'IN',
    placeOfSupply: defaultSeller.state || 'Delhi',
  },
  metadata: {
    invoiceNumber: `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    validityDays: 30,
    validUntilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: '50% Advance, 50% On Delivery',
  },
  items: [
    {
      id: 'item-1',
      name: 'Professional Service Proposal',
      description: 'Business execution plan and service delivery details.',
      hsnSac: '998313',
      quantity: 1,
      unit: 'Service',
      rate: 35000,
      discountPercent: 0,
      discountAmount: 0,
      gstPercent: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cessPercent: 0,
      cessAmount: 0,
      taxableValue: 35000,
      finalAmount: 41300
    }
  ],
  totals: {
    subtotal: 35000,
    discountTotal: 0,
    taxableTotal: 35000,
    cgstTotal: 3150,
    sgstTotal: 3150,
    igstTotal: 0,
    cessTotal: 0,
    roundOff: 0,
    grandTotal: 41300,
    amountInWords: 'Forty One Thousand Three Hundred Rupees Only'
  },
  termsAndConditions: defaultTerms,
  notes: 'Quotation valid for 30 days only.',
  declaration: defaultDec,
  authorizedSignatoryName: '',
  isComputerGenerated: true,
  quotationNotes: 'This is a quotation proposal only. Terms are negotiable prior to project sign-off.',
  showTax: true,
  createdAt: 0,
  updatedAt: 0
});

function QuotationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const { 
    saveInvoice, 
    defaultSeller, 
    defaultTerms, 
    defaultDeclaration, 
    defaultCurrency,
    invoices,
    adminSettings
  } = useInvoiceStore();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 1. Initial State Load
  const [initialData, setInitialData] = useState<Invoice | null>(null);
  
  useEffect(() => {
    if (editId) {
      const match = invoices.find(inv => inv.id === editId);
      if (match) {
        setInitialData(match);
      }
    } else {
      setInitialData(emptyQuotation(defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency));
    }
  }, [editId, invoices, defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency]);

  // 2. Setup Undo Redo Hook
  const { 
    state: invoiceData, 
    set: setInvoiceData, 
    undo, 
    redo, 
    reset: resetUndoRedo,
    canUndo, 
    canRedo 
  } = useUndoRedo<Invoice | null>(null);

  useEffect(() => {
    if (initialData && !invoiceData) {
      resetUndoRedo(initialData);
    }
  }, [initialData, invoiceData, resetUndoRedo]);

  const [activeAccordion, setActiveAccordion] = useState<string>('seller');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Trigger PDF Generation
  const handleDownloadPdf = async () => {
    if (!invoiceData) return;

    // Subscription Lock check
    const isAdmin = sessionStorage.getItem('billwebz_admin_logged_in') === 'true';
    if (adminSettings?.isSubscriptionLocked && !isAdmin) {
      setShowUpgradeModal(true);
      return;
    }

    setIsExporting(true);
    try {
      // Mark as exported and save immediately
      const updatedInvoice = { ...invoiceData, isExported: true };
      setInvoiceData(updatedInvoice);
      try {
        await saveInvoice(updatedInvoice);
      } catch (dbErr) {
        console.warn("Database save failed, downloading PDF anyway:", dbErr);
      }

      const blob = await downloadInvoicePdf(
        'invoice-pdf-export-sheet', 
        'invoice',
        invoiceData.paperSize,
        updatedInvoice
      );
      if (blob) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Keyboard Shortcuts Bind
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: () => handleSaveDraft(true),
  });

  // Background Auto-Save
  useEffect(() => {
    if (!invoiceData) return;
    const timer = setTimeout(() => {
      saveInvoice(invoiceData);
    }, 3000);
    return () => clearTimeout(timer);
  }, [invoiceData, saveInvoice]);

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="animate-spin inline-block h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Handle nested form value updates
  const updateField = (section: keyof Invoice, field: string, value: any) => {
    setInvoiceData((prev: Invoice | null) => {
      if (!prev) return prev;
      
      let next: Invoice;
      if (field === '') {
        next = {
          ...prev,
          [section]: value
        };
      } else {
        next = {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [field]: value
          }
        };
      }

      // Automatically recalculate totals on state or placeOfSupply changes
      if (
        (section === 'sellerDetails' && field === 'state') ||
        (section === 'buyerDetails' && field === 'placeOfSupply')
      ) {
        const calcs = calculateInvoiceTotals(
          next.items,
          next.sellerDetails.state || '',
          next.buyerDetails.placeOfSupply || '',
          next.currency.code,
          next.showTax
        );
        next.items = calcs.items;
        next.totals = calcs.totals;
      }

      return next;
    });
  };

  // Handles updates to Line Items Table (recalculates totals on changes)
  const handleItemsChange = (newItems: LineItem[]) => {
    setInvoiceData((prev: Invoice | null) => {
      if (!prev) return prev;
      
      const next = { ...prev };
      const calcs = calculateInvoiceTotals(
        newItems,
        prev.sellerDetails.state || '',
        prev.buyerDetails.placeOfSupply || '',
        prev.currency.code,
        prev.showTax
      );
      next.items = calcs.items;
      next.totals = calcs.totals;
      return next;
    });
  };

  // File to Base64 encoder for Logos/Signatures
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateField('sellerDetails', field, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDraft = async (manual: boolean = false) => {
    try {
      await saveInvoice(invoiceData);
      if (manual) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Hi, please find attached the Quotation from ${invoiceData.sellerDetails.name}. Total estimated amount is ${invoiceData.currency.symbol}${invoiceData.totals.grandTotal}.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };



  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Dynamic Header */}
      <header className="bg-card border-b border-border/60 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between no-print sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 hover:bg-secondary rounded-lg transition-colors border border-border/40"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Service 3
              </span>
              <h1 className="text-base font-extrabold text-foreground tracking-tight">Quotation Creator</h1>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block">Draft quotations & estimations instantly</p>
          </div>
        </div>

        {/* Action button controls */}
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="hidden md:flex items-center border border-border/60 rounded-lg p-0.5 bg-secondary/50">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 hover:bg-card disabled:opacity-30 rounded transition-colors text-muted-foreground"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 hover:bg-card disabled:opacity-30 rounded transition-colors text-muted-foreground"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Theme customizer dropdown */}
          <select
            value={invoiceData.theme}
            onChange={(e) => updateField('theme', '', e.target.value as InvoiceTheme)}
            className="px-2.5 py-2 border border-border rounded-lg text-xs font-semibold bg-background"
            title="Invoice Accent Color Theme"
          >
            <option value="emerald">Emerald Theme</option>
            <option value="blue">Blue Theme</option>
            <option value="slate">Slate Theme</option>
            <option value="charcoal">Charcoal Theme</option>
            <option value="gold">Gold Theme</option>
          </select>

          {/* Paper Size selector */}
          <select
            value={invoiceData.paperSize}
            onChange={(e) => updateField('paperSize', '', e.target.value as PaperSize)}
            className="px-2.5 py-2 border border-border rounded-lg text-xs font-semibold bg-background"
            title="Page Output format"
          >
            <option value="a4">Standard A4 Size</option>
            <option value="letter">Letter Size</option>
          </select>

          {/* Currency selector */}
          <select
            value={invoiceData.currency.code}
            onChange={(e) => {
              const code = e.target.value;
              const symbol = code === 'INR' ? '₹' : code === 'USD' ? '$' : code === 'EUR' ? '€' : 'AED';
              setInvoiceData((prev: Invoice | null) => {
                if (!prev) return prev;
                const next = { ...prev, currency: { code, symbol } };
                const calcs = calculateInvoiceTotals(
                  next.items,
                  next.sellerDetails.state || '',
                  next.buyerDetails.placeOfSupply || '',
                  code,
                  next.showTax
                );
                next.items = calcs.items;
                next.totals = calcs.totals;
                return next;
              });
            }}
            className="px-2.5 py-2 border border-border rounded-lg text-xs font-semibold bg-background"
            title="Select Currency"
          >
            <option value="INR">Rupees (₹)</option>
            <option value="USD">Dollars ($)</option>
            <option value="EUR">Euros (€)</option>
            <option value="AED">Dirhams (AED)</option>
          </select>

          {/* Save Status triggers */}
          <button
            onClick={() => handleSaveDraft(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            {saveSuccess ? <Check className="h-4.5 w-4.5" /> : <Save className="h-4.5 w-4.5" />}
            {saveSuccess ? 'Saved!' : 'Save Draft'}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Share2 className="h-4.5 w-4.5" /> WhatsApp
          </button>
        </div>
      </header>

      {/* Editor Screen Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8 max-w-8xl w-full mx-auto align-stretch">
        
        {/* Left Side inputs form */}
        <div className="space-y-6 flex flex-col justify-start no-print">
          
          {/* Tax Configurations card */}
          <div className="border border-border/70 rounded-2xl p-5 bg-card shadow-sm text-xs space-y-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Tax Configurations</h3>
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Select Tax Mode</label>
              <select
                value={invoiceData.showTax ? 'show' : 'hide'}
                onChange={(e) => {
                  const isShow = e.target.value === 'show';
                  setInvoiceData((prev: Invoice | null) => {
                    if (!prev) return prev;
                    const nextItems = prev.items.map(item => ({
                      ...item,
                      gstPercent: isShow ? 18 : 0,
                      cgst: 0,
                      sgst: 0,
                      igst: 0,
                      cessPercent: 0,
                      cessAmount: 0
                    }));
                    const calcs = calculateInvoiceTotals(
                      nextItems,
                      prev.sellerDetails.state || '',
                      prev.buyerDetails.placeOfSupply || '',
                      prev.currency.code,
                      isShow
                    );
                    return {
                      ...prev,
                      showTax: isShow,
                      items: calcs.items,
                      totals: calcs.totals
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="show">Show Taxes (Include GST in Quotation)</option>
                <option value="hide">Hide Taxes (Flat Quotation Proposal)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {invoiceData.showTax
                  ? "Shows HSN/SAC, GST %, and central/state tax estimates inside the quote."
                  : "Hides all tax columns, percentage splits, and sums from the quotation sheet."}
              </p>
            </div>
          </div>

          {/* Accordion form container */}
          <div className="border border-border/70 rounded-2xl overflow-hidden bg-card shadow-sm">
            {/* Section 1: Seller Details */}
            <div>
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'seller' ? '' : 'seller')}
                className="w-full flex items-center justify-between p-5 border-b border-border/40 font-bold hover:bg-muted/10 text-left text-sm text-foreground/90 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <Building className="h-4.5 w-4.5 text-blue-600" /> Seller Business Details
                </span>
                <span>{activeAccordion === 'seller' ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === 'seller' && (
                <div className="p-5 border-b border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Business Name</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.name}
                      onChange={(e) => updateField('sellerDetails', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">GSTIN</label>
                    <input
                      type="text"
                      placeholder="07AAAAA1111A1Z1"
                      value={invoiceData.sellerDetails.gstin || ''}
                      onChange={(e) => updateField('sellerDetails', 'gstin', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.phone || ''}
                      onChange={(e) => updateField('sellerDetails', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={invoiceData.sellerDetails.email || ''}
                      onChange={(e) => updateField('sellerDetails', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Website</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.website || ''}
                      onChange={(e) => updateField('sellerDetails', 'website', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Billing Address</label>
                    <textarea
                      value={invoiceData.sellerDetails.address || ''}
                      onChange={(e) => updateField('sellerDetails', 'address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      list="countries-list"
                      placeholder="e.g. India"
                      value={invoiceData.sellerDetails.country || ''}
                      onChange={(e) => updateField('sellerDetails', 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">State</label>
                    <input
                      type="text"
                      list="states-list"
                      placeholder="e.g. Delhi"
                      value={invoiceData.sellerDetails.state || ''}
                      onChange={(e) => updateField('sellerDetails', 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Pincode</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.pincode || ''}
                      onChange={(e) => updateField('sellerDetails', 'pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Upload Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logoUrl')}
                      className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Upload Signature</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'signatureUrl')}
                      className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Buyer details */}
            <div>
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'buyer' ? '' : 'buyer')}
                className="w-full flex items-center justify-between p-5 border-b border-border/40 font-bold hover:bg-muted/10 text-left text-sm text-foreground/90 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-blue-600" /> Billed To (Client Details)
                </span>
                <span>{activeAccordion === 'buyer' ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === 'buyer' && (
                <div className="p-5 border-b border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Client Name</label>
                    <input
                      type="text"
                      placeholder="Individual Name"
                      value={invoiceData.buyerDetails.name}
                      onChange={(e) => updateField('buyerDetails', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Company Name</label>
                    <input
                      type="text"
                      placeholder="Business Name"
                      value={invoiceData.buyerDetails.companyName || ''}
                      onChange={(e) => updateField('buyerDetails', 'companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">GSTIN</label>
                    <input
                      type="text"
                      placeholder="Client GSTIN"
                      value={invoiceData.buyerDetails.gstin || ''}
                      onChange={(e) => updateField('buyerDetails', 'gstin', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={invoiceData.buyerDetails.phone || ''}
                      onChange={(e) => updateField('buyerDetails', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Billing Address</label>
                    <textarea
                      value={invoiceData.buyerDetails.billingAddress || ''}
                      onChange={(e) => updateField('buyerDetails', 'billingAddress', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Shipping Address (Leave empty if same)</label>
                    <textarea
                      value={invoiceData.buyerDetails.shippingAddress || ''}
                      onChange={(e) => updateField('buyerDetails', 'shippingAddress', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      list="countries-list"
                      placeholder="e.g. India"
                      value={invoiceData.buyerDetails.country || ''}
                      onChange={(e) => updateField('buyerDetails', 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Billing State</label>
                    <input
                      type="text"
                      list="states-list"
                      placeholder="e.g. Delhi"
                      value={invoiceData.buyerDetails.state || ''}
                      onChange={(e) => updateField('buyerDetails', 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Place of Supply (State)</label>
                    <input
                      type="text"
                      list="states-list"
                      placeholder="e.g. Delhi"
                      value={invoiceData.buyerDetails.placeOfSupply || ''}
                      onChange={(e) => updateField('buyerDetails', 'placeOfSupply', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Quotation Metadata */}
            <div>
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'metadata' ? '' : 'metadata')}
                className="w-full flex items-center justify-between p-5 border-b border-border/40 font-bold hover:bg-muted/10 text-left text-sm text-foreground/90 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" /> Estimation Dates & Info
                </span>
                <span>{activeAccordion === 'metadata' ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === 'metadata' && (
                <div className="p-5 border-b border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Quotation Number</label>
                    <input
                      type="text"
                      value={invoiceData.metadata.invoiceNumber}
                      onChange={(e) => updateField('metadata', 'invoiceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Reference/Inquiry No</label>
                    <input
                      type="text"
                      value={invoiceData.metadata.referenceNumber || ''}
                      onChange={(e) => updateField('metadata', 'referenceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Quotation Date</label>
                    <input
                      type="date"
                      value={invoiceData.metadata.invoiceDate}
                      onChange={(e) => updateField('metadata', 'invoiceDate', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Validity (Days)</label>
                    <input
                      type="number"
                      value={invoiceData.metadata.validityDays || 30}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const dateLimit = new Date(new Date(invoiceData.metadata.invoiceDate).getTime() + val * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setInvoiceData((prev: Invoice | null) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              validityDays: val,
                              validUntilDate: dateLimit
                            }
                          };
                        });
                      }}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Valid Until Date</label>
                    <input
                      type="date"
                      value={invoiceData.metadata.validUntilDate || ''}
                      onChange={(e) => updateField('metadata', 'validUntilDate', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Expected Delivery/Execution Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 2-3 Weeks"
                      value={invoiceData.metadata.expectedDeliveryDate || ''}
                      onChange={(e) => updateField('metadata', 'expectedDeliveryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Proposed Payment Milestones</label>
                    <input
                      type="text"
                      placeholder="e.g. 50% Advance, 50% On Handover"
                      value={invoiceData.metadata.paymentTerms || ''}
                      onChange={(e) => updateField('metadata', 'paymentTerms', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Bank Details */}
            <div>
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'bank' ? '' : 'bank')}
                className="w-full flex items-center justify-between p-5 border-b border-border/40 font-bold hover:bg-muted/10 text-left text-sm text-foreground/90 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-blue-600" /> Remittance & Bank Details
                </span>
                <span>{activeAccordion === 'bank' ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === 'bank' && (
                <div className="p-5 border-b border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.bankName || ''}
                      onChange={(e) => updateField('sellerDetails', 'bankName', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Account Number</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.accountNumber || ''}
                      onChange={(e) => updateField('sellerDetails', 'accountNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.ifsc || ''}
                      onChange={(e) => updateField('sellerDetails', 'ifsc', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Branch</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.branch || ''}
                      onChange={(e) => updateField('sellerDetails', 'branch', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Merchant UPI ID (for Payment QR)</label>
                    <input
                      type="text"
                      placeholder="merchant@upi"
                      value={invoiceData.sellerDetails.upiId || ''}
                      onChange={(e) => updateField('sellerDetails', 'upiId', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Additional Legal Statements */}
            <div>
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'additional' ? '' : 'additional')}
                className="w-full flex items-center justify-between p-5 border-b border-border/40 font-bold hover:bg-muted/10 text-left text-sm text-foreground/90 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-blue-600" /> Additional Notes & Declarations
                </span>
                <span>{activeAccordion === 'additional' ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === 'additional' && (
                <div className="p-5 border-b border-border/40 grid grid-cols-1 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Terms & Conditions</label>
                    <textarea
                      value={invoiceData.termsAndConditions || ''}
                      onChange={(e) => updateField('termsAndConditions' as any, '', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Proposal/Quotation Notes</label>
                    <textarea
                      value={invoiceData.quotationNotes || ''}
                      onChange={(e) => updateField('quotationNotes' as any, '', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Quotation Footer Notes</label>
                    <textarea
                      value={invoiceData.notes || ''}
                      onChange={(e) => updateField('notes' as any, '', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Declaration Statement</label>
                    <textarea
                      value={invoiceData.declaration || ''}
                      onChange={(e) => updateField('declaration' as any, '', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Authorized Signatory Name</label>
                      <input
                        type="text"
                        value={invoiceData.authorizedSignatoryName || ''}
                        onChange={(e) => updateField('authorizedSignatoryName' as any, '', e.target.value)}
                        className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 pt-5">
                      <button
                        type="button"
                        onClick={() => updateField('isComputerGenerated' as any, '', !invoiceData.isComputerGenerated)}
                        className="text-blue-600 focus:outline-none"
                      >
                        {invoiceData.isComputerGenerated ? (
                          <ToggleRight className="h-8 w-8 text-blue-600" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-slate-400" />
                        )}
                      </button>
                      <span className="font-semibold text-slate-600">Show &quot;Computer Generated&quot; Footnote</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => updateField('watermark' as any, '', !invoiceData.watermark)}
                      className="text-blue-600 focus:outline-none"
                    >
                      {invoiceData.watermark ? (
                        <ToggleRight className="h-8 w-8 text-blue-600" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-slate-400" />
                      )}
                    </button>
                    <span className="font-semibold text-slate-600">Show &quot;QUOTATION&quot; Diagonal Watermark</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line items section */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm">
            <LineItemsTable
              items={invoiceData.items}
              onChange={handleItemsChange}
              currencySymbol={invoiceData.currency.symbol}
              showTax={invoiceData.showTax}
            />
          </div>
        </div>

        {/* Right Side live print-size preview container */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between no-print">
            <h3 className="font-extrabold text-sm text-foreground/80 uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-600" /> Live Print Preview
            </h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full font-mono uppercase">
              Scale to Fit View
            </span>
          </div>

          {/* Scaled viewport wrapping preview */}
          <div className="flex-1 min-h-[500px] border border-border/50 rounded-2xl bg-secondary/30 p-2 overflow-auto max-h-[85vh] preview-container-parent">
            <div className="scale-75 origin-top sm:scale-[0.8] md:scale-[0.85] lg:scale-95 xl:scale-100 transition-all duration-300 preview-scale-wrapper">
              <InvoicePreview invoice={invoiceData} id="invoice-render-sheet" />
            </div>
          </div>
        </div>

      </div>

      <footer className="bg-card border-t border-border/60 py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© 2026 BillWebz. All rights reserved.</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">Created By Webz Technologies</span>
        </div>
      </footer>

      {/* Hidden container for PDF export */}
      <div className="absolute left-[-9999px] top-0 pointer-events-none no-print">
        <InvoicePreview invoice={invoiceData} id="invoice-pdf-export-sheet" />
      </div>
      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="text-center mb-6">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">Premium Feature</span>
              <h3 className="text-2xl font-extrabold mt-2">Subscription Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                To download and share professional invoices, please upgrade to one of our business plans below:
              </p>
            </div>
            
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {adminSettings?.pricingPlans?.map((plan) => (
                <div key={plan.id} className={`border p-4 rounded-xl flex flex-col justify-between gap-3 relative ${plan.isPopular ? 'border-blue-500 bg-blue-500/5' : 'border-border'}`}>
                  {plan.isPopular && (
                    <span className="absolute top-0 right-4 -translate-y-1/2 px-2.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
                      POPULAR
                    </span>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">{plan.name}</h4>
                      <p className="text-2xl font-black text-foreground mt-1">
                        {plan.price}
                        <span className="text-xs text-muted-foreground font-normal"> / {plan.period}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => alert(`Redirecting to payment checkout for ${plan.name}...`)}
                      className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'}`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border/40 pt-3 text-[10px] text-muted-foreground">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center text-xs text-slate-400">
              Need assistance? Contact us at <a href={`mailto:${adminSettings?.contactEmail}`} className="text-blue-500 font-semibold">{adminSettings?.contactEmail}</a>
            </div>
          </div>
        </div>
      )}

      {/* Autocomplete Datalists */}
      <datalist id="countries-list">
        <option value="India" />
        <option value="United States" />
        <option value="United Kingdom" />
        <option value="United Arab Emirates" />
        <option value="Canada" />
        <option value="Australia" />
      </datalist>

      <datalist id="states-list">
        <option value="Delhi" />
        <option value="Maharashtra" />
        <option value="Karnataka" />
        <option value="Tamil Nadu" />
        <option value="Gujarat" />
        <option value="Uttar Pradesh" />
        <option value="West Bengal" />
        <option value="Telangana" />
        <option value="Andhra Pradesh" />
        <option value="Rajasthan" />
        <option value="Punjab" />
        <option value="Haryana" />
        <option value="California" />
        <option value="New York" />
        <option value="Texas" />
        <option value="Florida" />
        <option value="London" />
        <option value="Dubai" />
        <option value="Abu Dhabi" />
        <option value="Ontario" />
        <option value="Quebec" />
        <option value="British Columbia" />
        <option value="New South Wales" />
        <option value="Victoria" />
      </datalist>
    </div>
  );
}

export default function QuotationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="animate-spin inline-block h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <QuotationForm />
    </Suspense>
  );
}
