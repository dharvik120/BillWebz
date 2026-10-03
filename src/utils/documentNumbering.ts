import { Invoice, InvoiceType, NumberingSettings, NumberingSequenceConfig } from '../types/invoice';

const NUMBERING_SETTINGS_KEY = 'billwebz_numbering_settings';

export const DEFAULT_NUMBERING_CONFIG: NumberingSettings = {
  quotation: {
    prefix: 'QUO',
    padLength: 4,
    startNumber: 4626,
    includeYear: true,
    separator: '-'
  },
  gst: {
    prefix: 'GST',
    padLength: 4,
    startNumber: 1,
    includeYear: true,
    separator: '-'
  },
  nongst: {
    prefix: 'INV',
    padLength: 4,
    startNumber: 1,
    includeYear: true,
    separator: '-'
  },
  proforma: {
    prefix: 'PRO',
    padLength: 4,
    startNumber: 1,
    includeYear: true,
    separator: '-'
  }
};

export function getStoredNumberingSettings(): NumberingSettings {
  if (typeof window === 'undefined') return DEFAULT_NUMBERING_CONFIG;
  try {
    const raw = localStorage.getItem(NUMBERING_SETTINGS_KEY);
    if (!raw) return DEFAULT_NUMBERING_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      quotation: { ...DEFAULT_NUMBERING_CONFIG.quotation, ...(parsed.quotation || {}) },
      gst: { ...DEFAULT_NUMBERING_CONFIG.gst, ...(parsed.gst || {}) },
      nongst: { ...DEFAULT_NUMBERING_CONFIG.nongst, ...(parsed.nongst || {}) },
      proforma: { ...DEFAULT_NUMBERING_CONFIG.proforma, ...(parsed.proforma || {}) },
    };
  } catch {
    return DEFAULT_NUMBERING_CONFIG;
  }
}

export function saveStoredNumberingSettings(settings: NumberingSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NUMBERING_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save numbering settings', err);
  }
}

/**
 * Extracts sequential number from a document number string.
 * Example: QUO-2026-4626 -> 4626
 * Example: GST-2026-0001 -> 1
 */
export function extractSequenceNumber(invoiceNumber: string, prefix?: string): number | null {
  if (!invoiceNumber) return null;
  const cleaned = invoiceNumber.trim();
  
  // If prefix is provided, check if it starts with it or matches pattern
  if (prefix) {
    const regex = new RegExp(`^${prefix}[^0-9]*\\d{4}[^0-9]+(\\d+)`, 'i');
    const match = cleaned.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) return num;
    }
  }

  // General pattern: look for trailing digits
  const trailingMatch = cleaned.match(/(\d+)$/);
  if (trailingMatch && trailingMatch[1]) {
    const num = parseInt(trailingMatch[1], 10);
    if (!isNaN(num)) return num;
  }

  return null;
}

/**
 * Calculates next sequential document number based on existing saved documents
 * and configured numbering rules.
 */
export function getNextDocumentNumber(
  type: InvoiceType,
  existingInvoices: Invoice[] = [],
  customSettings?: NumberingSettings
): string {
  const settings = customSettings || getStoredNumberingSettings();
  const config: NumberingSequenceConfig = settings[type] || DEFAULT_NUMBERING_CONFIG[type] || DEFAULT_NUMBERING_CONFIG.gst;
  const currentYear = new Date().getFullYear();

  // Filter invoices for this type or prefix
  const startNum = config.startNumber ?? config.startingNumber ?? 1;
  let highestFoundSeq: number | null = null;

  existingInvoices.forEach((inv) => {
    const invNumber = (inv.metadata?.invoiceNumber || '').trim();
    const invType = inv.type;

    // Check if this invoice matches our type or starts with our prefix
    const isMatchingType = 
      invType === type ||
      (type === 'gst' && ((invType as string) === 'tax' || invNumber.toUpperCase().startsWith('GST-'))) ||
      (type === 'nongst' && (invNumber.toUpperCase().startsWith('INV-'))) ||
      (type === 'quotation' && invNumber.toUpperCase().startsWith('QUO-')) ||
      (type === 'proforma' && (invNumber.toUpperCase().startsWith('PRO-') || invNumber.toUpperCase().startsWith('PI-')));

    if (isMatchingType && invNumber) {
      const seq = extractSequenceNumber(invNumber, config.prefix);
      if (seq !== null) {
        if (highestFoundSeq === null || seq > highestFoundSeq) {
          highestFoundSeq = seq;
        }
      }
    }
  });

  // If no document exists yet, start at startNum (e.g. 1, or 4626 for quotation)
  // If documents exist, next sequence is strictly highest + 1 (e.g. 2 -> 3 -> 4)
  let nextSeq: number;
  if (highestFoundSeq === null) {
    nextSeq = startNum;
  } else {
    nextSeq = Math.max(highestFoundSeq + 1, startNum);
  }

  const paddedSeq = String(nextSeq).padStart(config.padLength || 4, '0');
  const separator = config.separator || '-';

  if (config.includeYear) {
    return `${config.prefix}${separator}${currentYear}${separator}${paddedSeq}`;
  }
  return `${config.prefix}${separator}${paddedSeq}`;
}
