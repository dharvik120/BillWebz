'use client';

import React, { useState, useEffect } from 'react';
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
  Database,
  ShieldAlert,
  Globe,
  Sparkles,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { AdminSettings, PricingPlan, Invoice } from '@/types/invoice';

export default function AdminPortal() {
  const router = useRouter();
  const { 
    invoices, 
    adminSettings, 
    saveAdminSettings, 
    deleteInvoice,
    updateInvoiceStatus,
    exportBackup,
    loadInvoices
  } = useInvoiceStore();

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<'customizer' | 'faqs' | 'pricing' | 'ledger' | 'security'>('customizer');

  // Form states matching adminSettings
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubscriptionLocked, setIsSubscriptionLocked] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [faqList, setFaqList] = useState<{ q: string; a: string }[]>([]);
  const [adminPassword, setAdminPassword] = useState('');

  // Editing state for new entries
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = adminSettings?.adminPassword || 'admin123';
    if (username === 'admin' && password === correctPassword) {
      sessionStorage.setItem('billwebz_admin_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError('');
      loadInvoices();
    } else {
      setLoginError('Invalid Administrator Username or Password.');
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
              <div>
                <h2 className="text-xl font-extrabold text-white">Master Invoices Registry Ledger</h2>
                <p className="text-xs text-slate-400 mt-1">Review, modify statuses, or delete all active drafts and exported sheets across client nodes.</p>
              </div>

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
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-800/25 transition-colors">
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & BACKUPS */}
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

              {/* Backup triggers */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">Master JSON Backup utility</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download a full backup of all configurations, pricing models, settings, and invoices inside the system.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Database className="h-4.5 w-4.5" /> Export Master Database
                </button>
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
