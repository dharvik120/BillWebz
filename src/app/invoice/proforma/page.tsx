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
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { calculateInvoiceTotals } from '@/utils/gstCalculator';
import { downloadInvoicePdf, triggerBlobDownload } from '@/utils/pdfGenerator';
import { DownloadNotificationToast } from '@/components/invoice/DownloadNotificationToast';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { InvoicePreviewViewport } from '@/components/invoice/InvoicePreviewViewport';
import { LineItemsTable } from '@/components/invoice/LineItemsTable';
import { BentoNav } from '@/components/invoice/BentoNav';
import { BentoCard } from '@/components/invoice/BentoCard';
import { SellerSection } from '@/components/invoice/sections/SellerSection';
import { BuyerSection } from '@/components/invoice/sections/BuyerSection';
import { PaymentSection } from '@/components/invoice/sections/PaymentSection';
import { TermsSection } from '@/components/invoice/sections/TermsSection';
import { ProformaMetadataSection } from '@/components/invoice/sections/ProformaMetadataSection';
import { Invoice, LineItem, InvoiceStatus, InvoiceTheme, PaperSize } from '@/types/invoice';
import { countriesList, statesByCountry } from '@/utils/locationData';
import { getNextDocumentNumber } from '@/utils/documentNumbering';
import confetti from 'canvas-confetti';

const getInitialSellerProfile = (fallback: any) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('billwebz_default_seller');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          if (parsed.state === 'Delhi') parsed.state = '';
          return { ...(fallback || {}), ...parsed };
        }
      }
    } catch (e) {}
  }
  return fallback || {};
};

const emptyProforma = (defaultSeller: any, defaultTerms: any, defaultDec: any, defaultCurr: any, existingInvoices: Invoice[] = []): Invoice => {
  const seller = getInitialSellerProfile(defaultSeller);
  return {
    type: 'proforma',
    status: 'Draft',
    theme: 'blue',
    paperSize: 'a4',
    currency: { symbol: defaultCurr?.symbol || '₹', code: defaultCurr?.code || 'INR' },
    watermark: true,
    sellerDetails: { 
      ...seller,
      state: (seller?.state === 'Delhi' ? '' : seller?.state) || '',
      country: (seller?.country === 'IN' ? '' : seller?.country) || '',
    },
    paymentDetails: {
      bankName: seller?.bankName || '',
      accountNumber: seller?.accountNumber || '',
      accountHolderName: seller?.name || '',
      ifsc: seller?.ifsc || '',
      branch: seller?.branch || '',
      accountType: 'Current',
      upiId: seller?.upiId || '',
      paymentInstructions: ''
    },
  buyerDetails: {
    name: '',
    companyName: '',
    contactPerson: '',
    gstin: '',
    phone: '',
    email: '',
    website: '',
    billingAddress: '',
    state: '',
    stateCode: '',
    country: '',
    pincode: '',
    placeOfSupply: '',
  },
  metadata: {
    invoiceNumber: getNextDocumentNumber('proforma', existingInvoices),
    invoiceDate: new Date().toISOString().split('T')[0],
    validityDays: 30,
    validUntilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: '50% Advance, 50% On Delivery',
  },
  items: [
    {
      id: 'item-1',
      name: 'Professional Website Design Quote',
      description: 'Responsive design, Next.js application setup, SEO optimization.',
      hsnSac: '998313',
      quantity: 1,
      unit: 'Service',
      rate: 35000,
      isTaxInclusive: false,
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
  quotationNotes: 'This is a quotation only. Deliverables will begin post advance remittance receipt.',
  showTax: true,
  createdAt: 0,
  updatedAt: 0
  };
};

function ProformaInvoiceForm() {
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
      setInitialData(emptyProforma(defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency, invoices));
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

  const [activeSection, setActiveSection] = useState<string>('all');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (id: string) => setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

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

      const { blob } = await downloadInvoicePdf(
        'invoice-pdf-export-sheet', 
        undefined,
        invoiceData.paperSize,
        updatedInvoice,
        true
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

  // Sync default seller details once loaded from store if current draft is blank
  useEffect(() => {
    if (invoiceData && !editId && defaultSeller?.name && !invoiceData.sellerDetails?.name) {
      setInvoiceData({
        ...invoiceData,
        sellerDetails: {
          ...invoiceData.sellerDetails,
          ...defaultSeller,
          state: defaultSeller.state === 'Delhi' ? '' : defaultSeller.state,
        },
        paymentDetails: {
          ...invoiceData.paymentDetails,
          bankName: defaultSeller.bankName || invoiceData.paymentDetails?.bankName || '',
          accountNumber: defaultSeller.accountNumber || invoiceData.paymentDetails?.accountNumber || '',
          accountHolderName: defaultSeller.name || invoiceData.paymentDetails?.accountHolderName || '',
          ifsc: defaultSeller.ifsc || invoiceData.paymentDetails?.ifsc || '',
          branch: defaultSeller.branch || invoiceData.paymentDetails?.branch || '',
          upiId: defaultSeller.upiId || invoiceData.paymentDetails?.upiId || '',
        }
      });
    }
  }, [defaultSeller, editId]);

  // Auto-persist business seller profile & settings to localStorage
  useEffect(() => {
    if (!invoiceData?.sellerDetails) return;
    const sellerName = (invoiceData.sellerDetails.name || '').trim();
    if (!sellerName) return;

    const timer = setTimeout(() => {
      try {
        const sellerProfile = {
          ...invoiceData.sellerDetails,
          bankName: invoiceData.paymentDetails?.bankName || invoiceData.sellerDetails.bankName,
          accountNumber: invoiceData.paymentDetails?.accountNumber || invoiceData.sellerDetails.accountNumber,
          accountHolderName: invoiceData.paymentDetails?.accountHolderName || invoiceData.sellerDetails.accountHolderName,
          ifsc: invoiceData.paymentDetails?.ifsc || invoiceData.sellerDetails.ifsc,
          branch: invoiceData.paymentDetails?.branch || invoiceData.sellerDetails.branch,
          upiId: invoiceData.paymentDetails?.upiId || invoiceData.sellerDetails.upiId,
        };
        localStorage.setItem('billwebz_default_seller', JSON.stringify(sellerProfile));
        if (invoiceData.termsAndConditions) {
          localStorage.setItem('billwebz_default_terms', invoiceData.termsAndConditions);
        }
        if (invoiceData.declaration) {
          localStorage.setItem('billwebz_default_declaration', invoiceData.declaration);
        }
        if (invoiceData.currency) {
          localStorage.setItem('billwebz_default_currency', JSON.stringify(invoiceData.currency));
        }
      } catch (e) {
        console.error('Error auto-saving seller defaults:', e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [
    invoiceData?.sellerDetails,
    invoiceData?.paymentDetails,
    invoiceData?.termsAndConditions,
    invoiceData?.declaration,
    invoiceData?.currency
  ]);

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

      // Recalculate totals if relevant inputs change
      if (
        section === 'sellerDetails' && field === 'state' ||
        section === 'buyerDetails' && (field === 'state' || field === 'placeOfSupply') ||
        section === 'currency' ||
        section === 'showTax' as any
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

  // File to Base64 encoder
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

  const updatePaymentField = (field: string, value: any) => {
    setInvoiceData((prev: Invoice | null) => {
      if (!prev) return prev;
      const currentPd = prev.paymentDetails || {
        bankName: prev.sellerDetails.bankName || '',
        accountNumber: prev.sellerDetails.accountNumber || '',
        accountHolderName: prev.sellerDetails.name || '',
        ifsc: prev.sellerDetails.ifsc || '',
        branch: prev.sellerDetails.branch || '',
        accountType: 'Current',
        upiId: prev.sellerDetails.upiId || '',
        paymentInstructions: ''
      };
      const updatedPd = { ...currentPd, [field]: value };
      const updatedSeller = { ...prev.sellerDetails };
      if (field === 'bankName') updatedSeller.bankName = value;
      if (field === 'accountNumber') updatedSeller.accountNumber = value;
      if (field === 'ifsc') updatedSeller.ifsc = value;
      if (field === 'branch') updatedSeller.branch = value;
      if (field === 'upiId') updatedSeller.upiId = value;

      return {
        ...prev,
        paymentDetails: updatedPd,
        sellerDetails: updatedSeller
      };
    });
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

  const handleShareWhatsApp = async () => {
    if (!invoiceData) return;
    setIsSharingWhatsApp(true);
    try {
      const clientName = invoiceData.buyerDetails?.name || 'Customer';
      const grandTotal = `${invoiceData.currency?.symbol || '₹'}${invoiceData.totals?.grandTotal || 0}`;
      const docNo = invoiceData.metadata?.invoiceNumber || '';
      const shareText = `Hi ${clientName},\n\nPlease find attached Proforma Invoice #${docNo} from ${invoiceData.sellerDetails?.name || 'BillWebz'}.\nTotal Amount Estimated: ${grandTotal}.\n\nThank you for your business!`;

      // 1. Generate the PDF
      const { blob, blobUrl, filename } = await downloadInvoicePdf(
        'invoice-pdf-export-sheet',
        undefined,
        invoiceData.paperSize,
        invoiceData,
        false
      );

      // 2. Mobile Web Share API with attached PDF file
      if (blob && typeof navigator !== 'undefined' && navigator.canShare) {
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
            text: shareText
          });
          return;
        }
      }

      // 3. Fallback for Desktop / non-file sharing: Download file and open WhatsApp
      if (blob) {
        triggerBlobDownload(blob, filename);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('billwebz-download-notification', {
              detail: {
                filename,
                blobUrl,
                message: `Proforma Invoice PDF saved to Downloads! Opening WhatsApp so you can attach it to your chat.`
              }
            })
          );
        }
      }

      const encodedText = encodeURIComponent(shareText);
      const rawPhone = (invoiceData.buyerDetails?.phone || '').replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
      const waUrl = cleanPhone 
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}` 
        : `https://api.whatsapp.com/send?text=${encodedText}`;
      window.open(waUrl, '_blank');
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('WhatsApp share error', err);
      }
    } finally {
      setIsSharingWhatsApp(false);
    }
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
              <Sparkles className="h-4.5 w-4.5 text-indigo-600" /> Proforma Invoice Builder
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
            className="h-10 px-3 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold bg-background text-foreground shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="blue">Blue Corporate</option>
            <option value="navy">Classic Navy</option>
            <option value="emerald">Emerald Forest</option>
            <option value="burgundy">Burgundy Wine</option>
            <option value="slate">Slate Modern</option>
            <option value="charcoal">Charcoal Minimal</option>
            <option value="monochrome">Pure Monochrome</option>
            <option value="gold">Amber Gold</option>
          </select>

          {/* Paper Size selector */}
          <select
            value={invoiceData.paperSize}
            onChange={(e) => updateField('paperSize' as any, '', e.target.value as PaperSize)}
            className="h-10 px-3 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold bg-background text-foreground shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            className="h-10 px-3 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold bg-background text-foreground shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="INR">Rupees (₹)</option>
            <option value="USD">Dollars ($)</option>
            <option value="EUR">Euros (€)</option>
            <option value="AED">Dirhams (AED)</option>
          </select>

          {/* Save Status triggers */}
          <button
            onClick={() => handleSaveDraft(true)}
            className="h-10 px-4 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            {saveSuccess ? <Check className="h-4.5 w-4.5" /> : <Save className="h-4.5 w-4.5" />}
            {saveSuccess ? 'Saved!' : 'Save Draft'}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="h-10 px-4 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>

          <button
            onClick={handleShareWhatsApp}
            disabled={isSharingWhatsApp}
            className="h-10 px-4 text-xs sm:text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSharingWhatsApp ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Share2 className="h-4.5 w-4.5" />}
            <span>{isSharingWhatsApp ? 'Sharing...' : 'WhatsApp'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Form / Preview Switcher */}
      <div className="lg:hidden sticky top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border/70 px-4 py-2 flex items-center justify-center no-print">
        <div className="w-full max-w-sm flex items-center p-1 rounded-2xl bg-secondary/80 border border-border/50 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              mobileTab === 'form'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Edit Form</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              mobileTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview Document</span>
          </button>
        </div>
      </div>

      {/* Editor Screen Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8 max-w-8xl w-full mx-auto align-stretch">
        
        {/* Left Side inputs form */}
        <div className={`space-y-6 flex flex-col justify-start no-print ${mobileTab === 'form' ? 'block' : 'hidden lg:block'}`}>
          {/* Quick Section Navigation Bar */}
          <BentoNav
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            accentColor="indigo"
            tabs={[
              { id: 'all', label: 'All Sections', icon: Layers },
              { id: 'seller', label: 'Business', icon: Building },
              { id: 'buyer', label: 'Client', icon: User },
              { id: 'metadata', label: 'Proforma Info', icon: Calendar },
              { id: 'items', label: 'Items & Rates', icon: ListPlus },
              { id: 'payment', label: 'Bank & Pay', icon: CreditCard },
              { id: 'terms', label: 'Terms & Notes', icon: FileText },
            ]}
          />

          {/* Tax / Proforma Billing Mode Card */}
          <div className="border border-border/80 rounded-2xl p-5 bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
                  Tax & Proforma Mode
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose between GST compliant proforma invoice or flat non-tax proforma
                </p>
              </div>
              <div className="flex items-center p-1 bg-secondary/80 rounded-xl border border-border/60 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceData((prev: Invoice | null) => {
                      if (!prev) return prev;
                      const nextItems = prev.items.map(item => ({
                        ...item,
                        gstPercent: 18,
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
                        true
                      );
                      return {
                        ...prev,
                        showTax: true,
                        items: calcs.items,
                        totals: calcs.totals
                      };
                    });
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    invoiceData.showTax
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  GST Proforma
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceData((prev: Invoice | null) => {
                      if (!prev) return prev;
                      const nextItems = prev.items.map(item => ({
                        ...item,
                        gstPercent: 0,
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
                        false
                      );
                      return {
                        ...prev,
                        showTax: false,
                        items: calcs.items,
                        totals: calcs.totals
                      };
                    });
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !invoiceData.showTax
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Non-GST Proforma
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/40">
              {invoiceData.showTax
                ? "Standard GST tax proforma breakdown. Shows HSN/SAC, GST, CGST, and SGST/IGST tax rates."
                : "Simple proforma estimate. The document displays pure line item rates without tax breakdowns."}
            </p>
          </div>

          {/* Section 1: Business Details (Seller) */}
          {(activeSection === 'all' || activeSection === 'seller') && (
            <SellerSection
              sellerDetails={invoiceData.sellerDetails}
              onUpdateField={(f, v) => updateField('sellerDetails', f, v)}
              onImageUpload={handleImageUpload}
              isCollapsed={collapsedSections['seller']}
              onToggleCollapse={() => toggleSection('seller')}
              accentColor="indigo"
            />
          )}

          {/* Section 2: Client / Buyer Details */}
          {(activeSection === 'all' || activeSection === 'buyer') && (
            <BuyerSection
              buyerDetails={invoiceData.buyerDetails}
              onUpdateField={(f, v) => updateField('buyerDetails', f, v)}
              isCollapsed={collapsedSections['buyer']}
              onToggleCollapse={() => toggleSection('buyer')}
              accentColor="indigo"
            />
          )}

          {/* Section 3: Proforma Metadata & Dates */}
          {(activeSection === 'all' || activeSection === 'metadata') && (
            <ProformaMetadataSection
              metadata={invoiceData.metadata}
              showTax={invoiceData.showTax}
              onUpdateField={(f, v) => updateField('metadata', f, v)}
              onUpdateValidityDays={(val) => {
                const date = new Date(invoiceData.metadata.invoiceDate || Date.now());
                date.setDate(date.getDate() + val);
                setInvoiceData((prev: Invoice | null) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      validityDays: val,
                      validUntilDate: date.toISOString().split('T')[0]
                    }
                  };
                });
              }}
              onToggleTax={() => {
                const nextTax = !invoiceData.showTax;
                setInvoiceData((prev: Invoice | null) => {
                  if (!prev) return prev;
                  const nextItems = prev.items.map(item => ({
                    ...item,
                    gstPercent: nextTax ? 18 : 0,
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
                    nextTax
                  );
                  return {
                    ...prev,
                    showTax: nextTax,
                    items: calcs.items,
                    totals: calcs.totals
                  };
                });
              }}
              isCollapsed={collapsedSections['metadata']}
              onToggleCollapse={() => toggleSection('metadata')}
              accentColor="indigo"
            />
          )}

          {/* Section 4: Line Items & Pricing */}
          {(activeSection === 'all' || activeSection === 'items') && (
            <BentoCard
              id="items"
              title="Proforma Line Items & Rates"
              subtitle="Add products or services, quantities, rates & taxes"
              icon={ListPlus}
              badgeColor="indigo"
              isCollapsed={collapsedSections['items']}
              onToggleCollapse={() => toggleSection('items')}
            >
              <LineItemsTable
                items={invoiceData.items}
                onChange={handleItemsChange}
                currencySymbol={invoiceData.currency.symbol}
                showTax={invoiceData.showTax}
              />
            </BentoCard>
          )}

          {/* Section 5: Bank & Payment Credentials */}
          {(activeSection === 'all' || activeSection === 'payment') && (
            <PaymentSection
              paymentDetails={invoiceData.paymentDetails || {}}
              sellerDetails={invoiceData.sellerDetails}
              onUpdatePaymentField={updatePaymentField}
              isCollapsed={collapsedSections['payment']}
              onToggleCollapse={() => toggleSection('payment')}
              accentColor="indigo"
            />
          )}

          {/* Section 6: Terms, Declaration & Legal Notes */}
          {(activeSection === 'all' || activeSection === 'terms') && (
            <TermsSection
              termsAndConditions={invoiceData.termsAndConditions || ''}
              notes={invoiceData.notes || ''}
              declaration={invoiceData.declaration || ''}
              authorizedSignatoryName={invoiceData.authorizedSignatoryName || ''}
              isComputerGenerated={invoiceData.isComputerGenerated}
              watermark={invoiceData.watermark}
              onUpdateField={(f, v) => updateField(f as any, '', v)}
              isCollapsed={collapsedSections['terms']}
              onToggleCollapse={() => toggleSection('terms')}
              accentColor="indigo"
            />
          )}
        </div>

        {/* Right Side live print-size preview container */}
        <div className={`flex flex-col gap-4 w-full ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          <InvoicePreviewViewport invoice={invoiceData} id="invoice-render-sheet" />
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

      {/* Floating Download Notification Toast */}
      <DownloadNotificationToast />
    </div>
  );
}

export default function ProformaInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="animate-spin inline-block h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ProformaInvoiceForm />
    </Suspense>
  );
}
