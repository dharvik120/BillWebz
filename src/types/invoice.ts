export interface PaymentDetails {
  paymentMethod?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  accountType?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
  upiQrUrl?: string;
  transactionReference?: string;
  paymentInstructions?: string;
}

export interface SellerDetails {
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logoUrl?: string;
  signatureUrl?: string;
  paymentMethod?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiQrUrl?: string;
  upiId?: string;
  paymentInstructions?: string;
}

export interface BuyerDetails {
  name: string;
  companyName?: string;
  gstin?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  pincode?: string;
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
  isTaxInclusive?: boolean;
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
export type InvoiceType = 'gst' | 'proforma' | 'quotation' | 'nongst';
export type InvoiceTheme = 'blue' | 'navy' | 'emerald' | 'burgundy' | 'slate' | 'charcoal' | 'monochrome' | 'gold';
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
  paymentDetails?: PaymentDetails;
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
  showTax: boolean; // Proforma / Non-GST option to hide tax details
  isExported?: boolean; // Marks if PDF has been downloaded
  // User association
  userId?: string;
  userEmail?: string;
  clientId?: string;
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

export interface NumberingSequenceConfig {
  prefix: string;
  yearFormat?: 'YYYY' | 'YY' | 'NONE';
  startingNumber?: number;
  startNumber?: number;
  padLength: number;
  includeYear?: boolean;
  separator?: string;
}

export interface NumberingSettings {
  gst: NumberingSequenceConfig;
  nongst: NumberingSequenceConfig;
  quotation: NumberingSequenceConfig;
  proforma: NumberingSequenceConfig;
}

export interface AdminSettings {
  adminPassword?: string;
  adminEmail?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  faqList?: { q: string; a: string }[];
  pricingPlans?: PricingPlan[];
  isSubscriptionLocked?: boolean;
  contactEmail?: string;
  numbering?: NumberingSettings;
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
