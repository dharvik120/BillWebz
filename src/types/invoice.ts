export interface SellerDetails {
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logoUrl?: string;
  signatureUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiQrUrl?: string;
  upiId?: string;
}

export interface BuyerDetails {
  name: string;
  companyName?: string;
  gstin?: string;
  phone?: string;
  email?: string;
  billingAddress?: string;
  shippingAddress?: string;
  state?: string;
  country?: string;
  placeOfSupply?: string;
}

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  hsnSac?: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  gstPercent: number;
  cgst: number;
  sgst: number;
  igst: number;
  cessPercent: number;
  cessAmount: number;
  taxableValue: number;
  finalAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discountTotal: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  cessTotal: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Cancelled' | 'Draft';
export type InvoiceType = 'gst' | 'proforma' | 'quotation';
export type InvoiceTheme = 'blue' | 'slate' | 'emerald' | 'charcoal' | 'gold';
export type PaperSize = 'a4' | 'letter' | 'thermal80';

export interface InvoiceMetadata {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  referenceNumber?: string;
  transportMode?: string;
  vehicleNumber?: string;
  deliveryNote?: string;
  dispatchThrough?: string;
  termsOfDelivery?: string;
  reverseCharge?: boolean;
  ewayBillNumber?: string;
  
  // Proforma exclusive fields
  validityDays?: number;
  validUntilDate?: string;
  expectedDeliveryDate?: string;
  paymentTerms?: string;
}

export interface Invoice {
  id?: string; // Auto-increment/string for IndexedDB
  type: InvoiceType;
  status: InvoiceStatus;
  theme: InvoiceTheme;
  paperSize: PaperSize;
  currency: {
    symbol: string;
    code: string;
  };
  watermark: boolean;
  
  sellerDetails: SellerDetails;
  buyerDetails: BuyerDetails;
  metadata: InvoiceMetadata;
  items: LineItem[];
  totals: InvoiceTotals;
  
  // Additional section details
  termsAndConditions?: string;
  notes?: string;
  declaration?: string;
  authorizedSignatoryName?: string;
  isComputerGenerated: boolean;
  
  // Proforma exclusive
  quotationNotes?: string;
  showTax: boolean; // Proforma option to hide tax details
  isExported?: boolean; // Marks if PDF has been downloaded
  createdAt: number;
  updatedAt: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

export interface AdminSettings {
  adminPassword?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  faqList?: { q: string; a: string }[];
  pricingPlans?: PricingPlan[];
  isSubscriptionLocked?: boolean;
  contactEmail?: string;
}


export interface SystemBackup {
  version: string;
  invoices: Invoice[];
  settings: {
    defaultSeller: SellerDetails;
    defaultTerms: string;
    defaultDeclaration: string;
    defaultCurrency: { symbol: string; code: string };
  };
}
