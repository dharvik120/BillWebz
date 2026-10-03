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
import { QuotationMetadataSection } from '@/components/invoice/sections/QuotationMetadataSection';
import { Invoice, LineItem, InvoiceStatus, InvoiceTheme, PaperSize } from '@/types/invoice';
import { countriesList, statesByCountry } from '@/utils/locationData';
import { getNextDocumentNumber } from '@/utils/documentNumbering';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserNav } from '@/components/auth/UserNav';

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

const emptyQuotation = (defaultSeller: any, defaultTerms: any, defaultDec: any, defaultCurr: any, existingInvoices: Invoice[] = []): Invoice => {
  const seller = getInitialSellerProfile(defaultSeller);
  return {
    type: 'quotation',
    status: 'Draft',
    theme: 'emerald', // Quotation defaults to emerald theme
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
    invoiceNumber: getNextDocumentNumber('quotation', existingInvoices),
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
  quotationNotes: 'This is a quotation proposal only. Terms are negotiable prior to project sign-off.',
  showTax: true,
  createdAt: 0,
  updatedAt: 0
  };
};

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

  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 1. Initial State Load
  const [initialData, setInitialData] = useState<Invoice | null>(null);
  
  useEffect(() => {
    if (editId) {
      const match = invoices.find(inv => inv.id === editId);
      if (match) {
        setInitialData(match);
      }
    } else {
      setInitialData(emptyQuotation(defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency, invoices));
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

    if (!user) {
      setShowAuthModal(true);
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
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsSharingWhatsApp(true);
    try {
      const clientName = invoiceData.buyerDetails?.name || 'Customer';
      const grandTotal = `${invoiceData.currency?.symbol || '₹'}${invoiceData.totals?.grandTotal || 0}`;
      const docNo = invoiceData.metadata?.invoiceNumber || '';
      const shareText = `Hi ${clientName},\n\nPlease find attached Quotation #${docNo} from ${invoiceData.sellerDetails?.name || 'BillWebz'}.\nTotal Estimated Amount: ${grandTotal}.\n\nThank you for your business!`;

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
                message: `Quotation PDF saved to Downloads! Opening WhatsApp so you can attach it to your chat.`
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
            className="h-10 px-3 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold bg-background text-foreground shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            title="Invoice Accent Color Theme"
          >
            <option value="emerald">Emerald Forest</option>
            <option value="blue">Blue Classic</option>
            <option value="navy">Navy Executive</option>
            <option value="burgundy">Burgundy Regal</option>
            <option value="slate">Slate Modern</option>
            <option value="charcoal">Charcoal Dark</option>
            <option value="monochrome">Monochrome Minimal</option>
            <option value="gold">Amber Gold</option>
          </select>

          {/* Paper Size selector */}
          <select
            value={invoiceData.paperSize}
            onChange={(e) => updateField('paperSize', '', e.target.value as PaperSize)}
            className="h-10 px-3 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold bg-background text-foreground shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
            className="h-10 px-3 border border-border/80 rounded-xl text-xs sm:text-sm font-semibold bg-background text-foreground shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
            className="h-8.5 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95 shrink-0"
            title="Save Quotation Draft"
          >
            {saveSuccess ? <Check className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" /> : <Save className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />}
            <span className="hidden sm:inline">{saveSuccess ? 'Saved!' : 'Save Draft'}</span>
            <span className="sm:hidden">{saveSuccess ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="h-8.5 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
            title="Download PDF"
          >
            {isExporting ? <RefreshCw className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 animate-spin" /> : <Download className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />}
            <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Export PDF'}</span>
            <span className="sm:hidden">{isExporting ? '...' : 'PDF'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            disabled={isSharingWhatsApp}
            className="h-8.5 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
            title="Share via WhatsApp"
          >
            {isSharingWhatsApp ? <RefreshCw className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />}
            <span className="hidden md:inline">{isSharingWhatsApp ? 'Sharing...' : 'WhatsApp'}</span>
          </button>

          <UserNav />
        </div>
      </header>

      {/* Sticky Mobile Tabs Switcher per Requirement 7 */}
      <div className="lg:hidden sticky top-16 z-30 bg-background/90 backdrop-blur-md border-b border-border/70 px-4 py-2 flex items-center justify-center no-print">
        <div className="w-full max-w-sm flex items-center p-1 rounded-2xl bg-secondary/80 border border-border/50 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              mobileTab === 'form'
                ? 'bg-emerald-600 text-white shadow-xs'
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
                ? 'bg-emerald-600 text-white shadow-xs'
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
            accentColor="emerald"
            tabs={[
              { id: 'all', label: 'All Sections', icon: Layers },
              { id: 'seller', label: 'Business', icon: Building },
              { id: 'buyer', label: 'Client', icon: User },
              { id: 'metadata', label: 'Quotation Info', icon: Calendar },
              { id: 'items', label: 'Items & Rates', icon: ListPlus },
              { id: 'payment', label: 'Bank & Pay', icon: CreditCard },
              { id: 'terms', label: 'Terms & Notes', icon: FileText },
            ]}
          />

          {/* Tax / Estimation Mode Card */}
          <div className="border border-border/80 rounded-2xl p-5 bg-card shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                  Tax & Estimation Mode
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose between standard GST quotation proposal or flat non-tax estimate
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
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  GST Quotation
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
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Flat / Non-Tax
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/40">
              {invoiceData.showTax
                ? "Standard GST quotation breakdown. Shows HSN/SAC, GST, CGST, and SGST/IGST tax rates."
                : "Simple estimation quote. The document displays pure line item rates without tax breakdowns."}
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
              accentColor="emerald"
            />
          )}

          {/* Section 2: Client / Buyer Details */}
          {(activeSection === 'all' || activeSection === 'buyer') && (
            <BuyerSection
              buyerDetails={invoiceData.buyerDetails}
              onUpdateField={(f, v) => updateField('buyerDetails', f, v)}
              isCollapsed={collapsedSections['buyer']}
              onToggleCollapse={() => toggleSection('buyer')}
              accentColor="emerald"
            />
          )}

          {/* Section 3: Quotation Metadata & Dates */}
          {(activeSection === 'all' || activeSection === 'metadata') && (
            <QuotationMetadataSection
              metadata={invoiceData.metadata}
              onUpdateField={(f, v) => updateField('metadata', f, v)}
              onUpdateValidityDays={(val) => {
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
              isCollapsed={collapsedSections['metadata']}
              onToggleCollapse={() => toggleSection('metadata')}
              accentColor="emerald"
            />
          )}

          {/* Section 4: Line Items & Pricing */}
          {(activeSection === 'all' || activeSection === 'items') && (
            <BentoCard
              id="items"
              title="Proposal Items & Rates"
              subtitle="Add products or services, quantities, proposal rates & discounts"
              icon={ListPlus}
              badgeColor="emerald"
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
              accentColor="emerald"
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
              accentColor="emerald"
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

      {/* Hidden container for PDF export */}
      <div className="absolute left-[-9999px] top-0 pointer-events-none no-print">
        <InvoicePreview invoice={invoiceData} id="invoice-pdf-export-sheet" />
      </div>
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Save & Export Quotations"
        subtitle="Please log in or sign up to safely generate, store, and download your billing documents."
      />

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
