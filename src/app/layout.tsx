import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BillWebz | Free Professional GST & Proforma Invoice Generator",
  description: "Generate professional GST and Proforma invoices instantly. 100% Free, Offline First, Secure, and No Login Required. Ideal for Indian businesses, startups, and freelancers.",
  keywords: ["GST Invoice Generator", "Proforma Invoice Maker", "Free Billing Software", "Offline Billing Web App", "Indian GST Billing"],
  authors: [{ name: "Webz Technologies" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

