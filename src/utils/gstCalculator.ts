import { LineItem, InvoiceTotals } from '../types/invoice';
import { numberToWords } from './numberToWords';

export function normalizeState(stateName: string): string {
  return (stateName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function calculateLineItem(
  item: Pick<LineItem, 'quantity' | 'rate' | 'discountPercent' | 'gstPercent' | 'cessPercent'> & { isTaxInclusive?: boolean },
  sellerState: string,
  placeOfSupply: string,
  showTax: boolean = true
): Omit<LineItem, 'id' | 'name' | 'description' | 'hsnSac' | 'unit'> {
  const quantity = item.quantity || 0;
  const rawRate = item.rate || 0;
  const discountPercent = item.discountPercent || 0;
  const gstPercent = item.gstPercent || 0;
  const cessPercent = item.cessPercent || 0;
  const isTaxInclusive = !!item.isTaxInclusive;

  let discountAmount = 0;
  let taxableValue = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let cessAmount = 0;
  let finalAmount = 0;

  if (isTaxInclusive && showTax && (gstPercent > 0 || cessPercent > 0)) {
    // Inclusive calculations: rawRate is the GST-inclusive price per unit
    const grossInclusive = quantity * rawRate;
    const inclusiveDiscount = Number((grossInclusive * (discountPercent / 100)).toFixed(2));
    const netInclusive = grossInclusive - inclusiveDiscount;

    const totalTaxRate = (gstPercent + cessPercent) / 100;
    taxableValue = Number((netInclusive / (1 + totalTaxRate)).toFixed(2));
    
    const baseGrossTaxable = Number((grossInclusive / (1 + totalTaxRate)).toFixed(2));
    discountAmount = Number((baseGrossTaxable - taxableValue).toFixed(2));

    const totalTaxAmount = Number((netInclusive - taxableValue).toFixed(2));
    const isInterState = normalizeState(sellerState) !== normalizeState(placeOfSupply);

    if (cessPercent > 0) {
      cessAmount = Number((taxableValue * (cessPercent / 100)).toFixed(2));
    }

    const totalGstAmount = Number((totalTaxAmount - cessAmount).toFixed(2));

    if (isInterState) {
      igst = totalGstAmount;
      cgst = 0;
      sgst = 0;
    } else {
      igst = 0;
      cgst = Number((totalGstAmount / 2).toFixed(2));
      sgst = Number((totalGstAmount - cgst).toFixed(2));
    }

    finalAmount = Number(netInclusive.toFixed(2));
  } else {
    // 1. Calculate Base Total
    const baseTotal = quantity * rawRate;

    // 2. Calculate Discount
    discountAmount = Number((baseTotal * (discountPercent / 100)).toFixed(2));
    taxableValue = Number((baseTotal - discountAmount).toFixed(2));

    // 3. Tax calculations (GST & CESS)
    if (showTax && gstPercent > 0) {
      const isInterState = normalizeState(sellerState) !== normalizeState(placeOfSupply);
      const totalGstAmount = taxableValue * (gstPercent / 100);

      if (isInterState) {
        igst = Number(totalGstAmount.toFixed(2));
        cgst = 0;
        sgst = 0;
      } else {
        igst = 0;
        cgst = Number((totalGstAmount / 2).toFixed(2));
        sgst = Number((totalGstAmount / 2).toFixed(2));
      }
    }

    if (showTax && cessPercent > 0) {
      cessAmount = Number((taxableValue * (cessPercent / 100)).toFixed(2));
    }

    // 4. Final Amount
    finalAmount = Number((taxableValue + cgst + sgst + igst + cessAmount).toFixed(2));
  }

  return {
    quantity,
    rate: rawRate,
    isTaxInclusive,
    discountPercent,
    discountAmount,
    gstPercent,
    cgst,
    sgst,
    igst,
    cessPercent,
    cessAmount,
    taxableValue,
    finalAmount,
  };
}

export function calculateInvoiceTotals(
  items: LineItem[],
  sellerState: string,
  placeOfSupply: string,
  currencyCode: string = 'INR',
  showTax: boolean = true
): { items: LineItem[]; totals: InvoiceTotals } {
  let subtotal = 0;
  let discountTotal = 0;
  let taxableTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let cessTotal = 0;

  const calculatedItems = items.map((item) => {
    const calcs = calculateLineItem(item, sellerState, placeOfSupply, showTax);
    
    subtotal += calcs.isTaxInclusive ? (calcs.taxableValue + calcs.discountAmount) : (calcs.quantity * calcs.rate);
    discountTotal += calcs.discountAmount;
    taxableTotal += calcs.taxableValue;
    cgstTotal += calcs.cgst;
    sgstTotal += calcs.sgst;
    igstTotal += calcs.igst;
    cessTotal += calcs.cessAmount;

    return {
      ...item,
      ...calcs
    } as LineItem;
  });

  const rawGrandTotal = taxableTotal + cgstTotal + sgstTotal + igstTotal + cessTotal;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));

  const totals = {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(discountTotal.toFixed(2)),
    taxableTotal: Number(taxableTotal.toFixed(2)),
    cgstTotal: Number(cgstTotal.toFixed(2)),
    sgstTotal: Number(sgstTotal.toFixed(2)),
    igstTotal: Number(igstTotal.toFixed(2)),
    cessTotal: Number(cessTotal.toFixed(2)),
    roundOff,
    grandTotal,
    amountInWords: numberToWords(grandTotal, currencyCode),
  };

  return { items: calculatedItems, totals };
}
