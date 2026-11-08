import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toko Donat Habil - Sistem Penjualan",
  description: "Sistem Informasi Penjualan Toko Donat Habil (APSI Modul 4)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#FAF7F2] text-[#2C2A29]">
        {children}
      </body>
    </html>
  );
}
