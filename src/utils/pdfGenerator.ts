import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PaperSize } from '../types/invoice';

/**
 * Generate a clean, descriptive PDF filename based on document type and document number.
 * e.g. GST_Invoice_GST-2026-0001.pdf, Quotation_QT-2026-0001.pdf, Proforma_Invoice_PI-2026-0001.pdf, Invoice_INV-2026-0001.pdf
 */
export function getDocumentPdfFilename(invoiceData?: any, fallbackName?: string): string {
  if (fallbackName && fallbackName !== 'invoice.pdf' && fallbackName !== 'invoice') {
    return fallbackName.endsWith('.pdf') ? fallbackName : `${fallbackName}.pdf`;
  }

  const type = invoiceData?.type;
  const isTax = invoiceData?.showTax !== false;
  const rawNum = (invoiceData?.metadata?.invoiceNumber || invoiceData?.metadata?.referenceNumber || '').trim();
  const safeNum = rawNum ? `_${rawNum.replace(/[/\\?%*:|"<> ]/g, '-')}` : '';

  if (type === 'gst') {
    return isTax ? `GST_Invoice${safeNum}.pdf` : `Invoice${safeNum}.pdf`;
  } else if (type === 'quotation') {
    return `Quotation${safeNum}.pdf`;
  } else if (type === 'proforma') {
    return `Proforma_Invoice${safeNum}.pdf`;
  } else if (type === 'nongst') {
    return `Invoice${safeNum}.pdf`;
  }

  return `Invoice${safeNum}.pdf`;
}

/**
 * Robust cross-platform blob trigger that forces download to the Downloads folder
 * across desktop browsers, mobile Chrome, Safari, and Android WebViews.
 */
export function triggerBlobDownload(blob: Blob, filename: string): string {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    try {
      document.body.removeChild(a);
    } catch (e) {}
    // Keep blob URL in memory for 60 seconds so user can click "Open PDF"
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
    }, 60000);
  }, 1000);

  return blobUrl;
}

export interface PdfExportResult {
  blob: Blob | null;
  blobUrl: string | null;
  filename: string;
}

export async function downloadInvoicePdf(
  elementId: string,
  filename?: string,
  paperSize: PaperSize = 'a4',
  invoiceData?: any,
  autoDownload: boolean = true
): Promise<PdfExportResult> {
  const targetFilename = getDocumentPdfFilename(invoiceData, filename);

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return { blob: null, blobUrl: null, filename: targetFilename };
  }

  try {
    // Add print styles temporary override for rendering
    const originalWidth = element.style.width;
    const originalBoxShadow = element.style.boxShadow;
    const originalMargin = element.style.margin;

    // Adjust element configuration for high-res snapshot
    if (paperSize === 'a4') {
      element.style.width = '210mm';
    } else if (paperSize === 'letter') {
      element.style.width = '215.9mm';
    } else if (paperSize === 'thermal80') {
      element.style.width = '80mm';
    }
    element.style.boxShadow = 'none';
    element.style.margin = '0';

    const canvas = await html2canvas(element, {
      scale: 2.2, // High resolution scale factor
      useCORS: true, // Support logo images loaded via URL
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Restore original styles
    element.style.width = originalWidth;
    element.style.boxShadow = originalBoxShadow;
    element.style.margin = originalMargin;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let pdfWidth = 210;
    let pdfHeight = 297;
    let format: any = 'a4';

    if (paperSize === 'letter') {
      pdfWidth = 215.9;
      pdfHeight = 279.4;
      format = 'letter';
    } else if (paperSize === 'thermal80') {
      pdfWidth = 80;
      const ratio = canvas.height / canvas.width;
      pdfHeight = pdfWidth * ratio;
      format = [pdfWidth, pdfHeight];
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
      compress: true
    });

    // 1. Draw the visual layout image
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // 2. Generate a searchable/selectable transparent text overlay on top of the image
    const containerRect = element.getBoundingClientRect();
    const scaleX = pdfWidth / containerRect.width;
    const scaleY = pdfHeight / containerRect.height;

    const textNodes: { text: string; rect: DOMRect; style: CSSStyleDeclaration }[] = [];

    // Helper function to recursively collect text elements in DOM
    const collectText = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const s = window.getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return;

      let hasText = false;
      let combined = '';
      el.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const val = child.nodeValue?.trim();
          if (val) {
            hasText = true;
            combined += child.nodeValue;
          }
        }
      });

      if (hasText && combined.trim()) {
        textNodes.push({ text: combined, rect: r, style: s });
      }

      Array.from(el.children).forEach(child => {
        collectText(child as HTMLElement);
      });
    };

    collectText(element);

    textNodes.forEach(item => {
      const x = (item.rect.left - containerRect.left) * scaleX;
      // Offset the Y coordinate down slightly to match font baseline
      const y = (item.rect.top - containerRect.top) * scaleY + (item.rect.height * 0.78) * scaleY;
      
      const fontPx = parseFloat(item.style.fontSize);
      const fontPt = fontPx * 0.75;
      
      const weight = item.style.fontWeight;
      const fontStyle = item.style.fontStyle;
      const isBold = weight === 'bold' || parseInt(weight, 10) >= 700;
      const isItalic = fontStyle === 'italic';
      
      pdf.setFont('helvetica', isBold && isItalic ? 'bolditalic' : isBold ? 'bold' : isItalic ? 'italic' : 'normal');
      pdf.setFontSize(fontPt);
      
      const cleanText = item.text.replace(/\s+/g, ' ').trim();
      if (cleanText) {
        pdf.text(cleanText, x, y, { renderingMode: 'invisible' });
      }
    });

    // 3. Generate the binary Blob
    const blob = pdf.output('blob');
    let blobUrl: string | null = null;

    if (autoDownload) {
      blobUrl = triggerBlobDownload(blob, targetFilename);
      // Dispatch notification event for user feedback banner / toast
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('billwebz-download-notification', {
            detail: {
              filename: targetFilename,
              blobUrl,
              message: `Saved to your Downloads folder as "${targetFilename}".`,
            },
          })
        );
      }
    } else {
      blobUrl = URL.createObjectURL(blob);
    }

    return { blob, blobUrl, filename: targetFilename };
  } catch (error) {
    console.error('Error generating PDF', error);
    return { blob: null, blobUrl: null, filename: targetFilename };
  }
}

export function printInvoice(elementId: string) {
  window.print();
}
