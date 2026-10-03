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
  Sparkles,
  Smartphone,
  Check,
  Zap,
  ArrowUpRight,
  Printer,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { UserNav } from '@/components/auth/UserNav';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { adminSettings } = useInvoiceStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "100% GST & Rule 46 Compliant",
      description: "Auto-detect CGST/SGST vs IGST based on place of supply and compute accurate HSN/SAC breakdowns instantly."
    },
    {
      icon: <Download className="h-6 w-6 text-primary" />,
      title: "High-Res Multi-Format PDF Export",
      description: "Download beautiful A4, Letter, or 80mm thermal receipt formats with intelligent multi-page pagination."
    },
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "WhatsApp & Email One-Click Sharing",
      description: "Share invoices directly with clients via WhatsApp Web or email shortcuts with pre-formatted summaries."
    },
    {
      icon: <Image className="h-6 w-6 text-primary" />,
      title: "Branding, Signatures & UPI QR",
      description: "Upload business logos, digital signatures, and dynamic UPI payment QR codes directly onto your invoices."
    },
    {
      icon: <Layout className="h-6 w-6 text-primary" />,
      title: "Multiple Layout Themes & Palettes",
      description: "Switch seamlessly between modern, professional, emerald, navy, charcoal, and monochrome document themes."
    },
    {
      icon: <Wifi className="h-6 w-6 text-primary" />,
      title: "100% Offline-First Privacy",
      description: "Your business data never leaves your device. Works completely offline inside browser IndexedDB storage."
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "With-GST & Tax Inclusive Options",
      description: "Auto-reverse calculate rates when clients specify gross amounts (e.g. ₹5,000 with GST) with one click."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "History, Backup & Duplication",
      description: "View past invoice records, update payment settlement statuses, duplicate previous bills, and export JSON backups."
    }
  ];

  const documentTypes = [
    {
      title: "GST Tax Invoice",
      badge: "Commercial & B2B",
      desc: "Full Rule 46 compliant tax invoices with HSN/SAC codes, reverse charge, inter/intra state tax splits, and bank details.",
      link: "/invoice/gst",
      color: "from-primary/10 border-primary/40 text-primary"
    },
    {
      title: "Quotation / Cost Estimate",
      badge: "Pre-Sales Proposal",
      desc: "Professional estimates with validity dates, scope of work notes, milestone payment terms, and client approval signatures.",
      link: "/invoice/quotation",
      color: "from-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Proforma Invoice",
      badge: "Advance Billing",
      desc: "Preliminary invoices for requesting advance payments, purchase order references, and export customs documentation.",
      link: "/invoice/proforma",
      color: "from-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400"
    },
    {
      title: "Regular Bill (Non-GST)",
      badge: "Simple Retail",
      desc: "Clean, streamlined billing for small retailers, service providers, and freelancers without GST registration requirements.",
      link: "/invoice/nongst",
      color: "from-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400"
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Enter Billing & Line Details",
      desc: "Type seller, buyer, and item rows. Rates, tax inclusive modes, GST splits, and words totals compute automatically."
    },
    {
      num: "02",
      title: "Customize Theme & Branding",
      desc: "Pick your accent palette, paper format (A4 / Letter / Thermal), upload company logo, signature, and UPI payment QR."
    },
    {
      num: "03",
      title: "Export PDF or Print Instantly",
      desc: "Generate crystal-clear, print-optimized commercial PDF invoices or share with clients over WhatsApp in seconds."
    }
  ];

  const defaultFaqs = [
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
      a: "Yes, it has a built-in state lookup engine. When you specify your Business State and the customer's Place of Supply, it will automatically apply CGST + SGST (intra-state transaction) or IGST (inter-state transaction)."
    },
    {
      q: "Can I enter a total amount that already includes GST?",
      a: "Yes! Each line item includes an 'Amount includes GST' toggle. If a customer says '₹5,000 with GST', you simply enter 5000 and enable the toggle. BillWebz will automatically calculate the exact taxable rate and tax breakdown."
    },
    {
      q: "Is there an Android mobile app available?",
      a: "Yes! We provide an installable Android APK file directly from our header and dashboard, allowing you to create and print invoices directly on your mobile device."
    },
    {
      q: "How can I back up my billing data?",
      a: "You can use our complete JSON Backup utility in the dashboard. This downloads your entire invoice database, settings, and default profile in a single JSON file which you can restore on any device."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Stitch SaaS Fixed Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur-xl border-b border-border/70 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Version Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tight text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Bill<span className="text-foreground">Webz</span></span>
            </Link>
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary text-primary font-bold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              100% GST Ready
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#documents" className="hover:text-foreground transition-colors">Document Types</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-primary hover:opacity-80 transition-colors font-bold">Dashboard</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Android APK Download Button */}
            <Link
              href="/BillWebz.apk"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 text-xs font-bold text-foreground transition-colors shadow-xs"
              title="Download Android App APK"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Android APK</span>
            </Link>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 transition-colors shrink-0 cursor-pointer active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
            </button>
            
            {/* User Account / Login */}
            <UserNav />

            {/* Create Invoice Primary Button */}
            <Link 
              href="/invoice/gst" 
              className="h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center gap-1 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Create Invoice</span>
              <span className="sm:hidden font-bold">Invoice</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Stitch Screen 5 Design) */}
      <section className="relative pt-12 md:pt-16 pb-20 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              {/* Compliance Pill */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-secondary text-foreground border border-border/80 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  100% GST & Rule 46 Compliant • NIC-Ready
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                Professional Invoices. <br />
                <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                  {adminSettings?.heroTitle || 'Simplified Business.'}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                {adminSettings?.heroSubtitle || 'Create GST tax invoices, quotations, and proforma bills with a streamlined billing workspace built for Indian businesses, retailers, and modern founders. Offline-first privacy and zero setup needed.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link 
                  href="/invoice/gst" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5"
                >
                  <FileText className="h-4 w-4" />
                  <span>Create GST Invoice</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link 
                  href="/invoice/quotation" 
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Quotation Maker</span>
                </Link>

                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm border border-border transition-colors"
                >
                  <span>Open Dashboard</span>
                </Link>
              </div>

              {/* Proof / Trust Badge */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-muted-foreground">
                <div className="flex items-center -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-sm">CA</div>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">MS</div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">BL</div>
                  <div className="w-8 h-8 rounded-full bg-secondary text-foreground font-black text-xs flex items-center justify-center shadow-sm border border-border">50k+</div>
                </div>
                <p className="text-xs sm:text-sm">
                  Trusted by <span className="font-bold text-foreground">50,000+ Indian Businesses</span>, CA firms & Freelancers
                </p>
              </div>
            </div>

            {/* Hero Right: 3D Simulated Interactive Document Canvas (Stitch Design) */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-primary/10 via-emerald-500/10 to-transparent rounded-3xl transform rotate-1 scale-95 blur-2xl pointer-events-none" />

              {/* Format Selector Pill */}
              <div className="absolute -top-3 right-6 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/80 shadow-md">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">A4 Sheet</span>
                <span className="px-2 py-0.5 rounded-full text-muted-foreground text-[10px] font-medium">Letter</span>
                <span className="px-2 py-0.5 rounded-full text-muted-foreground text-[10px] font-medium">Thermal 80mm</span>
              </div>

              {/* Document Sheet Card */}
              <div className="relative z-10 bg-card rounded-2xl border border-border/80 shadow-2xl p-6 sm:p-8">
                {/* Simulated Header */}
                <div className="flex items-start justify-between pb-4 border-b border-border/60">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">TAX INVOICE</span>
                    <span className="text-base sm:text-lg font-black text-foreground">INV-2026-0914</span>
                    <span className="text-xs text-muted-foreground">Date: 02 Oct, 2026 • Place of Supply: Delhi (07)</span>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      GST Registered
                    </div>
                    <div className="text-xs font-mono text-muted-foreground pt-1">GSTIN: 07AAAAA1111A1Z1</div>
                  </div>
                </div>

                {/* Seller & Buyer Split */}
                <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-secondary/50 rounded-xl my-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Billed By</span>
                    <div className="font-bold text-foreground text-sm">Bharat Tech Solutions</div>
                    <div className="text-xs text-muted-foreground truncate">Connaught Place, New Delhi</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Billed To</span>
                    <div className="font-bold text-foreground text-sm">Apex Retail Enterprise</div>
                    <div className="text-xs text-muted-foreground truncate">GSTIN: 07BBBBB2222B2Z2</div>
                  </div>
                </div>

                {/* Simulated Line Items Table */}
                <div className="overflow-x-auto my-3 border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-secondary/70 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/50">
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-2">HSN</th>
                        <th className="py-2 px-2 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Rate</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-foreground">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Web Development & Cloud Consulting</td>
                        <td className="py-2.5 px-2 text-muted-foreground font-mono">998314</td>
                        <td className="py-2.5 px-2 text-right">1</td>
                        <td className="py-2.5 px-3 text-right">₹40,000.00</td>
                        <td className="py-2.5 px-3 text-right font-bold">₹40,000.00</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Annual Server Infrastructure Maintenance</td>
                        <td className="py-2.5 px-2 text-muted-foreground font-mono">998713</td>
                        <td className="py-2.5 px-2 text-right">1</td>
                        <td className="py-2.5 px-3 text-right">₹10,000.00</td>
                        <td className="py-2.5 px-3 text-right font-bold">₹10,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tax Summary & QR */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3 items-center border-t border-border/60">
                  <div className="sm:col-span-6 flex items-center gap-3 bg-secondary/50 p-3 rounded-xl">
                    <div className="w-12 h-12 bg-card p-1 rounded-lg border border-border flex items-center justify-center shrink-0">
                      <svg className="w-10 h-10 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4 4h4v4h-4v-4zm4-4v-4h-4v4h4zm-4-4h4v-4h-4v4zm-2 2h2v2h-2v-2zm0 4h2v2h-2v-2z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-foreground">Scan to Pay via UPI</span>
                      <span className="text-xs text-muted-foreground font-mono">bharat@okhdfcbank</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Instant Verification</span>
                    </div>
                  </div>

                  <div className="sm:col-span-6 flex flex-col gap-1 text-right text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxable Value:</span>
                      <span className="font-semibold text-foreground">₹50,000.00</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST (9%) + SGST (9%):</span>
                      <span className="font-semibold text-foreground">₹9,000.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-border/40 text-foreground">
                      <span>Grand Total:</span>
                      <span className="text-primary text-base font-extrabold">₹59,000.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Document Types Showcase (Stitch Screen 5) */}
      <section id="documents" className="py-20 bg-secondary/30 border-y border-border/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              Versatile Document Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 text-foreground">
              Everything Your Business Needs to Bill
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
              Generate officially accepted tax invoices, cost estimates, and proforma bills with automatic sequential numbering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentTypes.map((doc, idx) => (
              <div 
                key={idx}
                className="bg-card border border-border/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-foreground`}>
                    {doc.badge}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {doc.desc}
                  </p>
                </div>

                <Link
                  href={doc.link}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Open Generator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Feature Showcase Grid */}
      <section id="features" className="py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
              Engineered For Reliability
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 text-foreground">
              Built for Modern Indian Commerce
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
              From small retail counters to multi-state enterprise consulting, BillWebz handles every billing requirement.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-card border border-border/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-start"
              >
                <div className="p-3 bg-secondary rounded-xl mb-4 border border-border/50">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: 3-Step Process (Stitch How It Works) */}
      <section id="how-it-works" className="py-20 bg-secondary/30 border-y border-border/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              How BillWebz Works
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Generate print-ready commercial tax bills in under sixty seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center bg-card p-8 rounded-2xl border border-border/80 shadow-sm">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md mb-5">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: 100% Free Lifetime Billing (No Subscriptions Required) */}
      <section id="pricing" className="py-24 border-b border-border/70 bg-secondary/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
              100% Free Forever
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 text-foreground">
              Zero Subscriptions. Completely Free.
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-base text-muted-foreground">
              All features, document generators, PDF downloads, and cloud sync are 100% free with no paywalls or hidden fees.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-card border-2 border-primary/40 p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between gap-8 relative">
              <span className="absolute top-0 right-8 -translate-y-1/2 px-3.5 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">
                UNLIMITED FREE ACCESS
              </span>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-black text-foreground">BillWebz Community Edition</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">₹0</span>
                    <span className="ml-2 text-xs text-muted-foreground font-semibold">/ Lifetime Free</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Built for everyday business operations. Unlimited GST Tax Invoices, Non-GST Bills, Quotations, and Proforma documents.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 border-t border-border/60 pt-6">
                  {[
                    'Full GST & Non-GST Invoicing',
                    'Quotation & Proforma Generator',
                    'High-Res Multi-Format PDF Export',
                    'Zero Subscription Locks or Limits',
                    'Custom Logo & Signature Upload',
                    'Dynamic UPI QR Payment Codes',
                    'WhatsApp & Email Direct Sharing',
                    'Secure Firebase Cloud Backup & Sync'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground font-medium">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border/60">
                <Link
                  href="/invoice/gst"
                  className="w-full sm:flex-1 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md text-center transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Creating Invoices</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/invoice/nongst"
                  className="w-full sm:flex-1 py-3.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-xs sm:text-sm rounded-xl text-center transition-all"
                >
                  Create Non-GST Bill
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ Accordion Section */}
      <section className="py-20 bg-secondary/30 border-b border-border/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-center mb-12 sm:text-4xl text-foreground">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {(adminSettings?.faqList || defaultFaqs).map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border/80 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base hover:bg-secondary/40 transition-colors"
                >
                  <span className="text-foreground">{faq.q}</span>
                  <Plus className={`h-4 w-4 text-muted-foreground transform transition-transform duration-200 shrink-0 ml-2 ${activeFaq === idx ? 'rotate-45' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 border-t border-border/30 text-xs sm:text-sm text-muted-foreground leading-relaxed bg-secondary/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-card border-t border-border/70 py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-black text-xl tracking-tight text-foreground">BillWebz</span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            © 2026 BillWebz. All rights reserved. • <span className="font-bold text-primary">Created By Webz Technologies</span>
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground justify-center md:justify-end font-semibold">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/invoice/gst" className="hover:text-primary transition-colors">GST Creator</Link>
            <Link href="/invoice/quotation" className="hover:text-primary transition-colors">Quotation Creator</Link>
            <Link href="/invoice/proforma" className="hover:text-primary transition-colors">Proforma Creator</Link>
            <Link href="/BillWebz.apk" className="hover:text-primary text-emerald-600 dark:text-emerald-400 font-bold transition-colors">Android App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
