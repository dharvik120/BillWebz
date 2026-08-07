import { LineItem, InvoiceTotals } from '../types/invoice';
import { numberToWords } from './numberToWords';

export function normalizeState(stateName: string): string {
  return (stateName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function calculateLineItem(
  item: Pick<LineItem, 'quantity' | 'rate' | 'discountPercent' | 'gstPercent' | 'cessPercent'>,
  sellerState: string,
  placeOfSupply: string,
  showTax: boolean = true
): Omit<LineItem, 'id' | 'name' | 'description' | 'hsnSac' | 'unit'> {
  const quantity = item.quantity || 0;
  const rate = item.rate || 0;
  const discountPercent = item.discountPercent || 0;
  const gstPercent = item.gstPercent || 0;
  const cessPercent = item.cessPercent || 0;

  // 1. Calculate Base Total
  const baseTotal = quantity * rate;

  // 2. Calculate Discount
  const discountAmount = Number((baseTotal * (discountPercent / 100)).toFixed(2));
  const taxableValue = Number((baseTotal - discountAmount).toFixed(2));

  // 3. Tax calculations (GST & CESS)
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let cessAmount = 0;

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
  const finalAmount = Number((taxableValue + cgst + sgst + igst + cessAmount).toFixed(2));

  return {
    quantity,
    rate,
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
    
    subtotal += calcs.quantity * calcs.rate;
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
