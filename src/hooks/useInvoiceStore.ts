import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { Invoice, SellerDetails, InvoiceStatus, InvoiceType, AdminSettings } from '../types/invoice';
import { isFirebaseEnabled, db as firebaseDb } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';

const CLIENT_ID_KEY = 'billwebz_client_id';
let localClientId = '';
if (typeof window !== 'undefined') {
  localClientId = localStorage.getItem(CLIENT_ID_KEY) || '';
  if (!localClientId) {
    localClientId = 'client_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(CLIENT_ID_KEY, localClientId);
  }
}

const DEFAULT_SELLER_KEY = 'billwebz_default_seller';
const DEFAULT_TERMS_KEY = 'billwebz_default_terms';
const DEFAULT_DECLARATION_KEY = 'billwebz_default_declaration';
const DEFAULT_CURRENCY_KEY = 'billwebz_default_currency';
const ADMIN_SETTINGS_KEY = 'billwebz_admin_settings';

const defaultAdminSettings: AdminSettings = {
  adminPassword: 'admin123',
  heroTitle: 'Generate Professional GST, Proforma & Quotations Instantly',
  heroSubtitle: 'Create customizable, print-ready billing documents directly in your browser. Offline-first database protection, automatic GST calculations, and zero setup configurations.',
  contactEmail: 'support@billwebz.com',
  isSubscriptionLocked: false,
  pricingPlans: [
    {
      id: 'plan-basic',
      name: 'Free Starter Plan',
      price: '₹0',
      period: 'lifetime',
      features: ['GST Invoicing', 'Proforma Creator', 'Quotation Generator', 'Offline Storage', 'PDF Export'],
      buttonText: 'Get Started Free',
    },
    {
      id: 'plan-premium',
      name: 'Business Pro Plan',
      price: '₹499',
      period: 'month',
      features: ['Unlimited Documents', 'Custom Branding logo', 'Custom Signature upload', 'WhatsApp Direct Sharing', 'Premium Emerald & Gold Themes', '24/7 Admin Support'],
      buttonText: 'Upgrade to Premium',
      isPopular: true,
    }
  ],
  faqList: [
    {
      q: 'Is my business data secure on BillWebz?',
      a: 'Yes, 100%. BillWebz does not upload your invoice, customer, or seller data to any external server. All details are kept directly inside your browser\'s IndexedDB and LocalStorage database. It is completely private and secure.'
    },
    {
      q: 'Can I use BillWebz without an active internet connection?',
      a: 'Absolutely. Once the site is loaded, it is completely self-contained. You can create, calculate, modify, and export invoices to PDF offline in a plane, train, or warehouse without connection.'
    },
    {
      q: 'Does it support both CGST/SGST and IGST?',
      a: 'Yes, it has a built-in state lookup engine. When you select your Business State and the customer\'s Place of Supply, it will automatically apply CGST + SGST (intra-state transaction) or IGST (inter-state transaction).'
    },
    {
      q: 'What types of paper size layouts are available?',
      a: 'BillWebz supports Standard A4 page size, US Letter page size, and 80mm POS Thermal Receipt paper format, suitable for retail POS printing.'
    },
    {
      q: 'How can I back up my billing data?',
      a: 'You can use our complete JSON Backup utility in the settings. This downloads your entire invoice database, settings, and default profile in a single JSON file which you can restore on any device.'
    }
  ]
};

const defaultSellerInitial: SellerDetails = {
  name: '',
  gstin: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  state: 'Delhi',
  country: 'IN',
  pincode: '',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  upiId: '',
};

const defaultTermsInitial = '1. Payment is due within the stipulated date.\n2. Interest @ 18% per annum will be charged on late payments.\n3. Goods once sold will not be taken back or exchanged.';
const defaultDeclarationInitial = 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.';
const defaultCurrencyInitial = { symbol: '₹', code: 'INR' };

export function useInvoiceStore() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [defaultSeller, setDefaultSeller] = useState<SellerDetails>(defaultSellerInitial);
  const [defaultTerms, setDefaultTerms] = useState<string>(defaultTermsInitial);
  const [defaultDeclaration, setDefaultDeclaration] = useState<string>(defaultDeclarationInitial);
  const [defaultCurrency, setDefaultCurrency] = useState<{ symbol: string; code: string }>(defaultCurrencyInitial);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultAdminSettings);

  // Load defaults from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSeller = localStorage.getItem(DEFAULT_SELLER_KEY);
        if (storedSeller) setDefaultSeller(JSON.parse(storedSeller));

        const storedTerms = localStorage.getItem(DEFAULT_TERMS_KEY);
        if (storedTerms) setDefaultTerms(storedTerms);

        const storedDec = localStorage.getItem(DEFAULT_DECLARATION_KEY);
        if (storedDec) setDefaultDeclaration(storedDec);

        const storedCurr = localStorage.getItem(DEFAULT_CURRENCY_KEY);
        if (storedCurr) setDefaultCurrency(JSON.parse(storedCurr));
      } catch (e) {
        console.error('Failed to load settings from LocalStorage', e);
      }
    }
  }, []);

  // Fetch adminSettings from Firestore (fallback to LocalStorage)
  useEffect(() => {
    const fetchAdminSettings = async () => {
      if (isFirebaseEnabled && firebaseDb) {
        try {
          const docRef = doc(firebaseDb, 'settings', 'default');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAdminSettings(docSnap.data() as AdminSettings);
          } else {
            await setDoc(docRef, defaultAdminSettings);
            setAdminSettings(defaultAdminSettings);
          }
        } catch (e) {
          console.error('Failed to load settings from Firestore, loading locally', e);
          const storedAdmin = localStorage.getItem(ADMIN_SETTINGS_KEY);
          if (storedAdmin) setAdminSettings(JSON.parse(storedAdmin));
        }
      } else {
        const storedAdmin = localStorage.getItem(ADMIN_SETTINGS_KEY);
        if (storedAdmin) setAdminSettings(JSON.parse(storedAdmin));
      }
    };
    fetchAdminSettings();
  }, []);

  // Fetch all invoices
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('billwebz_admin_logged_in') === 'true';

      if (isFirebaseEnabled && firebaseDb) {
        const invoicesCol = collection(firebaseDb, 'invoices');
        let q;
        if (isAdmin) {
          // Admin sees all invoices
          q = query(invoicesCol);
        } else {
          // Public clients see only their own invoices
          q = query(invoicesCol, where('clientId', '==', localClientId));
        }

        const querySnapshot = await getDocs(q);
        const cloudInvoices: Invoice[] = [];
        querySnapshot.forEach((docSnap) => {
          cloudInvoices.push({ id: docSnap.id, ...docSnap.data() } as Invoice);
        });

        cloudInvoices.sort((a, b) => b.updatedAt - a.updatedAt);
        setInvoices(cloudInvoices);

        // Sync local IndexedDB cache with firestore state
        await db.invoices.clear();
        for (const inv of cloudInvoices) {
          await db.invoices.put(inv);
        }
      } else {
        const allInvoices = await db.invoices.toArray();
        allInvoices.sort((a, b) => b.updatedAt - a.updatedAt);
        setInvoices(allInvoices);
      }
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Save Settings
  const saveSettings = useCallback((
    seller: SellerDetails,
    terms: string,
    declaration: string,
    currency: { symbol: string; code: string }
  ) => {
    setDefaultSeller(seller);
    setDefaultTerms(terms);
    setDefaultDeclaration(declaration);
    setDefaultCurrency(currency);

    localStorage.setItem(DEFAULT_SELLER_KEY, JSON.stringify(seller));
    localStorage.setItem(DEFAULT_TERMS_KEY, terms);
    localStorage.setItem(DEFAULT_DECLARATION_KEY, declaration);
    localStorage.setItem(DEFAULT_CURRENCY_KEY, JSON.stringify(currency));
  }, []);

  // Create or Update Invoice
  const saveInvoice = useCallback(async (invoice: Invoice) => {
    const timestamp = Date.now();
    const id = invoice.id || Math.random().toString(36).substring(2, 11);
    
    const invoiceToSave = {
      ...invoice,
      id,
      clientId: (invoice as any).clientId || localClientId,
      createdAt: invoice.createdAt || timestamp,
      updatedAt: timestamp,
    };
    
    await db.invoices.put(invoiceToSave);

    if (isFirebaseEnabled && firebaseDb) {
      const docRef = doc(firebaseDb, 'invoices', id);
      await setDoc(docRef, invoiceToSave);
    }

    await loadInvoices();
    return invoiceToSave;
  }, [loadInvoices]);

  // Delete Invoice
  const deleteInvoice = useCallback(async (id: string) => {
    await db.invoices.delete(id);
    
    if (isFirebaseEnabled && firebaseDb) {
      const docRef = doc(firebaseDb, 'invoices', id);
      await deleteDoc(docRef);
    }

    await loadInvoices();
  }, [loadInvoices]);

  // Duplicate Invoice
  const duplicateInvoice = useCallback(async (invoice: Invoice) => {
    const timestamp = Date.now();
    const duplicated: Invoice = {
      ...invoice,
      id: Math.random().toString(36).substring(2, 11),
      metadata: {
        ...invoice.metadata,
        invoiceNumber: `${invoice.metadata.invoiceNumber}-COPY`,
      },
      status: 'Draft', // reset status to draft for the duplicate
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.invoices.put(duplicated);
    await loadInvoices();
  }, [loadInvoices]);

  // Update Status
  const updateInvoiceStatus = useCallback(async (id: string, status: InvoiceStatus) => {
    const invoice = await db.invoices.get(id);
    if (invoice) {
      invoice.status = status;
      invoice.updatedAt = Date.now();
      await db.invoices.put(invoice);
      
      if (isFirebaseEnabled && firebaseDb) {
        const docRef = doc(firebaseDb, 'invoices', id);
        await setDoc(docRef, invoice);
      }

      await loadInvoices();
    }
  }, [loadInvoices]);

  // Metrics Calculation
  const getMetrics = useCallback(() => {
    const totalCount = invoices.filter((i) => i.isExported === true).length;
    const gstCount = invoices.filter((i) => i.type === 'gst' && i.isExported === true).length;
    const proformaCount = invoices.filter((i) => i.type === 'proforma' && i.isExported === true).length;
    const quotationCount = invoices.filter((i) => i.type === 'quotation' && i.isExported === true).length;

    // Monthly revenue calculation (only counting 'Paid' and 'Pending' invoices)
    // Grouped by Month-Year of invoiceDate
    const monthlyRevenueMap: { [key: string]: number } = {};
    const statusCounts = {
      Paid: 0,
      Pending: 0,
      Cancelled: 0,
      Draft: 0,
    };

    invoices.forEach((inv) => {
      if (!inv.isExported) return;
      // Aggregate status
      statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;

      // Only sum revenue if not Cancelled or Draft
      if (inv.status === 'Paid' || inv.status === 'Pending') {
        const date = new Date(inv.metadata.invoiceDate || inv.createdAt);
        if (!isNaN(date.getTime())) {
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyRevenueMap[monthYear] = (monthlyRevenueMap[monthYear] || 0) + inv.totals.grandTotal;
        }
      }
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([name, total]) => ({
      name,
      total,
    })).slice(-6); // Limit to last 6 months

    const totalRevenue = invoices
      .filter((i) => i.status === 'Paid')
      .reduce((sum, i) => sum + i.totals.grandTotal, 0);

    const pendingRevenue = invoices
      .filter((i) => i.status === 'Pending')
      .reduce((sum, i) => sum + i.totals.grandTotal, 0);

    return {
      totalCount,
      gstCount,
      proformaCount,
      quotationCount,
      totalRevenue,
      pendingRevenue,
      statusCounts,
      monthlyRevenue,
    };
  }, [invoices]);

  // Export database and settings
  const exportBackup = useCallback((): string => {
    const backupData = {
      version: '1.0.0',
      invoices,
      settings: {
        defaultSeller,
        defaultTerms,
        defaultDeclaration,
        defaultCurrency,
      },
    };
    return JSON.stringify(backupData, null, 2);
  }, [invoices, defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency]);

  // Restore database and settings
  const restoreBackup = useCallback(async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.version || !Array.isArray(data.invoices)) {
        return false;
      }

      // Clear existing invoices and insert new ones
      await db.invoices.clear();
      for (const inv of data.invoices) {
        await db.invoices.put(inv);
      }

      // Restore settings if present
      if (data.settings) {
        const { defaultSeller, defaultTerms, defaultDeclaration, defaultCurrency } = data.settings;
        if (defaultSeller) saveSettings(defaultSeller, defaultTerms || '', defaultDeclaration || '', defaultCurrency || defaultCurrencyInitial);
      }

      await loadInvoices();
      return true;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  }, [loadInvoices, saveSettings]);

  const saveAdminSettings = useCallback(async (settings: AdminSettings) => {
    setAdminSettings(settings);
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    if (isFirebaseEnabled && firebaseDb) {
      try {
        const docRef = doc(firebaseDb, 'settings', 'default');
        await setDoc(docRef, settings);
      } catch (e) {
        console.error('Failed to save settings to Firestore', e);
      }
    }
  }, []);

  return {
    invoices,
    loading,
    defaultSeller,
    defaultTerms,
    defaultDeclaration,
    defaultCurrency,
    adminSettings,
    saveAdminSettings,
    saveSettings,
    saveInvoice,
    deleteInvoice,
    duplicateInvoice,
    updateInvoiceStatus,
    getMetrics,
    exportBackup,
    restoreBackup,
    loadInvoices,
  };
}
