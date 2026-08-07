'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Receipt, 
  ShieldCheck, 
  Download, 
  Share2, 
  Image, 
  Layout, 
  Moon, 
  Sun, 
  Wifi, 
  Database,
  ArrowRight,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { Check } from 'lucide-react';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { adminSettings } = useInvoiceStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
      title: "GST Ready",
      description: "Auto-detect CGST/SGST vs IGST based on location and compute exact tax structures instantly."
    },
    {
      icon: <Download className="h-6 w-6 text-blue-500" />,
      title: "High-Res PDF Export",
      description: "Download beautiful A4, Letter, or 80mm thermal receipt formats with optimized print spacing."
    },
    {
      icon: <Share2 className="h-6 w-6 text-blue-500" />,
      title: "WhatsApp & Email Ready",
      description: "Share invoices directly with clients via WhatsApp Web or email shortcuts in one click."
    },
    {
      icon: <Image className="h-6 w-6 text-blue-500" />,
      title: "Business Branding",
      description: "Upload business logos, digital signatures, and UPI payment QR codes to personalize invoices."
    },
    {
      icon: <Layout className="h-6 w-6 text-blue-500" />,
      title: "Multiple Layout Themes",
      description: "Switch between modern, professional, minimalist, and charcoal styles with custom accent colors."
    },
    {
      icon: <Wifi className="h-6 w-6 text-blue-500" />,
      title: "100% Offline First",
      description: "Your business data never leaves your device. Works completely offline using IndexedDB."
    },
    {
      icon: <Database className="h-6 w-6 text-blue-500" />,
      title: "IndexedDB Auto-Save",
      description: "Autosaves edits in real time, keeping your active drafts secure even if you close the tab."
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      title: "History & Duplicates",
      description: "View invoice logs, search past drafts, update payment status, and duplicate previous bills."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Input Billing Details",
      desc: "Fill in seller, buyer, and item rows. Taxes, subtotals, and words calculations update in real time."
    },
    {
      num: "02",
      title: "Select Theme & Design",
      desc: "Choose colors, adjust layouts, and toggle terms, payment methods, signatures, or watermarks."
    },
    {
      num: "03",
      title: "Download or Share",
      desc: "Generate print-ready, high-resolution PDF bills or share them directly via messaging shortcuts."
    }
  ];

  const faqs = [
    {
      q: "Is my business data secure on BillWebz?",
      a: "Yes, 100%. BillWebz does not upload your invoice, customer, or seller data to any external server. All details are kept directly inside your browser's IndexedDB and LocalStorage database. It is completely private and secure."
    },
    {
      q: "Can I use BillWebz without an active internet connection?",
      a: "Absolutely. Once the site is loaded, it is completely self-contained. You can create, calculate, modify, and export invoices to PDF offline in a plane, train, or warehouse without connection."
    },
    {
      q: "Does it support both CGST/SGST and IGST?",
      a: "Yes, it has a built-in state lookup engine. When you select your Business State and the customer's Place of Supply, it will automatically apply CGST + SGST (intra-state transaction) or IGST (inter-state transaction)."
    },
    {
      q: "What types of paper size layouts are available?",
      a: "BillWebz supports Standard A4 page size, US Letter page size, and 80mm POS Thermal Receipt paper format, suitable for retail POS printing."
    },
    {
      q: "How can I back up my billing data?",
      a: "You can use our complete JSON Backup utility in the settings. This downloads your entire invoice database, settings, and default profile in a single JSON file which you can restore on any device."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-blue-600 dark:text-blue-500 tracking-tight">
            <Sparkles className="h-6 w-6" />
            <span>BillWebz</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/invoice/gst" className="hover:text-blue-600 transition-colors">GST Invoice</Link>
            <Link href="/invoice/proforma" className="hover:text-blue-600 transition-colors">Proforma Invoice</Link>
            <Link href="/invoice/quotation" className="hover:text-blue-600 transition-colors">Quotation Generator</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-secondary/80 border border-border/30 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-600" />}
            </button>
            
            <Link 
              href="/dashboard" 
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow-md"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background gradient flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            100% Free & Offline Professional Billing
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none mb-6"
          >
            Generate Professional <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {adminSettings?.heroTitle || 'GST, Proforma & Quotations'}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed"
          >
            {adminSettings?.heroSubtitle || 'Create customizable, print-ready billing documents directly in your browser. Offline-first database protection, automatic GST calculations, and zero setup configurations.'}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/invoice/gst" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-none hover:-translate-y-0.5 transition-all"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create GST Invoice
            </Link>
            
            <Link 
              href="/invoice/proforma" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-foreground bg-card hover:bg-secondary border border-border/80 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <Receipt className="mr-2 h-4 w-4" />
              Create Proforma Invoice
            </Link>

            <Link 
              href="/invoice/quotation" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 dark:shadow-none hover:-translate-y-0.5 transition-all"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Quotation Generator
            </Link>

            <Link 
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
            >
              Open Dashboard
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 border border-border/60 rounded-2xl overflow-hidden shadow-2xl bg-card/40 backdrop-blur-sm"
          >
            <div className="h-10 bg-muted/60 flex items-center gap-2 px-4 border-b border-border/40">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="text-xs text-muted-foreground ml-2 font-mono">BillWebz Professional Editor Preview</span>
            </div>
            <div className="aspect-[16/10] bg-slate-900 flex items-center justify-center p-8 text-slate-400">
              {/* Decorative visual dashboard preview representation */}
              <div className="w-full h-full border border-slate-700/50 rounded-lg p-6 bg-slate-950 flex flex-col justify-between text-left">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">BillWebz Inc.</h3>
                    <p className="text-xs text-slate-500">GSTIN: 07AAAAA1111A1Z1</p>
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded text-xs font-semibold">
                    GST TAX INVOICE
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs py-4">
                  <div>
                    <span className="text-slate-500 block">Billed To</span>
                    <strong className="text-slate-200">Acme Corp</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Invoice Date</span>
                    <span className="text-slate-300">07-Aug-2026</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Place of Supply</span>
                    <span className="text-slate-300">Delhi (07)</span>
                  </div>
                </div>
                <div className="border border-slate-800 rounded overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-900 p-2 font-semibold text-slate-300">
                    <div className="col-span-6">Item Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  <div className="grid grid-cols-12 p-2 border-t border-slate-900 bg-slate-950">
                    <div className="col-span-6 text-slate-300">Premium SaaS Subscription</div>
                    <div className="col-span-2 text-right text-slate-400">1.00</div>
                    <div className="col-span-2 text-right text-slate-400">₹49,999.00</div>
                    <div className="col-span-2 text-right text-slate-200 font-medium">₹49,999.00</div>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-slate-800 pt-4">
                  <div className="text-xs">
                    <p className="text-slate-500">Total Tax: CGST (9%) + SGST (9%)</p>
                    <p className="text-slate-400 font-mono">Amount: ₹58,998.82</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-xs">Grand Total</span>
                    <strong className="text-lg text-white">₹59,000.00</strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-secondary/35 border-y border-border/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Enterprise Billing Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Everything you need to create, manage, print, and track sales receipts with ease.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-card border border-border/70 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-start"
              >
                <div className="p-3 bg-blue-500/10 rounded-xl mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dynamic Subscription Pricing Plans Section */}
      <section className="py-24 border-b border-border/40 relative no-print bg-gradient-to-b from-card/30 to-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">Pricing Plans</span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-3">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-base text-muted-foreground">
              Select the best business plan to streamline your sales invoicing, estimate quotation workflows, and proforma bills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {(adminSettings?.pricingPlans || []).map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-card border p-8 rounded-3xl shadow-sm flex flex-col justify-between gap-6 relative transition-all duration-300 hover:shadow-lg ${
                  plan.isPopular 
                    ? 'border-blue-500 ring-2 ring-blue-500/10 dark:ring-0 md:-translate-y-2' 
                    : 'border-border/80'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                    RECOMMENDED
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-black text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">{plan.price}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground font-medium">/ {plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="h-4.5 w-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => alert(`Upgrading to ${plan.name} plans...`)}
                  className={`w-full py-3.5 text-xs font-black rounded-xl transition-all ${
                    plan.isPopular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/20' 
                      : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border/80'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Step Process */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              How BillWebz Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Generate commercial tax bills in under a minute with three simple actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-400 to-transparent z-0 pointer-events-none" />
                )}
                <div className="relative z-10 w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-lg mb-6">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary/20 border-t border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-12 sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {(adminSettings?.faqList || faqs).map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border/60 rounded-xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-base hover:bg-secondary/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <Plus className={`h-5 w-5 text-muted-foreground transform transition-transform duration-200 ${activeFaq === idx ? 'rotate-45' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 border-t border-border/20 text-sm text-muted-foreground leading-relaxed bg-secondary/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-card border-t border-border/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="font-extrabold text-xl tracking-tight text-blue-600">BillWebz</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 BillWebz. All rights reserved. • <span className="font-semibold text-blue-600 dark:text-blue-400">Created By Webz Technologies</span>
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground justify-center md:justify-end">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link href="/invoice/gst" className="hover:text-blue-600 transition-colors">GST Creator</Link>
            <Link href="/invoice/proforma" className="hover:text-blue-600 transition-colors">Proforma Creator</Link>
            <Link href="/invoice/quotation" className="hover:text-blue-600 transition-colors font-bold text-emerald-600 dark:text-emerald-400">Quotation Creator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
