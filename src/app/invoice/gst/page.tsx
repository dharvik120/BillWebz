'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Save, 
  Printer, 
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
  FileCheck
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

const emptyInvoice = (defaultSeller: any, defaultTerms: any, defaultDec: any, defaultCurr: any): Invoice => ({
  type: 'gst',
  status: 'Draft',
  theme: 'blue',
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
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reverseCharge: false,
  },
  items: [
    {
      id: 'item-1',
      name: 'Sample Consultation',
      description: 'Business consultation and software review service.',
      hsnSac: '998311',
      quantity: 1,
      unit: 'Service',
      rate: 15000,
      isTaxInclusive: false,
      discountPercent: 5,
      discountAmount: 750,
      gstPercent: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cessPercent: 0,
      cessAmount: 0,
      taxableValue: 14250,
      finalAmount: 16815
    }
  ],
  totals: {
    subtotal: 15000,
    discountTotal: 750,
    taxableTotal: 14250,
    cgstTotal: 1282.50,
    sgstTotal: 1282.50,
    igstTotal: 0,
    cessTotal: 0,
    roundOff: 0,
    grandTotal: 16815,
    amountInWords: 'Sixteen Thousand Eight Hundred and Fifteen Rupees Only'
  },
  termsAndConditions: defaultTerms,
  notes: 'Thank you for your business.',
  declaration: defaultDec,
  authorizedSignatoryName: '',
  isComputerGenerated: true,
  showTax: true,
  createdAt: 0,
  updatedAt: 0
});

function GstInvoiceForm() {
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
      setInitialData(emptyInvoice(defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency));
    }
  }, [editId, invoices, defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency]);

  // 2. Setup Undo Redo Hook once initialData loads
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
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

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
    }, 3000); // Auto-saves changes to IndexedDB after 3s idle time
    return () => clearTimeout(timer);
  }, [invoiceData, saveInvoice]);

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="animate-spin inline-block h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Handle nested form value updates with history tracking
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

      // Auto-recalculate totals if relevant calculation inputs change
      if (
        section === 'sellerDetails' && field === 'state' ||
        section === 'buyerDetails' && (field === 'state' || field === 'placeOfSupply') ||
        section === 'currency'
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

  // Handle line items modification
  const handleItemsChange = (newItems: LineItem[]) => {
    setInvoiceData((prev: Invoice | null) => {
      if (!prev) return prev;
      const next = { ...prev };
      const calcs = calculateInvoiceTotals(
        newItems,
        next.sellerDetails.state || '',
        next.buyerDetails.placeOfSupply || '',
        next.currency.code,
        next.showTax
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
    const text = `Hi, please find attached the Invoice from ${invoiceData.sellerDetails.name}. Total amount due is ${invoiceData.currency.symbol}${invoiceData.totals.grandTotal}.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };



  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Sub-Header ToolBar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-border/40 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-secondary rounded-lg border border-border/30 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-extrabold text-lg flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" /> GST Tax Invoice
            </h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase font-mono">Draft Auto-Saved</span>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex border border-border/30 rounded-lg overflow-hidden bg-secondary">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 hover:bg-card disabled:opacity-40 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <div className="w-px bg-border/20" />
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 hover:bg-card disabled:opacity-40 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Theme selection */}
          <select
            value={invoiceData.theme}
            onChange={(e) => updateField('theme' as any, '', e.target.value as InvoiceTheme)}
            className="px-2.5 py-2 border border-border rounded-lg text-xs font-semibold bg-background"
            title="Select Template Theme Color"
          >
            <option value="blue">Blue Corporate</option>
            <option value="slate">Slate Slate</option>
            <option value="emerald">Emerald Forest</option>
            <option value="charcoal">Charcoal Minimal</option>
            <option value="gold">Amber Gold</option>
          </select>

          {/* Paper Size selector */}
          <select
            value={invoiceData.paperSize}
            onChange={(e) => updateField('paperSize' as any, '', e.target.value as PaperSize)}
            className="px-2.5 py-2 border border-border rounded-lg text-xs font-semibold bg-background"
            title="Select Page Dimensions"
          >
            <option value="a4">Standard A4</option>
            <option value="letter">US Letter</option>
            <option value="thermal80">80mm Receipt</option>
          </select>

          {/* Currency selection */}
          <select
            value={invoiceData.currency.code}
            onChange={(e) => {
              const code = e.target.value;
              const symbols: any = { INR: '₹', USD: '$', EUR: '€', AED: 'AED ' };
              setInvoiceData((prev: Invoice | null) => {
                if (!prev) return prev;
                const next = {
                  ...prev,
                  currency: { code, symbol: symbols[code] || '$' }
                };
                const calcs = calculateInvoiceTotals(
                  next.items,
                  next.sellerDetails.state || '',
                  next.buyerDetails.placeOfSupply || '',
                  next.currency.code,
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
          {/* Billing Type Configuration */}
          <div className="border border-border/70 rounded-2xl p-5 bg-card shadow-sm text-xs space-y-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Billing Type</h3>
            <div>
              <label className="block text-slate-500 font-semibold mb-1.5">Select Billing Mode</label>
              <select
                value={invoiceData.showTax ? 'gst' : 'nongst'}
                onChange={(e) => {
                  const isGst = e.target.value === 'gst';
                  setInvoiceData((prev: Invoice | null) => {
                    if (!prev) return prev;
                    const nextItems = prev.items.map(item => ({
                      ...item,
                      gstPercent: isGst ? 18 : 0,
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
                      isGst
                    );
                    return {
                      ...prev,
                      showTax: isGst,
                      items: calcs.items,
                      totals: calcs.totals
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="gst">GST Billing (GST Taxes & Calculations)</option>
                <option value="nongst">Non-GST / Flat Billing (No GST or Tax details)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {invoiceData.showTax
                  ? "Standard tax invoice formatting. Shows HSN/SAC, GST, CGST, and SGST/IGST breakdowns."
                  : "Simple billing invoice formatting. The document title changes to \"INVOICE\" and hides all GST/tax values."}
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
                      value={invoiceData.sellerDetails.gstin}
                      onChange={(e) => updateField('sellerDetails', 'gstin', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.phone}
                      onChange={(e) => updateField('sellerDetails', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={invoiceData.sellerDetails.email}
                      onChange={(e) => updateField('sellerDetails', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Website</label>
                    <input
                      type="text"
                      value={invoiceData.sellerDetails.website}
                      onChange={(e) => updateField('sellerDetails', 'website', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Billing Address</label>
                    <textarea
                      value={invoiceData.sellerDetails.address}
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
                      value={invoiceData.sellerDetails.pincode}
                      onChange={(e) => updateField('sellerDetails', 'pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Logo/Signature uploads */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Upload Business Logo</label>
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

            {/* Section 2: Buyer Details */}
            <div>
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'buyer' ? '' : 'buyer')}
                className="w-full flex items-center justify-between p-5 border-b border-border/40 font-bold hover:bg-muted/10 text-left text-sm text-foreground/90 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-blue-600" /> Buyer Customer Details
                </span>
                <span>{activeAccordion === 'buyer' ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === 'buyer' && (
                <div className="p-5 border-b border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={invoiceData.buyerDetails.name}
                      onChange={(e) => updateField('buyerDetails', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Company Name</label>
                    <input
                      type="text"
                      value={invoiceData.buyerDetails.companyName}
                      onChange={(e) => updateField('buyerDetails', 'companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">GSTIN</label>
                    <input
                      type="text"
                      placeholder="07AAAAA1111A1Z1"
                      value={invoiceData.buyerDetails.gstin}
                      onChange={(e) => updateField('buyerDetails', 'gstin', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={invoiceData.buyerDetails.phone}
                      onChange={(e) => updateField('buyerDetails', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Billing Address</label>
                    <textarea
                      value={invoiceData.buyerDetails.billingAddress}
                      onChange={(e) => updateField('buyerDetails', 'billingAddress', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Shipping Address (Leave empty if same)</label>
                    <textarea
                      value={invoiceData.buyerDetails.shippingAddress}
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

            {/* Section 3: Invoice Metadata */}
            <div>
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'metadata' ? '' : 'metadata')}
                className="w-full flex items-center justify-between p-5 border-b border-border/40 font-bold hover:bg-muted/10 text-left text-sm text-foreground/90 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" /> Invoice Dates & Logistics
                </span>
                <span>{activeAccordion === 'metadata' ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === 'metadata' && (
                <div className="p-5 border-b border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceData.metadata.invoiceNumber}
                      onChange={(e) => updateField('metadata', 'invoiceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Reference Number</label>
                    <input
                      type="text"
                      value={invoiceData.metadata.referenceNumber || ''}
                      onChange={(e) => updateField('metadata', 'referenceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceData.metadata.invoiceDate}
                      onChange={(e) => updateField('metadata', 'invoiceDate', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Due Date</label>
                    <input
                      type="date"
                      value={invoiceData.metadata.dueDate}
                      onChange={(e) => updateField('metadata', 'dueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Transport Mode</label>
                    <input
                      type="text"
                      placeholder="Road / Air / Ship"
                      value={invoiceData.metadata.transportMode || ''}
                      onChange={(e) => updateField('metadata', 'transportMode', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      placeholder="DL 01 XX 0000"
                      value={invoiceData.metadata.vehicleNumber || ''}
                      onChange={(e) => updateField('metadata', 'vehicleNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Dispatch Through</label>
                    <input
                      type="text"
                      value={invoiceData.metadata.dispatchThrough || ''}
                      onChange={(e) => updateField('metadata', 'dispatchThrough', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">E-way Bill Number</label>
                    <input
                      type="text"
                      value={invoiceData.metadata.ewayBillNumber || ''}
                      onChange={(e) => updateField('metadata', 'ewayBillNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Terms of Delivery</label>
                    <input
                      type="text"
                      value={invoiceData.metadata.termsOfDelivery || ''}
                      onChange={(e) => updateField('metadata', 'termsOfDelivery', e.target.value)}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => updateField('metadata', 'reverseCharge', !invoiceData.metadata.reverseCharge)}
                      className="text-blue-600 focus:outline-none"
                    >
                      {invoiceData.metadata.reverseCharge ? (
                        <ToggleRight className="h-8 w-8 text-blue-600" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-slate-400" />
                      )}
                    </button>
                    <span className="font-semibold text-slate-600">Apply Reverse Charge</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Bank Details & UPI QR */}
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
                    <label className="block text-slate-500 font-semibold mb-1">Merchant UPI ID (for QR Code)</label>
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
                    <label className="block text-slate-500 font-semibold mb-1">Invoice Notes (Internal/External)</label>
                    <textarea
                      value={invoiceData.notes || ''}
                      onChange={(e) => updateField('notes' as any, '', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border/80 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Legal Declaration</label>
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
                      <span className="font-semibold text-slate-600">Show &quot;Computer Generated&quot; Footer</span>
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
                    <span className="font-semibold text-slate-600">Show &quot;ORIGINAL&quot; Diagonal Watermark</span>
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
              <Eye className="h-4 w-4 text-blue-600" /> Live Print Preview
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

      {/* Hidden container for PDF export to avoid CSS scaling issue */}
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

export default function GstInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="animate-spin inline-block h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <GstInvoiceForm />
    </Suspense>
  );
}
