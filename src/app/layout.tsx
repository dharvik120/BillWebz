import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bill-webz.vercel.app'),
  title: {
    default: "BillWebz | Free Professional GST, Quotation & Proforma Generator",
    template: "%s | BillWebz"
  },
  description: "Create professional GST invoices, Quotations, and Proforma documents instantly. Offline-first privacy, automatic sequential numbering, HSN/SAC catalogue, and beautiful PDF exports.",
  keywords: [
    "GST Invoice Generator",
    "Quotation Maker",
    "Proforma Invoice",
    "Free Billing Software",
    "Offline Billing App",
    "Indian GST Billing",
    "Invoice PDF Export",
    "BillWebz"
  ],
  authors: [{ name: "Webz Technologies" }],
  creator: "Webz Technologies",
  publisher: "BillWebz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bill-webz.vercel.app",
    title: "BillWebz | Free Professional GST, Quotation & Proforma Generator",
    description: "Generate professional GST and Proforma invoices instantly. Offline First, Secure, and No Login Required.",
    siteName: "BillWebz",
  },
  twitter: {
    card: "summary_large_image",
    title: "BillWebz | Free Professional GST & Quotation Generator",
    description: "Generate professional GST and Proforma invoices instantly with zero configuration.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${plusJakartaSans.variable} ${geistMono.variable} min-h-full font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

