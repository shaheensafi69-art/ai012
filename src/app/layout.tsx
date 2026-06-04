import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. ایمپورت کردن نوبار و فوتر (Navbar & Footer)
// فرض بر این است که فایل‌ها در پوشه components قرار دارند
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ==========================================
// تنظیمات Viewport برای PWA و رنگ مرورگر
// ==========================================
export const viewport: Viewport = {
  themeColor: "#050014",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ==========================================
// تنظیمات متادیتا و اتصال فایل Manifest برای PWA
// ==========================================
export const metadata: Metadata = {
  title: "SAFI AI - Future of AI Content",
  description: "Unrivaled professional cinematic video and avatar generation studio.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Safi AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* اصلاح کلاس‌های body:
        bg-black: پس‌زمینه اصلی سایت مشکی باشد.
        min-h-full flex flex-col: زیربنای لازم برای چسباندن فوتر به پایین.
      */}
      <body className="min-h-full flex flex-col bg-black text-white">
        
        {/* 2. هدر (نوبار) در تمام صفحات در بالاترین قسمت قرار می‌گیرد */}
        <Navbar />
        
        {/* 3. محتوای اصلی صفحات (children) داخل تگ main قرار می‌گیرد.
          flex-grow: این بخش فضای خالی را پر می‌کند و فوتر را به پایین هل می‌دهد.
          pt-28: چون نوبار fixed است، این پدینگ فضای لازم را زیر آن ایجاد می‌کند تا محتوا پنهان نشود.
        */}
        <main className="flex-grow pt-28">
          {children}
        </main>
        
        {/* 4. فوتر در تمام صفحات در پایین‌ترین قسمت قرار می‌گیرد */}
        <Footer />
        
      </body>
    </html>
  );
}