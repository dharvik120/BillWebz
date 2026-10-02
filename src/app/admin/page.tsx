'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Settings, 
  HelpCircle, 
  CreditCard, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  LogOut, 
  Check, 
  Eye, 
  EyeOff,
  Database,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Sparkles,
  KeyRound,
  FileSpreadsheet,
  Hash,
  Upload,
  Download,
  AlertCircle,
  TrendingUp,
  Receipt,
  FileCheck
} from 'lucide-react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { AdminSettings, PricingPlan, Invoice, NumberingSettings, InvoiceType } from '@/types/invoice';
import { 
  getStoredNumberingSettings, 
  saveStoredNumberingSettings, 
  getNextDocumentNumber 
} from '@/utils/documentNumbering';

export default function AdminPortal() {
  const router = useRouter();
  const { 
    invoices, 
    adminSettings, 
    saveAdminSettings, 
    deleteInvoice,
    deleteInvoices,
    updateInvoiceStatus,
    exportBackup,
    restoreBackup,
    loadInvoices,
    getMetrics
  } = useInvoiceStore();

  // Bulk Selection State for Ledger
  const [selectedLedgerIds, setSelectedLedgerIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password Reset / Recovery State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'customizer' | 'faqs' | 'pricing' | 'ledger' | 'numbering' | 'security'>('customizer');

  // Form states matching adminSettings
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubscriptionLocked, setIsSubscriptionLocked] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [faqList, setFaqList] = useState<{ q: string; a: string }[]>([]);
  const [adminPassword, setAdminPassword] = useState('');

  // Document Numbering State
  const [numberingSettings, setNumberingSettings] = useState<NumberingSettings>(getStoredNumberingSettings());
  const [numberingSaveSuccess, setNumberingSaveSuccess] = useState(false);

  // Editing state for new entries
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metrics from real database data
  const metrics = getMetrics();

  // Load state check on session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logged = sessionStorage.getItem('billwebz_admin_logged_in') === 'true';
      setIsLoggedIn(logged);
    }
  }, []);

  // Sync settings state on store load
  useEffect(() => {
    if (adminSettings) {
      setHeroTitle(adminSettings.heroTitle || '');
      setHeroSubtitle(adminSettings.heroSubtitle || '');
      setContactEmail(adminSettings.contactEmail || '');
      setIsSubscriptionLocked(!!adminSettings.isSubscriptionLocked);
      setPricingPlans(adminSettings.pricingPlans || []);
      setFaqList(adminSettings.faqList || []);
      setAdminPassword(adminSettings.adminPassword || 'admin123');
    }
  }, [adminSettings]);

  useEffect(() => {
    setNumberingSettings(getStoredNumberingSettings());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = adminSettings?.adminPassword || 'admin123';
    const validUsernames = [
      'admin', 
      'administrator', 
      (adminSettings?.contactEmail || 'support@billwebz.com').toLowerCase(), 
      'support@billwebz.com'
    ];
    
    if (validUsernames.includes(username.trim().toLowerCase()) && password === correctPassword) {
      sessionStorage.setItem('billwebz_admin_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError('');
      loadInvoices();
    } else {
      setLoginError('Invalid Administrator Username/Email or Password.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const validEmail = (adminSettings?.contactEmail || 'support@billwebz.com').toLowerCase();
    const masterKey = 'billwebz-master-2026';
    
    if (
      recoveryInput.trim().toLowerCase() === validEmail || 
      recoveryInput.trim() === masterKey || 
      recoveryInput.trim().toLowerCase() === 'admin'
    ) {
      if (!newResetPassword || newResetPassword.length < 6) {
        setRecoveryMessage({ text: 'New password must be at least 6 characters long.', isError: true });
        return;
      }
      const updated = {
        ...(adminSettings || {
          heroTitle: '',
          heroSubtitle: '',
          contactEmail: validEmail,
          isSubscriptionLocked: false,
          pricingPlans: [],
          faqList: []
        }),
        adminPassword: newResetPassword
      };
      saveAdminSettings(updated);
      setAdminPassword(newResetPassword);
      setRecoveryMessage({ text: 'Password reset successfully! You can now log in.', isError: false });
      setTimeout(() => {
        setShowForgotModal(false);
        setPassword(newResetPassword);
        setRecoveryInput('');
        setNewResetPassword('');
        setRecoveryMessage(null);
      }, 1600);
    } else {
      setRecoveryMessage({ text: 'Invalid recovery key or email. Please check and try again.', isError: true });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('billwebz_admin_logged_in');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    loadInvoices();
  };

  const handleSaveSettings = () => {
    const updatedSettings: AdminSettings = {
      adminPassword,
      heroTitle,
      heroSubtitle,
      contactEmail,
      isSubscriptionLocked,
      pricingPlans,
      faqList
    };
    saveAdminSettings(updatedSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveNumberingSettings = () => {
    saveStoredNumberingSettings(numberingSettings);
    setNumberingSaveSuccess(true);
    setTimeout(() => setNumberingSaveSuccess(false), 2000);
  };

  // FAQ Manager helpers
  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFaqList([...faqList, { q: newFaqQ, a: newFaqA }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleDeleteFaq = (index: number) => {
    setFaqList(faqList.filter((_, idx) => idx !== index));
  };

  // Plan editor helper
  const handleUpdatePlanField = (planId: string, field: keyof PricingPlan, value: any) => {
    setPricingPlans(pricingPlans.map(plan => {
      if (plan.id === planId) {
        return { ...plan, [field]: value };
      }
      return plan;
    }));
  };

  const handleUpdatePlanFeatures = (planId: string, featuresText: string) => {
    const featuresArray = featuresText.split('\n').filter(f => f.trim() !== '');
    handleUpdatePlanField(planId, 'features', featuresArray);
  };

  const handleDownloadBackup = () => {
    const dataStr = exportBackup();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `billwebz_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await restoreBackup(content);
        if (success) {
          alert('Database restored successfully from backup!');
          loadInvoices();
          window.location.reload();
        } else {
          alert('Failed to restore backup. Invalid JSON file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Render Login Panel
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-3xl text-blue-500 tracking-tight mb-4">
            <Sparkles className="h-7 w-7 text-blue-500 animate-pulse" />
            <span>BillWebz</span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Gatekeeper</h2>
          <p className="mt-1 text-sm text-slate-400">Authenticate credentials to configure settings.</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
          <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin or email@domain.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 rounded-lg flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> Authenticate Admin
              </button>
            </form>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <div className="flex items-center gap-2.5 mb-2 text-blue-500">
                <KeyRound className="h-5 w-5" />
                <h3 className="text-lg font-extrabold text-white">Reset Admin Password</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Enter your registered admin email, master key (<code className="text-blue-400 font-mono">billwebz-master-2026</code>), or username to set a new password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Recovery Key or Admin Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="support@billwebz.com or master key"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter at least 6 characters"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {recoveryMessage && (
                  <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    recoveryMessage.isError 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                      : 'bg-green-500/10 border-green-500/30 text-green-400'
                  }`}>
                    {recoveryMessage.isError ? <AlertCircle className="h-4 w-4 flex-shrink-0" /> : <ShieldCheck className="h-4 w-4 flex-shrink-0" />}
                    <span>{recoveryMessage.text}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setRecoveryMessage(null);
                    }}
                    className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow"
                  >
                    Reset & Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dashboard Workspace
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Admin Workspace Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-blue-500 tracking-tight">
            <Sparkles className="h-6 w-6" />
            <span>BillWebz</span>
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-blue-500" /> Administrative Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Eye className="h-4 w-4" /> View Client Dashboard
          </Link>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saveSuccess ? 'Changes Saved!' : 'Save System Settings'}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 border border-slate-800 bg-slate-900/50 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
            title="Log Out Console"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Live Metrics Summary Bar (Real Data Counters per Requirement 6) */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 no-print">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3 text-emerald-400" /> Quotations
            </span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1">{metrics.quotationCount}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Receipt className="h-3 w-3 text-blue-400" /> GST Invoices
            </span>
            <span className="text-xl font-extrabold text-blue-400 mt-1">{metrics.gstCount}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-3 w-3 text-indigo-400" /> Proforma
            </span>
            <span className="text-xl font-extrabold text-indigo-400 mt-1">{metrics.proformaCount}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileCheck className="h-3 w-3 text-amber-400" /> Non-GST
            </span>
            <span className="text-xl font-extrabold text-amber-400 mt-1">{metrics.nongstCount}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Database className="h-3 w-3 text-slate-400" /> Total Docs
            </span>
            <span className="text-xl font-extrabold text-white mt-1">{metrics.totalCount}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" /> Total Turnover
            </span>
            <span className="text-base font-extrabold text-green-400 mt-1 truncate">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </section>

      {/* Main Admin Columns */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Workspace Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-2 no-print flex flex-col justify-between">
          <div className="space-y-1.5">
            {[
              { id: 'customizer', label: 'Website Customizer', icon: <Globe className="h-4 w-4" /> },
              { id: 'faqs', label: 'FAQ Registry', icon: <HelpCircle className="h-4 w-4" /> },
              { id: 'pricing', label: 'Pricing & Plans', icon: <CreditCard className="h-4 w-4" /> },
              { id: 'ledger', label: 'Master Invoices Ledger', icon: <FileText className="h-4 w-4" /> },
              { id: 'numbering', label: 'Document Numbering', icon: <Hash className="h-4 w-4" /> },
              { id: 'security', label: 'Security & Backup', icon: <Settings className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-center space-y-2 mt-8 md:mt-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Local Storage Metrics</span>
            <strong className="text-xl text-white font-black block">{invoices.length} Invoices</strong>
            <p className="text-[9px] text-slate-400 leading-relaxed">Stored offline in client browser database.</p>
          </div>
        </aside>

        {/* Right workspace panels */}
        <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          
          {/* TAB 1: WEBSITE CUSTOMIZER */}
          {activeTab === 'customizer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Website Content Customizer</h2>
                <p className="text-xs text-slate-400 mt-1">Configure landing page hero copies, metadata headlines, and core support tags.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Hero Headline Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Generate Professional GST, Proforma & Quotations Instantly"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Hero Subtitle / Description</label>
                  <textarea
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide details about platform features and benefits."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Support contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="support@billwebz.com"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">Will display in payment upgrade dialog modals and contacts blocks.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAQ REGISTRY */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Frequently Asked Questions</h2>
                <p className="text-xs text-slate-400 mt-1">Manage FAQs rendered at the bottom of the home landing page.</p>
              </div>

              {/* Add FAQ Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Add New FAQ Card</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">Question</label>
                    <input
                      type="text"
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      placeholder="e.g. Can I export to A4 formats?"
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">Answer</label>
                    <input
                      type="text"
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      placeholder="e.g. Yes, BillWebz supports A4 layout exports."
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-4.5 w-4.5 text-blue-500" /> Insert FAQ
                </button>
              </div>

              {/* FAQ Lists */}
              <div className="space-y-3">
                {faqList.map((faq, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex justify-between gap-4 text-sm">
                    <div>
                      <strong className="block text-white font-bold">{faq.q}</strong>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{faq.a}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(idx)}
                      className="p-1.5 hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors flex-shrink-0 self-start"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & PLANS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Pricing Plans & Export Lock</h2>
                <p className="text-xs text-slate-400 mt-1">Configure pricing plans and toggle the subscription lock check on invoice PDF downloads.</p>
              </div>

              {/* Download Lock status */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Subscription Block Lock</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    When enabled, public users will be blocked from downloading/exporting PDFs and will be prompted with the Pricing Upgrade plan dialog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubscriptionLocked(!isSubscriptionLocked)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    isSubscriptionLocked 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20' 
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20'
                  }`}
                >
                  {isSubscriptionLocked ? 'LOCK ACTIVE (LOCKED)' : 'LOCK DISABLED (FREE)'}
                </button>
              </div>

              {/* Plans Loop Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pricingPlans.map((plan) => (
                  <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-slate-500 font-bold uppercase tracking-wider">PLAN CONFIG: {plan.id}</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id={`popular-${plan.id}`}
                          checked={!!plan.isPopular}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'isPopular', e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <label htmlFor={`popular-${plan.id}`} className="font-semibold text-slate-400">Popular Badge</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-medium mb-1">Plan Name</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-medium mb-1">Pricing (Text)</label>
                        <input
                          type="text"
                          value={plan.price}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-medium mb-1">Billing Period</label>
                        <input
                          type="text"
                          value={plan.period}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'period', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-medium mb-1">Button Callout Text</label>
                        <input
                          type="text"
                          value={plan.buttonText}
                          onChange={(e) => handleUpdatePlanField(plan.id, 'buttonText', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Features list (One per line)</label>
                      <textarea
                        value={plan.features.join('\n')}
                        onChange={(e) => handleUpdatePlanFeatures(plan.id, e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MASTER INVOICES LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Master Invoices Registry Ledger</h2>
                  <p className="text-xs text-slate-400 mt-1">Review, modify statuses, or delete all active drafts and exported sheets across client nodes.</p>
                </div>
                {invoices.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = invoices.map(i => i.id).filter(Boolean) as string[];
                        if (selectedLedgerIds.length === allIds.length) {
                          setSelectedLedgerIds([]);
                        } else {
                          setSelectedLedgerIds(allIds);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      {selectedLedgerIds.length === invoices.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {selectedLedgerIds.length > 0 && (
                      <button
                        type="button"
                        onClick={async () => {
                          const count = selectedLedgerIds.length;
                          if (!confirm(`Are you sure you want to permanently delete ${count} selected ${count === 1 ? 'invoice' : 'invoices'}? This action cannot be undone.`)) return;
                          setIsBulkDeleting(true);
                          try {
                            await deleteInvoices(selectedLedgerIds);
                            setSelectedLedgerIds([]);
                          } catch (err) {
                            console.error('Bulk delete failed', err);
                            alert('Failed to delete selected records.');
                          } finally {
                            setIsBulkDeleting(false);
                          }
                        }}
                        disabled={isBulkDeleting}
                        className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedLedgerIds.length})`}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bulk Action Bar Banner */}
              {selectedLedgerIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-red-200 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span><strong>{selectedLedgerIds.length}</strong> of {invoices.length} invoices selected for bulk operation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLedgerIds([])}
                      className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const count = selectedLedgerIds.length;
                        if (!confirm(`Are you sure you want to permanently delete ${count} selected ${count === 1 ? 'invoice' : 'invoices'}? This action cannot be undone.`)) return;
                        setIsBulkDeleting(true);
                        try {
                          await deleteInvoices(selectedLedgerIds);
                          setSelectedLedgerIds([]);
                        } catch (err) {
                          console.error('Bulk delete failed', err);
                          alert('Failed to delete selected records.');
                        } finally {
                          setIsBulkDeleting(false);
                        }
                      }}
                      disabled={isBulkDeleting}
                      className="px-4 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedLedgerIds.length})`}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow overflow-hidden">
                {invoices.length === 0 ? (
                  <div className="py-20 text-center text-sm text-slate-500">
                    <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                    <span>No invoice registries have been created yet on this system.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="px-4 py-4 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={invoices.length > 0 && selectedLedgerIds.length === invoices.length}
                              onChange={() => {
                                const allIds = invoices.map(i => i.id).filter(Boolean) as string[];
                                if (selectedLedgerIds.length === allIds.length) {
                                  setSelectedLedgerIds([]);
                                } else {
                                  setSelectedLedgerIds(allIds);
                                }
                              }}
                              className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                              title="Select All Invoices"
                            />
                          </th>
                          <th className="px-5 py-4">Invoice No</th>
                          <th className="px-5 py-4">Client/Buyer</th>
                          <th className="px-5 py-4">Type</th>
                          <th className="px-5 py-4">Total Amount</th>
                          <th className="px-5 py-4">Export Status</th>
                          <th className="px-5 py-4">Billing Status</th>
                          <th className="px-5 py-4 text-right">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {invoices.map((inv) => {
                          const isSelected = Boolean(inv.id && selectedLedgerIds.includes(inv.id));
                          return (
                            <tr 
                              key={inv.id} 
                              className={`transition-colors ${isSelected ? 'bg-red-950/20 border-l-2 border-red-500' : 'hover:bg-slate-800/25'}`}
                            >
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (!inv.id) return;
                                    setSelectedLedgerIds(prev =>
                                      prev.includes(inv.id!) ? prev.filter(id => id !== inv.id) : [...prev, inv.id!]
                                    );
                                  }}
                                  className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                                />
                              </td>
                              <td className="px-5 py-4 font-mono font-bold text-white">
                                {inv.metadata.invoiceNumber}
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-300">
                                {inv.buyerDetails.name}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-0.5 rounded-[4px] font-black text-[9px] uppercase ${
                                  inv.type === 'gst' ? 'bg-blue-950 text-blue-400 border border-blue-800/30' :
                                  inv.type === 'proforma' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/30' :
                                  'bg-emerald-950 text-emerald-400 border border-emerald-800/30'
                                }`}>
                                  {inv.type}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-bold text-white">
                                {inv.currency.symbol}{inv.totals.grandTotal.toLocaleString('en-IN')}
                              </td>
                              <td className="px-5 py-4">
                                {inv.isExported ? (
                                  <span className="text-green-500 font-semibold">✓ Exported (Live)</span>
                                ) : (
                                  <span className="text-slate-500 italic">✗ Draft (In-Editor)</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  inv.status === 'Paid' ? 'text-green-400 bg-green-500/10' :
                                  inv.status === 'Pending' ? 'text-amber-400 bg-amber-500/10' :
                                  inv.status === 'Draft' ? 'text-blue-400 bg-blue-500/10' :
                                  'text-red-400 bg-red-500/10'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to permanently delete this invoice?')) {
                                      if (inv.id) deleteInvoice(inv.id);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                                  title="Purge Record"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENT NUMBERING CONFIGURATION (Requirement 5) */}
          {activeTab === 'numbering' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Document Numbering Sequences</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage sequential prefix, starting index, and digit padding across Quotations, GST Invoices, Non-GST and Proforma.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNumberingSettings}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow"
                >
                  {numberingSaveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {numberingSaveSuccess ? 'Sequences Saved!' : 'Save Numbering Rules'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['quotation', 'gst', 'proforma', 'nongst'] as InvoiceType[]).map((type) => {
                  const conf = numberingSettings[type];
                  const labelMap: Record<InvoiceType, string> = {
                    quotation: 'Quotation Sequence',
                    gst: 'GST Tax Invoice Sequence',
                    proforma: 'Proforma Invoice Sequence',
                    nongst: 'Non-GST Invoice Sequence'
                  };
                  const nextPreview = getNextDocumentNumber(type, invoices, numberingSettings);

                  return (
                    <div key={type} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Hash className="h-4 w-4 text-blue-500" /> {labelMap[type]}
                        </span>
                        <div className="text-[10px] bg-slate-950 border border-slate-800 px-2.5 py-1 rounded font-mono font-bold text-blue-400">
                          Next: {nextPreview}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 font-medium mb-1">Prefix</label>
                          <input
                            type="text"
                            value={conf.prefix}
                            onChange={(e) => {
                              setNumberingSettings({
                                ...numberingSettings,
                                [type]: { ...conf, prefix: e.target.value.toUpperCase() }
                              });
                            }}
                            className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-medium mb-1">Starting Number</label>
                          <input
                            type="number"
                            value={conf.startNumber}
                            onChange={(e) => {
                              setNumberingSettings({
                                ...numberingSettings,
                                [type]: { ...conf, startNumber: parseInt(e.target.value, 10) || 1 }
                              });
                            }}
                            className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-medium mb-1">Digit Padding (e.g. 4 for 0001)</label>
                          <input
                            type="number"
                            min={1}
                            max={8}
                            value={conf.padLength}
                            onChange={(e) => {
                              setNumberingSettings({
                                ...numberingSettings,
                                [type]: { ...conf, padLength: parseInt(e.target.value, 10) || 4 }
                              });
                            }}
                            className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-medium mb-1">Separator</label>
                          <input
                            type="text"
                            value={conf.separator}
                            onChange={(e) => {
                              setNumberingSettings({
                                ...numberingSettings,
                                [type]: { ...conf, separator: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <input
                          type="checkbox"
                          id={`year-${type}`}
                          checked={conf.includeYear}
                          onChange={(e) => {
                            setNumberingSettings({
                              ...numberingSettings,
                              [type]: { ...conf, includeYear: e.target.checked }
                            });
                          }}
                          className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                        />
                        <label htmlFor={`year-${type}`} className="text-slate-400 font-medium">
                          Include Current Year in Number (e.g. {conf.prefix}-2026-...)
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & BACKUPS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Security Guards & Database Backups</h2>
                <p className="text-xs text-slate-400 mt-1">Configure credentials keys, backup systems, or clear storage cache.</p>
              </div>

              {/* Password change */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Change Admin Password</h3>
                <div className="max-w-xs">
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">New Console Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Backup & Restore triggers */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Master JSON Backup & Restore</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download a full backup of all configurations, pricing models, settings, and invoices, or restore from an existing JSON file.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Download className="h-4.5 w-4.5" /> Export Master Database
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
                  >
                    <Upload className="h-4.5 w-4.5 text-blue-400" /> Restore from JSON Backup
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleRestoreFile}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Admin console footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 no-print">
        <span>© 2026 BillWebz Console. All rights reserved. • Running Next.js Production Console</span>
      </footer>

    </div>
  );
}
