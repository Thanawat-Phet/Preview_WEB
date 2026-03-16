import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XDNZ Store - Your Digital Marketplace",
  description: "Premium digital products, game codes, gift cards, and subscriptions at the best prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        
        {/* Footer */}
        <footer className="bg-gradient-to-r from-purple-900 to-purple-700 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">X</span>
                  </div>
                  <span className="text-2xl font-bold">XDNZ Store</span>
                </div>
                <p className="text-purple-200 max-w-md">
                  Your trusted digital marketplace for game codes, gift cards, and premium subscriptions. 
                  Fast delivery, secure payments, 24/7 support.
                </p>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-purple-200">
                  <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="/#products" className="hover:text-white transition-colors">Shop</a></li>
                  <li><a href="/topup" className="hover:text-white transition-colors">Top-up</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              
              {/* Support */}
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-purple-200">
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-purple-600 mt-8 pt-8 text-center text-purple-300">
              <p>&copy; {new Date().getFullYear()} XDNZ Store. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
