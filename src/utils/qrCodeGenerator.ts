import QRCode from 'qrcode';

/**
 * Generates a base64 encoded UPI Payment QR code.
 * Format: upi://pay?pa=<upi_id>&pn=<merchant_name>&am=<amount>&cu=<currency>
 */
export async function generateUpiQrCode(
  upiId: string,
  merchantName: string,
  amount: number,
  currencyCode: string = 'INR'
): Promise<string> {
  if (!upiId) return '';
  
  try {
    const formattedName = encodeURIComponent(merchantName.trim());
    const formattedAmount = amount.toFixed(2);
    
    // Construct UPI URI
    const upiUri = `upi://pay?pa=${upiId.trim()}&pn=${formattedName}&am=${formattedAmount}&cu=${currencyCode}`;
    
    // Generate QR code Data URL
    const qrDataUrl = await QRCode.toDataURL(upiUri, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    
    return qrDataUrl;
  } catch (err) {
    console.error('Failed to generate UPI QR code', err);
    return '';
  }
}

/**
 * Generates a base64 QR code for arbitrary text (e.g. invoice website or metadata details)
 */
export async function generateTextQrCode(text: string): Promise<string> {
  if (!text) return '';
  try {
    return await QRCode.toDataURL(text, {
      width: 150,
      margin: 1,
    });
  } catch (err) {
    console.error('Failed to generate Text QR code', err);
    return '';
  }
}
