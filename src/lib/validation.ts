import { z } from 'zod';

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PHONE_REGEX = /^[0-9]{10,12}$/;

export const sellerSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  gstin: z.string().refine((val) => !val || GSTIN_REGEX.test(val), {
    message: 'Invalid GSTIN format (e.g., 07AAAAA1111A1Z1)',
  }).optional().or(z.literal('')),
  phone: z.string().refine((val) => !val || PHONE_REGEX.test(val), {
    message: 'Invalid phone number (must be 10-12 digits)',
  }).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 digits').optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  signatureUrl: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  upiQrUrl: z.string().optional(),
  upiId: z.string().optional(),
});

export const buyerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  companyName: z.string().optional(),
  gstin: z.string().refine((val) => !val || GSTIN_REGEX.test(val), {
    message: 'Invalid GSTIN format',
  }).optional().or(z.literal('')),
  phone: z.string().refine((val) => !val || PHONE_REGEX.test(val), {
    message: 'Invalid phone number',
  }).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  billingAddress: z.string().min(1, 'Billing address is required'),
  shippingAddress: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  placeOfSupply: z.string().min(1, 'Place of supply is required'),
});

export const lineItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  hsnSac: z.string().optional(),
  quantity: z.number().min(0.0001, 'Qty must be > 0'),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.number().min(0, 'Rate must be >= 0'),
  isTaxInclusive: z.boolean().optional().default(false),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.number().default(0),
  gstPercent: z.number().min(0).max(100).default(0),
  cgst: z.number().default(0),
  sgst: z.number().default(0),
  igst: z.number().default(0),
  cessPercent: z.number().min(0).default(0),
  cessAmount: z.number().default(0),
  taxableValue: z.number().default(0),
  finalAmount: z.number().default(0),
});

export const invoiceMetadataSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  referenceNumber: z.string().optional(),
  transportMode: z.string().optional(),
  vehicleNumber: z.string().optional(),
  deliveryNote: z.string().optional(),
  dispatchThrough: z.string().optional(),
  termsOfDelivery: z.string().optional(),
  reverseCharge: z.boolean().default(false),
  ewayBillNumber: z.string().optional(),
});

export const proformaMetadataSchema = z.object({
  invoiceNumber: z.string().min(1, 'Quotation/Invoice number is required'),
  invoiceDate: z.string().min(1, 'Quotation Date is required'),
  validityDays: z.number().min(1).optional().or(z.literal('')),
  validUntilDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryNote: z.string().optional(),
  transportMode: z.string().optional(),
  vehicleNumber: z.string().optional(),
});
