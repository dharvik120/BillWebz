import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PaperSize } from '../types/invoice';

export async function downloadInvoicePdf(
  elementId: string,
  filename: string, // Kept for compatibility, but we force 'invoice'
  paperSize: PaperSize,
  invoiceData?: any // Kept for compatibility
): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
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

    // Save/Download file as "invoice.pdf" only
    pdf.save('invoice.pdf');

    // Output raw blob for WhatsApp/Email sharing
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF', error);
    return null;
  }
}

export function printInvoice(elementId: string) {
  window.print();
}
