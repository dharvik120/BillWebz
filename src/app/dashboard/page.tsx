'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Copy, 
  Edit3, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Upload, 
  Sun, 
  Moon, 
  Sparkles,
  Printer,
  ChevronDown,
  FileSpreadsheet,
  Receipt,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { UserNav } from '@/components/auth/UserNav';
import { Invoice, InvoiceStatus, InvoiceType } from '@/types/invoice';

export default function Dashboard() {
  const { 
    invoices, 
    loading, 
    deleteInvoice, 
    deleteInvoices,
    duplicateInvoice, 
    updateInvoiceStatus, 
    getMetrics, 
    exportBackup, 
    restoreBackup 
  } = useInvoiceStore();
  
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Bulk Selection State
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Authentication check: redirect to /login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?returnUrl=/dashboard');
    }
  }, [authLoading, user, router]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'gst' | 'proforma' | 'quotation' | 'nongst'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [statusDropId, setStatusDropId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch = 
        (inv.buyerDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.buyerDetails?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.metadata?.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesType = typeFilter === 'all' || inv.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [invoices, searchTerm, typeFilter, statusFilter]);

  // Dynamic Calculated Fiscal Metrics
  const calculatedStats = useMemo(() => {
    const exportedInvoices = invoices.filter(inv => inv.isExported === true);
    const totalCount = exportedInvoices.length;
    const gstCount = exportedInvoices.filter(i => i.type === 'gst').length;
    const proformaCount = exportedInvoices.filter(i => i.type === 'proforma').length;
    const quotationCount = exportedInvoices.filter(i => i.type === 'quotation').length;

    let totalInvoicedAmount = 0;
    let totalTaxAccrued = 0;
    let outstandingAmount = 0;
    let overdueCount = 0;
    let settledAmount = 0;

    exportedInvoices.forEach(inv => {
      const grand = Number(inv.totals?.grandTotal) || 0;
      const tax = (Number(inv.totals?.cgstTotal) || 0) + (Number(inv.totals?.sgstTotal) || 0) + (Number(inv.totals?.igstTotal) || 0);
      
      totalInvoicedAmount += grand;
      totalTaxAccrued += tax;

      if (inv.status === 'Paid') {
        settledAmount += grand;
      } else {
        outstandingAmount += grand;
        overdueCount += 1;
      }
    });

    return {
      totalCount,
      gstCount,
      proformaCount,
      quotationCount,
      totalInvoicedAmount,
      totalTaxAccrued,
      outstandingAmount,
      overdueCount,
      settledAmount
    };
  }, [invoices]);

  // Handle Backup File Upload
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await restoreBackup(content);
        if (success) {
          alert('Database restored successfully!');
          window.location.reload();
        } else {
          alert('Failed to restore backup. Invalid format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadBackup = () => {
    const dataStr = exportBackup();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `billwebz_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Stitch SaaS Top Header */}
      <header className="sticky top-0 z-40 w-full bg-card/90 backdrop-blur-xl border-b border-border/70 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & GST Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Bill<span className="text-foreground">Webz</span></span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary text-primary font-bold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              GST v2.4 Active
            </span>
          </div>

          {/* Quick Search & Actions */}
          <div className="flex items-center gap-3">
            {/* Backup & Restore */}
            <button 
              onClick={() => setShowBackupRestore(!showBackupRestore)} 
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 text-foreground transition-colors flex items-center gap-1.5 shadow-sm"
              title="Backup or Restore billing registry"
            >
              <Database className="h-3.5 w-3.5 text-primary" />
              <span className="hidden md:inline">Backup & Restore</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
            </button>
            
            {/* User Account / Navigation */}
            <UserNav />

            {/* Quick Generator Buttons */}
            <div className="flex items-center gap-1 bg-primary/10 p-1 rounded-xl border border-primary/20">
              <Link 
                href="/invoice/gst" 
                className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg shadow-sm hover:opacity-95 transition-all flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>GST Bill</span>
              </Link>
              <Link 
                href="/invoice/nongst" 
                className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-card rounded-lg transition-colors"
              >
                Non-GST
              </Link>
              <Link 
                href="/invoice/quotation" 
                className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-card rounded-lg transition-colors"
              >
                Quotation
              </Link>
              <Link 
                href="/invoice/proforma" 
                className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-card rounded-lg transition-colors"
              >
                Proforma
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Backup / Restore Dialog Panel */}
        <AnimatePresence>
          {showBackupRestore && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                  <Database className="text-primary h-5 w-5" /> System Backup and Migration
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Export your local invoice registry and business configurations to a JSON file, or restore a previous copy.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Backup
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-secondary border border-border hover:bg-secondary/80 rounded-lg text-sm font-semibold flex items-center gap-2 text-foreground transition-colors"
                >
                  <Upload className="h-4 w-4" /> Restore JSON
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleRestore} 
                  accept=".json" 
                  className="hidden" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: Executive Top Bar & Fiscal Health Summary (Stitch Screen 1) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/80 shadow-sm">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Billing Overview & Workspace
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                GST Portal Connected
              </span>
              <span className="px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-semibold">
                FY 2026-2027
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your GST Tax Invoices, Quotation Estimates, and Proforma documents with real-time analytics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            <Link 
              href="/BillWebz.apk" 
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border transition-colors shadow-sm"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>Download Android APK</span>
            </Link>
            <button 
              onClick={handleDownloadBackup} 
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Full GST Export</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Four Core Metric Stat Cards (Stitch Design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Documents */}
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Documents</span>
                <span className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                  {calculatedStats.totalCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span className="text-primary font-bold">{calculatedStats.gstCount} GST</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{calculatedStats.quotationCount} Quo</span>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{calculatedStats.proformaCount} Pro</span>
            </div>
          </div>

          {/* Card 2: Total Invoiced Value */}
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Invoiced Amount</span>
                <span className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                  {formatCurrency(calculatedStats.totalInvoicedAmount)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live Revenue Total
              </span>
              <span className="truncate">{formatCurrency(calculatedStats.totalTaxAccrued)} GST</span>
            </div>
          </div>

          {/* Card 3: Outstanding Balance */}
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending Balance</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {formatCurrency(calculatedStats.outstandingAmount)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {calculatedStats.overdueCount} Invoices Unsettled
              </span>
              <span>Pending Action</span>
            </div>
          </div>

          {/* Card 4: Settled / Paid Amount */}
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Collected / Paid</span>
                <span className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                  {formatCurrency(calculatedStats.settledAmount)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Direct Bank Receipts
              </span>
              <span>100% Verified</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Quick Document Creator Bento Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/invoice/gst" 
            className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 hover:border-primary transition-all group shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-white">Rule 46</span>
              <h3 className="text-base font-bold text-foreground mt-1.5">GST Tax Invoice</h3>
              <p className="text-xs text-muted-foreground mt-0.5">HSN codes, CGST/SGST/IGST breakdown & QR code</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </Link>

          <Link 
            href="/invoice/quotation" 
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 hover:border-emerald-500 transition-all group shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">Estimates</span>
              <h3 className="text-base font-bold text-foreground mt-1.5">Quotation / Cost Estimate</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Valid-till dates, custom terms & scope of work</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </Link>

          <Link 
            href="/invoice/proforma" 
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-card to-card border border-indigo-500/30 hover:border-indigo-500 transition-all group shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">Advance</span>
              <h3 className="text-base font-bold text-foreground mt-1.5">Proforma Invoice</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Pre-shipment advance payment & PO tracking</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </Link>
        </div>

        {/* SECTION 4: Invoices List Panel (Stitch Data Table) */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Controls Bar */}
          <div className="p-5 border-b border-border/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-secondary/30">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoice number, client, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border/80 rounded-xl text-xs sm:text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter Tabs */}
              <div className="flex bg-secondary p-1 rounded-xl border border-border/60 text-xs font-bold">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'all' ? 'bg-card shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setTypeFilter('gst')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'gst' ? 'bg-card shadow-sm text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  GST
                </button>
                <button
                  onClick={() => setTypeFilter('quotation')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'quotation' ? 'bg-card shadow-sm text-emerald-600 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Quotation
                </button>
                <button
                  onClick={() => setTypeFilter('proforma')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${typeFilter === 'proforma' ? 'bg-card shadow-sm text-indigo-600 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Proforma
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-border/80 rounded-xl text-xs font-semibold bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedInvoiceIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-red-500/10 border-b border-red-500/20 text-xs">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span><strong>{selectedInvoiceIds.length}</strong> of {filteredInvoices.length} invoices selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceIds([])}
                  className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const count = selectedInvoiceIds.length;
                    if (!confirm(`Are you sure you want to permanently delete ${count} selected ${count === 1 ? 'document' : 'documents'}? This cannot be undone.`)) return;
                    setIsBulkDeleting(true);
                    try {
                      await deleteInvoices(selectedInvoiceIds);
                      setSelectedInvoiceIds([]);
                    } catch (err) {
                      console.error('Bulk delete failed', err);
                      alert('Failed to delete selected invoices.');
                    } finally {
                      setIsBulkDeleting(false);
                    }
                  }}
                  disabled={isBulkDeleting}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedInvoiceIds.length})`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-24 text-center text-sm text-muted-foreground">
                <span className="animate-spin inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
                Loading billing documents...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-base text-foreground">No invoices or quotations found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchTerm ? 'No results matched your search criteria.' : 'Create your first commercial document to start tracking revenue:'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <Link
                    href="/invoice/gst"
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-colors"
                  >
                    + GST Invoice
                  </Link>
                  <Link
                    href="/invoice/quotation"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
                  >
                    + Quotation Generator
                  </Link>
                  <Link
                    href="/invoice/proforma"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    + Proforma Invoice
                  </Link>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/60 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                    <th className="px-4 py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredInvoices.length > 0 && selectedInvoiceIds.length === filteredInvoices.length}
                        onChange={() => {
                          const allFilteredIds = filteredInvoices.map(i => i.id).filter(Boolean) as string[];
                          if (selectedInvoiceIds.length === allFilteredIds.length) {
                            setSelectedInvoiceIds([]);
                          } else {
                            setSelectedInvoiceIds(allFilteredIds);
                          }
                        }}
                        className="w-4 h-4 rounded cursor-pointer accent-primary"
                        title="Select All Invoices"
                      />
                    </th>
                    <th className="px-6 py-4">Document No</th>
                    <th className="px-6 py-4">Billed To / Client</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Issue Date</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredInvoices.map((inv) => {
                    const isSelected = Boolean(inv.id && selectedInvoiceIds.includes(inv.id));
                    const statusColors = {
                      Paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
                      Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
                      Draft: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30',
                      Cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30',
                    };

                    const editLink = inv.type === 'gst' 
                      ? `/invoice/gst?id=${inv.id}` 
                      : inv.type === 'proforma'
                      ? `/invoice/proforma?id=${inv.id}`
                      : `/invoice/quotation?id=${inv.id}`;

                    return (
                      <tr 
                        key={inv.id} 
                        className={`transition-colors ${isSelected ? 'bg-red-500/10' : 'hover:bg-secondary/20'}`}
                      >
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (!inv.id) return;
                              setSelectedInvoiceIds(prev =>
                                prev.includes(inv.id!) ? prev.filter(id => id !== inv.id) : [...prev, inv.id!]
                              );
                            }}
                            className="w-4 h-4 rounded cursor-pointer accent-primary"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-foreground">
                          {inv.metadata.invoiceNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{inv.buyerDetails.name}</div>
                          {inv.buyerDetails.companyName && (
                            <span className="text-xs text-muted-foreground block">{inv.buyerDetails.companyName}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${inv.type === 'gst' ? 'bg-primary text-white' : inv.type === 'proforma' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {inv.type === 'gst' ? 'GST Invoice' : inv.type === 'proforma' ? 'Proforma' : 'Quotation'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                          {new Date(inv.metadata.invoiceDate || inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground text-sm">
                          {inv.currency?.symbol || '₹'}{inv.totals?.grandTotal?.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 relative">
                          <button
                            onClick={() => setStatusDropId(statusDropId === inv.id ? null : (inv.id || null))}
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${statusColors[inv.status] || statusColors.Draft}`}
                          >
                            <span>{inv.status}</span>
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          
                          {/* Dropdown status update modal */}
                          {statusDropId === inv.id && (
                            <div className="absolute left-6 mt-1 z-30 w-32 bg-card border border-border rounded-xl shadow-xl py-1">
                              {(['Paid', 'Pending', 'Draft', 'Cancelled'] as InvoiceStatus[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={async () => {
                                    if (inv.id) await updateInvoiceStatus(inv.id, st);
                                    setStatusDropId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-secondary text-foreground transition-colors flex items-center justify-between"
                                >
                                  <span>{st}</span>
                                  {inv.status === st && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={editLink}
                              className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 border border-border/40 transition-all"
                              title="Edit Document"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => duplicateInvoice(inv)}
                              className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-indigo-600 hover:bg-secondary/80 border border-border/40 transition-all"
                              title="Duplicate Document"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this invoice?')) {
                                  if (inv.id) deleteInvoice(inv.id);
                                }
                              }}
                              className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-red-500 hover:bg-secondary/80 border border-border/40 transition-all"
                              title="Delete Document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-border/70 py-8 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
          <span>© 2026 BillWebz. Professional Indian Invoicing. All rights reserved.</span>
          <span className="font-bold text-primary">Created By Webz Technologies</span>
        </div>
      </footer>
    </div>
  );
}
