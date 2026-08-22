'use client';

import React, { useEffect, useState } from 'react';
import { Invoice, LineItem } from '../../types/invoice';
import { generateUpiQrCode } from '../../utils/qrCodeGenerator';
import { countriesList } from '../../utils/locationData';

// A simple offline Barcode component generating vertical SVG lines based on invoice number
function Barcode({ value }: { value: string }) {
  if (!value) return null;
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bars = [];
  let currentX = 0;
  
  // Generate pseudo-random bar widths based on code hash
  for (let i = 0; i < 24; i++) {
    const width = ((hash + i) % 3) + 1; // 1 to 3 px
    const gap = ((hash * (i + 1)) % 3) + 1; // 1 to 3 px
    bars.push(<rect key={i} x={currentX} y={0} width={width} height={35} fill="black" />);
    currentX += width + gap;
  }

  return (
    <div className="flex flex-col items-center gap-1 font-mono text-[9px] pdf-text-muted">
      <svg width={currentX} height={35} className="block">
        {bars}
      </svg>
      <span>{value.toUpperCase()}</span>
    </div>
  );
}

interface InvoicePreviewProps {
  invoice: Invoice;
  id?: string;
}

export function InvoicePreview({ invoice, id = 'invoice-render-sheet' }: InvoicePreviewProps) {
  const {
    type,
    theme,
    paperSize,
    currency,
    watermark,
    sellerDetails,
    buyerDetails,
    metadata,
    items,
    totals,
    termsAndConditions,
    notes,
    declaration,
    authorizedSignatoryName,
    isComputerGenerated,
    quotationNotes,
    showTax
  } = invoice;

  const [upiQrUrl, setUpiQrUrl] = useState<string>('');

  // Generate UPI QR Code dynamically when total or upi ID changes
  useEffect(() => {
    async function updateQr() {
      if (sellerDetails.upiId) {
        const url = await generateUpiQrCode(
          sellerDetails.upiId,
          sellerDetails.name,
          totals.grandTotal,
          currency.code
        );
        setUpiQrUrl(url);
      } else {
        setUpiQrUrl('');
      }
    }
    updateQr();
  }, [sellerDetails.upiId, sellerDetails.name, totals.grandTotal, currency.code]);

  // Color scheme selectors using Hex-safe PDF variables
  const themeColors = {
    blue: {
      primary: 'pdf-theme-blue-primary',
      text: 'pdf-theme-blue-text',
      border: 'pdf-theme-blue-border',
      bgLight: 'pdf-theme-blue-bg-light',
      accent: 'pdf-theme-blue-accent',
      tableHeader: 'pdf-theme-blue-primary'
    },
    slate: {
      primary: 'pdf-theme-slate-primary',
      text: 'pdf-theme-slate-text',
      border: 'pdf-theme-slate-border',
      bgLight: 'pdf-theme-slate-bg-light',
      accent: 'pdf-theme-slate-accent',
      tableHeader: 'pdf-theme-slate-primary'
    },
    emerald: {
      primary: 'pdf-theme-emerald-primary',
      text: 'pdf-theme-emerald-text',
      border: 'pdf-theme-emerald-border',
      bgLight: 'pdf-theme-emerald-bg-light',
      accent: 'pdf-theme-emerald-accent',
      tableHeader: 'pdf-theme-emerald-primary'
    },
    charcoal: {
      primary: 'pdf-theme-charcoal-primary',
      text: 'pdf-theme-charcoal-text',
      border: 'pdf-theme-charcoal-border',
      bgLight: 'pdf-theme-charcoal-bg-light',
      accent: 'pdf-theme-charcoal-accent',
      tableHeader: 'pdf-theme-charcoal-primary'
    },
    gold: {
      primary: 'pdf-theme-gold-primary',
      text: 'pdf-theme-gold-text',
      border: 'pdf-theme-gold-border',
      bgLight: 'pdf-theme-gold-bg-light',
      accent: 'pdf-theme-gold-accent',
      tableHeader: 'pdf-theme-gold-primary'
    }
  };

  const activeColor = themeColors[theme] || themeColors.blue;

  // Render POS Thermal layout
  if (paperSize === 'thermal80') {
    return (
      <div 
        id={id} 
        className="thermal-sheet p-4 bg-white text-black leading-tight border pdf-border-light"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider">{sellerDetails.name}</h2>
          {sellerDetails.gstin && <p className="text-[10px]">GSTIN: {sellerDetails.gstin}</p>}
          <p className="text-[9px]">{sellerDetails.address}</p>
          <p className="text-[9px]">Ph: {sellerDetails.phone} | {sellerDetails.email}</p>
          <div className="border-b border-dashed border-black my-2" />
          <h3 className="text-xs font-bold uppercase">
            {type === 'gst' ? 'GST TAX INVOICE' : 'PROFORMA INVOICE'}
          </h3>
          <p className="text-[9px]">No: {metadata.invoiceNumber}</p>
          <p className="text-[9px]">Date: {metadata.invoiceDate}</p>
          <div className="border-b border-dashed border-black my-2" />
        </div>

        {/* Buyer info */}
        <div className="text-[10px] mb-3 space-y-0.5">
          <p className="font-bold">Billed To:</p>
          <p>{buyerDetails.name}</p>
          {buyerDetails.companyName && <p>{buyerDetails.companyName}</p>}
          {buyerDetails.gstin && <p>GSTIN: {buyerDetails.gstin}</p>}
          <p>{buyerDetails.billingAddress}</p>
        </div>

        <div className="border-b border-dashed border-black my-2" />

        {/* Items */}
        <table className="w-full text-[10px] text-left">
          <thead>
            <tr className="font-bold border-b border-black">
              <th className="py-1">Item</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Price</th>
              <th className="py-1 text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b pdf-border-light">
                <td className="py-1 max-w-[40mm] truncate">
                  <div className="font-semibold">{item.name}</div>
                  {item.hsnSac && <span className="text-[8px] pdf-text-muted">HSN: {item.hsnSac}</span>}
                </td>
                <td className="py-1 text-right">{item.quantity}</td>
                <td className="py-1 text-right">{currency.symbol}{item.rate.toFixed(2)}</td>
                <td className="py-1 text-right">{currency.symbol}{item.finalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-b border-dashed border-black my-2" />

        {/* Totals */}
        <div className="text-[10px] space-y-1 text-right font-mono">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{currency.symbol}{totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.discountTotal > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{currency.symbol}{totals.discountTotal.toFixed(2)}</span>
            </div>
          )}
          {showTax && type === 'gst' && (
            <>
              {totals.cgstTotal > 0 && (
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span>{currency.symbol}{totals.cgstTotal.toFixed(2)}</span>
                </div>
              )}
              {totals.sgstTotal > 0 && (
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span>{currency.symbol}{totals.sgstTotal.toFixed(2)}</span>
                </div>
              )}
              {totals.igstTotal > 0 && (
                <div className="flex justify-between">
                  <span>IGST:</span>
                  <span>{currency.symbol}{totals.igstTotal.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          {totals.roundOff !== 0 && (
            <div className="flex justify-between">
              <span>Round Off:</span>
              <span>{currency.symbol}{totals.roundOff.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
            <span>TOTAL:</span>
            <span>{currency.symbol}{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-2" />

        {/* Footer */}
        {upiQrUrl && (
          <div className="flex flex-col items-center justify-center my-3">
            <img src={upiQrUrl} alt="UPI QR" className="w-24 h-24" />
            <p className="text-[8px] pdf-text-muted mt-1">Scan to Pay via UPI</p>
          </div>
        )}

        <div className="text-center text-[9px] mt-4 space-y-1">
          {notes && <p className="italic">{notes}</p>}
          <p className="font-bold">Thank You For Your Business!</p>
          {isComputerGenerated && <p className="text-[8px] pdf-text-muted">Computer Generated Invoice</p>}
        </div>
      </div>
    );
  }

  // Render Full A4/US Letter layout
  return (
    <div className="overflow-auto bg-slate-100 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-center">
      <div 
        id={id} 
        className={`${paperSize === 'letter' ? 'letter-sheet' : 'a4-sheet'} flex flex-col justify-between`}
      >
        {/* Diagonal Watermark */}
        {watermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
            <span className="text-slate-200/40 dark:text-slate-100/10 text-8xl font-black tracking-widest uppercase rotate-[-35deg]">
              {type === 'gst' ? (showTax ? 'ORIGINAL' : 'INVOICE') : type === 'proforma' ? 'PROFORMA' : 'QUOTATION'}
            </span>
          </div>
        )}

        {/* Content wrapper */}
        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div>
            {/* Row 1: Logo & Company Name */}
            <div className="flex items-start justify-between border-b pdf-border-light pb-6 mb-6">
              <div className="flex items-center gap-4">
                {sellerDetails.logoUrl ? (
                  <img 
                    src={sellerDetails.logoUrl} 
                    alt="Logo" 
                    className="max-h-16 max-w-28 object-contain rounded" 
                  />
                ) : (
                  <div className={`h-12 w-12 rounded-xl ${activeColor.primary} flex items-center justify-center text-white font-extrabold text-xl`}>
                    {sellerDetails.name.substring(0, 1).toUpperCase() || 'B'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold pdf-text-dark leading-snug">{sellerDetails.name}</h1>
                  {sellerDetails.gstin && (
                    <p className="text-xs pdf-text-muted font-mono mt-0.5">GSTIN: {sellerDetails.gstin}</p>
                  )}
                  <p className="text-xs pdf-text-muted max-w-sm mt-1">{sellerDetails.address}</p>
                  {(sellerDetails.state || sellerDetails.country) && (
                    <p className="text-xs pdf-text-muted mt-0.5">
                      {[
                        sellerDetails.state && sellerDetails.state !== 'NONE' ? `State: ${sellerDetails.state}` : '',
                        sellerDetails.country && sellerDetails.country !== 'OTHER' 
                          ? `Country: ${countriesList.find(c => c.code === sellerDetails.country)?.name || sellerDetails.country}` 
                          : ''
                      ].filter(Boolean).join(' | ')}
                      {sellerDetails.pincode ? ` (${sellerDetails.pincode})` : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded ${activeColor.primary} text-white mb-2`}>
                  {type === 'gst' ? (showTax ? 'GST TAX INVOICE' : 'INVOICE') : type === 'proforma' ? 'PROFORMA INVOICE' : 'QUOTATION'}
                </span>
                <p className="text-sm font-semibold pdf-text-dark font-mono">No: {metadata.invoiceNumber}</p>
                <p className="text-xs pdf-text-muted">Date: {metadata.invoiceDate}</p>
                {type === 'gst' ? (
                  <p className="text-xs pdf-text-muted">Due Date: {metadata.dueDate}</p>
                ) : (
                  metadata.validUntilDate && <p className="text-xs pdf-text-muted">Valid Until: {metadata.validUntilDate}</p>
                )}
                {metadata.referenceNumber && <p className="text-[11px] pdf-text-muted font-mono mt-0.5">Ref No: {metadata.referenceNumber}</p>}
                {metadata.vehicleNumber && <p className="text-[11px] pdf-text-muted font-mono mt-0.5">Vehicle: {metadata.vehicleNumber}</p>}
                {type === 'gst' && metadata.ewayBillNumber && <p className="text-[11px] pdf-text-muted font-mono mt-0.5">E-way Bill: {metadata.ewayBillNumber}</p>}
                {type === 'gst' && metadata.reverseCharge && <p className="text-[11px] pdf-text-muted font-semibold mt-0.5">Reverse Charge: Yes</p>}
              </div>
            </div>

            {/* Row 2: Client Details (Clean 2-Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs leading-relaxed pdf-text-medium">
              <div className={`${activeColor.accent} pl-3`}>
                <h4 className="font-bold pdf-text-dark uppercase tracking-wider mb-2">Billed To</h4>
                <div className="space-y-0.5">
                  <p className="font-bold pdf-text-dark">{buyerDetails.name}</p>
                  {buyerDetails.companyName && <p>{buyerDetails.companyName}</p>}
                  {buyerDetails.gstin && <p className="font-mono">GSTIN: {buyerDetails.gstin}</p>}
                  <p>{buyerDetails.billingAddress}</p>
                  {buyerDetails.state && buyerDetails.state !== 'NONE' && <p>State: {buyerDetails.state}</p>}
                  {buyerDetails.country && buyerDetails.country !== 'OTHER' && (
                    <p>Country: {countriesList.find(c => c.code === buyerDetails.country)?.name || buyerDetails.country}</p>
                  )}
                  {buyerDetails.phone && <p>Ph: {buyerDetails.phone}</p>}
                  {buyerDetails.email && <p>Email: {buyerDetails.email}</p>}
                </div>
              </div>

              <div>
                <h4 className="font-bold pdf-text-dark uppercase tracking-wider mb-2">Shipping Details</h4>
                <div className="space-y-0.5">
                  {buyerDetails.shippingAddress ? (
                    <p>{buyerDetails.shippingAddress}</p>
                  ) : (
                    <p className="italic pdf-text-muted">Same as billing address</p>
                  )}
                  <p className="mt-2 font-semibold pdf-text-dark">Place of Supply:</p>
                  <p>{buyerDetails.placeOfSupply}</p>
                </div>
              </div>
            </div>

            {/* Row 3: Product Line Items Table */}
            <div className="overflow-hidden border pdf-border-light rounded-xl mb-8">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`${activeColor.tableHeader} font-bold`}>
                    <th className="px-3 py-3 w-8">#</th>
                    <th className="px-3 py-3">Product Description</th>
                    {showTax && <th className="px-3 py-3 text-right">HSN/SAC</th>}
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Rate</th>
                    <th className="px-3 py-3 text-right">Discount</th>
                    {showTax && (
                      <>
                        <th className="px-3 py-3 text-right">GST %</th>
                        <th className="px-3 py-3 text-right">Taxable</th>
                      </>
                    )}
                    <th className="px-3 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="pdf-divide-light">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:pdf-bg-light">
                      <td className="px-3 py-3 pdf-text-light">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <strong className="pdf-text-dark font-bold block">{item.name}</strong>
                        {item.description && <span className="text-[10px] pdf-text-light block mt-0.5">{item.description}</span>}
                      </td>
                      {showTax && <td className="px-3 py-3 text-right font-mono pdf-text-muted">{item.hsnSac || '-'}</td>}
                      <td className="px-3 py-3 text-right font-semibold pdf-text-dark">
                        {item.quantity} <span className="text-[9px] font-normal pdf-text-muted block">{item.unit}</span>
                      </td>
                      <td className="px-3 py-3 text-right pdf-text-medium">{currency.symbol}{item.rate.toFixed(2)}</td>
                      <td className="px-3 py-3 text-right pdf-text-muted">
                        {item.discountPercent > 0 ? (
                          <>
                            <span>{item.discountPercent}%</span>
                            <span className="text-[9px] block pdf-text-light">-{currency.symbol}{item.discountAmount.toFixed(2)}</span>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      {showTax && (
                        <>
                          <td className="px-3 py-3 text-right pdf-text-muted">{item.gstPercent}%</td>
                          <td className="px-3 py-3 text-right pdf-text-medium">{currency.symbol}{item.taxableValue.toFixed(2)}</td>
                        </>
                      )}
                      <td className="px-3 py-3 text-right font-bold pdf-text-dark">{currency.symbol}{item.finalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row 4: Totals Summary, Words, Bank */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-xs">
              <div>
                {/* Bank Details section */}
                {sellerDetails.bankName && (
                  <div className="pdf-bg-light rounded-xl p-4 border pdf-border-light mb-4">
                    <h5 className="font-bold pdf-text-dark uppercase tracking-wider mb-2">Remittance Bank Details</h5>
                    <table className="w-full text-left leading-relaxed pdf-text-medium">
                      <tbody>
                        <tr>
                          <td className="pdf-text-muted w-24">Bank Name:</td>
                          <td className="font-semibold pdf-text-dark">{sellerDetails.bankName}</td>
                        </tr>
                        <tr>
                          <td className="pdf-text-muted">Account No:</td>
                          <td className="font-semibold font-mono pdf-text-dark">{sellerDetails.accountNumber}</td>
                        </tr>
                        <tr>
                          <td className="pdf-text-muted">IFSC Code:</td>
                          <td className="font-mono pdf-text-dark">{sellerDetails.ifsc}</td>
                        </tr>
                        {sellerDetails.branch && (
                          <tr>
                            <td className="pdf-text-muted">Branch:</td>
                            <td className="pdf-text-dark">{sellerDetails.branch}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Amount in words */}
                <div>
                  <span className="pdf-text-muted font-semibold block uppercase text-[10px] tracking-wider mb-1">Amount in Words</span>
                  <strong className="pdf-text-dark text-[11px] leading-relaxed block italic">{totals.amountInWords}</strong>
                </div>
              </div>

              <div>
                <div className="pdf-bg-light rounded-xl p-4 border pdf-border-light space-y-2 font-semibold">
                  <div className="flex justify-between pdf-text-medium">
                    <span>Subtotal:</span>
                    <span>{currency.symbol}{totals.subtotal.toFixed(2)}</span>
                  </div>

                  {totals.discountTotal > 0 && (
                    <div className="flex justify-between pdf-text-medium">
                      <span>Discount Total:</span>
                      <span className="text-red-500">-{currency.symbol}{totals.discountTotal.toFixed(2)}</span>
                    </div>
                  )}

                  {showTax && (
                    <>
                      <div className="flex justify-between pdf-text-medium border-t pdf-border-light pt-2">
                        <span>Taxable Value:</span>
                        <span>{currency.symbol}{totals.taxableTotal.toFixed(2)}</span>
                      </div>
                      
                      {totals.cgstTotal > 0 && (
                        <div className="flex justify-between pdf-text-muted font-normal">
                          <span>Central Tax (CGST):</span>
                          <span>{currency.symbol}{totals.cgstTotal.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {totals.sgstTotal > 0 && (
                        <div className="flex justify-between pdf-text-muted font-normal">
                          <span>State Tax (SGST):</span>
                          <span>{currency.symbol}{totals.sgstTotal.toFixed(2)}</span>
                        </div>
                      )}

                      {totals.igstTotal > 0 && (
                        <div className="flex justify-between pdf-text-muted font-normal">
                          <span>Integrated Tax (IGST):</span>
                          <span>{currency.symbol}{totals.igstTotal.toFixed(2)}</span>
                        </div>
                      )}

                      {totals.cessTotal > 0 && (
                        <div className="flex justify-between pdf-text-muted font-normal">
                          <span>CESS Total:</span>
                          <span>{currency.symbol}{totals.cessTotal.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}

                  {totals.roundOff !== 0 && (
                    <div className="flex justify-between pdf-text-muted font-normal">
                      <span>Round Off:</span>
                      <span>{totals.roundOff > 0 ? '+' : ''}{currency.symbol}{totals.roundOff.toFixed(2)}</span>
                    </div>
                  )}

                  <div className={`flex justify-between text-sm font-black pt-2 border-t-2 border-dashed ${activeColor.border} pdf-text-dark`}>
                    <span>Grand Total:</span>
                    <span>{currency.symbol}{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Notes, Signatures, UPI QR & Footer Bar */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-t pdf-border-light pt-6 mt-auto text-xs">
              <div className="space-y-3 col-span-2">
                {termsAndConditions && (
                  <div>
                    <h6 className="font-bold pdf-text-dark uppercase tracking-wider mb-1 text-[10px]">Terms & Conditions</h6>
                    <p className="text-[10px] pdf-text-muted whitespace-pre-line leading-relaxed">{termsAndConditions}</p>
                  </div>
                )}
                {notes && (
                  <div>
                    <h6 className="font-bold pdf-text-dark uppercase tracking-wider mb-1 text-[10px]">Notes</h6>
                    <p className="text-[10px] pdf-text-muted whitespace-pre-line leading-relaxed">{notes}</p>
                  </div>
                )}
                {(type === 'proforma' || type === 'quotation') && quotationNotes && (
                  <div className="pdf-bg-light rounded-lg p-2.5 border pdf-border-light">
                    <h6 className="font-bold pdf-text-dark uppercase tracking-wider mb-1 text-[9px]">Quotation Details</h6>
                    <p className="text-[9px] pdf-text-muted leading-normal">{quotationNotes}</p>
                  </div>
                )}
                {declaration && (
                  <div>
                    <h6 className="font-bold pdf-text-dark uppercase tracking-wider mb-1 text-[10px]">Declaration</h6>
                    <p className="text-[9px] pdf-text-light leading-relaxed">{declaration}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center md:items-end justify-end space-y-4">
                {/* QR Code and Barcode */}
                <div className="flex items-center gap-4">
                  {upiQrUrl && (
                    <div className="flex flex-col items-center">
                      <img src={upiQrUrl} alt="UPI QR" className="w-20 h-20 border pdf-border-light rounded p-1 bg-white" />
                      <span className="text-[8px] pdf-text-light mt-1 font-semibold">UPI Payment QR</span>
                    </div>
                  )}
                  <Barcode value={metadata.invoiceNumber || 'INV-001'} />
                </div>

                {/* Signature Block - Only renders if NOT computer generated */}
                {!isComputerGenerated ? (
                  <div className="flex flex-col items-center md:items-end w-full">
                    <p className="text-[10px] pdf-text-muted mb-1 font-medium text-center md:text-right w-36">Authorized Signatory</p>
                    
                    {sellerDetails.signatureUrl ? (
                      <img 
                        src={sellerDetails.signatureUrl} 
                        alt="Signature" 
                        className="max-h-12 max-w-28 object-contain mb-1" 
                      />
                    ) : (
                      <div className="h-8 w-36" />
                    )}

                    {/* Solid horizontal line */}
                    <div className="w-36 border-b pdf-border-light border-solid mb-1.5" />

                    {authorizedSignatoryName && (
                      <p className="font-bold pdf-text-dark text-[11px] w-36 text-center">{authorizedSignatoryName}</p>
                    )}
                  </div>
                ) : (
                  <div className="h-12" /> // Spacing helper when signature is hidden
                )}
              </div>
            </div>

            {/* Legal computer generated watermark footer */}
            {isComputerGenerated && (
              <div className="flex items-center justify-between border-t pdf-border-light pt-3 mt-4 text-[8px] pdf-text-light select-none">
                <span>This is a computer generated invoice and requires no physical signature.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
