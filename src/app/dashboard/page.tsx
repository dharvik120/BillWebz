'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useTheme } from '@/components/ThemeProvider';
import { Invoice, InvoiceStatus, InvoiceType } from '@/types/invoice';

export default function Dashboard() {
  const { 
    invoices, 
    loading, 
    deleteInvoice, 
    duplicateInvoice, 
    updateInvoiceStatus, 
    getMetrics, 
    exportBackup, 
    restoreBackup 
  } = useInvoiceStore();
  
  const { theme, toggleTheme } = useTheme();

  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('billwebz_admin_logged_in') === 'true';
      if (!isLoggedIn) {
        router.push('/admin');
      }
    }
  }, [router]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'gst' | 'proforma' | 'quotation'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [showBackupRestore, setShowBackupRestore] = useState(false);
  const [statusDropId, setStatusDropId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metrics
  const metrics = getMetrics();

  // Filtered Invoices (Only show successfully exported/downloaded ones)
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.buyerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.buyerDetails.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.metadata.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus && inv.isExported === true;
  });

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
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `billwebz_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-border/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-blue-600 dark:text-blue-500 tracking-tight">
            <Sparkles className="h-6 w-6" />
            <span>BillWebz</span>
          </Link>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowBackupRestore(!showBackupRestore)} 
              className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-secondary hover:bg-secondary/80 border border-border/30 transition-colors flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Backup & Restore</span>
            </button>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-secondary/80 border border-border/30 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-600" />}
            </button>
            
            <div className="flex items-center gap-1 bg-blue-600 rounded-lg p-0.5 shadow-sm text-white">
              <Link 
                href="/invoice/gst" 
                className="px-2.5 py-1.5 text-xs font-bold hover:bg-blue-700/80 rounded-md transition-colors"
              >
                + GST
              </Link>
              <div className="w-px h-5 bg-white/20" />
              <Link 
                href="/invoice/proforma" 
                className="px-2.5 py-1.5 text-xs font-bold hover:bg-blue-700/80 rounded-md transition-colors"
              >
                + Proforma
              </Link>
              <div className="w-px h-5 bg-white/20" />
              <Link 
                href="/invoice/quotation" 
                className="px-2.5 py-1.5 text-xs font-bold hover:bg-blue-700/80 rounded-md transition-colors animate-pulse"
              >
                + Quotation
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Backup / Restore Dialog Panel */}
        <AnimatePresence>
          {showBackupRestore && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-6 bg-card border border-border/80 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Database className="text-blue-500" /> System Backup and Migration
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Export your local invoice registry and business configurations to a JSON file, or restore a previous copy.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Backup
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-secondary border border-border hover:bg-secondary/80 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
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

        {/* Dashboard Grid Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Invoice Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of transactions, billing health, and draft operations.</p>
        </div>

        {/* Analytics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wider block">TOTAL DOCUMENTS</span>
              <strong className="text-2xl font-extrabold mt-1 block">{metrics.totalCount}</strong>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <FileText className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wider block">GST TAX INVOICES</span>
              <strong className="text-2xl font-extrabold mt-1 block text-blue-600 dark:text-blue-500">{metrics.gstCount}</strong>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <FileText className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wider block">PROFORMA INVOICES</span>
              <strong className="text-2xl font-extrabold mt-1 block text-indigo-600 dark:text-indigo-400">{metrics.proformaCount}</strong>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
              <FileText className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wider block">QUOTATIONS</span>
              <strong className="text-2xl font-extrabold mt-1 block text-emerald-600 dark:text-emerald-400">{metrics.quotationCount}</strong>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
          </div>
        </div>



        {/* Invoices List Panel */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-6 border-b border-border/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-muted/20">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search number, client, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border/80 rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <div className="flex bg-secondary p-0.5 rounded-lg border border-border/30 text-[11px] font-bold">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1.5 rounded-md transition-all ${typeFilter === 'all' ? 'bg-card shadow-sm text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setTypeFilter('gst')}
                  className={`px-2.5 py-1.5 rounded-md transition-all ${typeFilter === 'gst' ? 'bg-card shadow-sm text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}
                >
                  GST
                </button>
                <button
                  onClick={() => setTypeFilter('proforma')}
                  className={`px-2.5 py-1.5 rounded-md transition-all ${typeFilter === 'proforma' ? 'bg-card shadow-sm text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}
                >
                  Proforma
                </button>
                <button
                  onClick={() => setTypeFilter('quotation')}
                  className={`px-2.5 py-1.5 rounded-md transition-all ${typeFilter === 'quotation' ? 'bg-card shadow-sm text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}
                >
                  Quotation
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-border/80 rounded-lg text-xs font-semibold bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-sm text-muted-foreground">
                <span className="animate-spin inline-block h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                Loading invoices...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-bold text-base text-foreground/80">No invoices or quotations found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  Get started by creating a new document:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <Link
                    href="/invoice/gst"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    + GST Invoice
                  </Link>
                  <Link
                    href="/invoice/proforma"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    + Proforma Invoice
                  </Link>
                  <Link
                    href="/invoice/quotation"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    + Quotation Generator
                  </Link>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Invoice No</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredInvoices.map((inv) => {
                    const statusColors = {
                      Paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
                      Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                      Draft: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
                      Cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
                    };

                    const editLink = inv.type === 'gst' 
                      ? `/invoice/gst?id=${inv.id}` 
                      : inv.type === 'proforma'
                      ? `/invoice/proforma?id=${inv.id}`
                      : `/invoice/quotation?id=${inv.id}`;

                    return (
                      <tr key={inv.id} className="hover:bg-muted/5 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-foreground/90">
                          {inv.metadata.invoiceNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold">{inv.buyerDetails.name}</div>
                          {inv.buyerDetails.companyName && (
                            <span className="text-xs text-muted-foreground">{inv.buyerDetails.companyName}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${inv.type === 'gst' ? 'bg-blue-600 text-white' : inv.type === 'proforma' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                            {inv.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {new Date(inv.metadata.invoiceDate || inv.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {inv.currency.symbol}{inv.totals.grandTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 relative">
                          <button
                            onClick={() => setStatusDropId(statusDropId === inv.id ? null : (inv.id || null))}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${statusColors[inv.status]}`}
                          >
                            {inv.status}
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          
                          {/* Dropdown status update portal */}
                          {statusDropId === inv.id && (
                            <div className="absolute left-6 mt-1 z-30 w-28 bg-card border border-border rounded-lg shadow-lg py-1">
                              {(['Paid', 'Pending', 'Draft', 'Cancelled'] as InvoiceStatus[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={async () => {
                                    if (inv.id) await updateInvoiceStatus(inv.id, st);
                                    setStatusDropId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-secondary text-foreground/80 transition-colors"
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={editLink}
                              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-blue-600 border border-border/30 hover:border-blue-500/20 transition-all"
                              title="Edit Invoice"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => duplicateInvoice(inv)}
                              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-indigo-600 border border-border/30 hover:border-indigo-500/20 transition-all"
                              title="Duplicate Invoice"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this invoice?')) {
                                  if (inv.id) deleteInvoice(inv.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-red-500 border border-border/30 hover:border-red-500/20 transition-all"
                              title="Delete Invoice"
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

      <footer className="bg-card border-t border-border/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 BillWebz. All rights reserved.</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">Created By Webz Technologies</span>
        </div>
      </footer>
    </div>
  );
}
