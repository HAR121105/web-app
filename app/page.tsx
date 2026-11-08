"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  const menuItems = [
    {
      id: "MNU001",
      name: "Donat Gula Halus",
      kategori: "Donat Klasik",
      price: 4000,
      image: "🍩",
      desc: "Donat lembut berbalut taburan gula salju halus yang manis pas di lidah.",
      stok: 60,
    },
    {
      id: "MNU002",
      name: "Donat Cokelat Meses",
      kategori: "Donat Topping",
      price: 4000,
      image: "🍫",
      desc: "Topping cokelat lumer tebal dengan taburan meses cokelat premium melimpah.",
      stok: 55,
    },
    {
      id: "MNU003",
      name: "Donat Keju",
      kategori: "Donat Topping",
      price: 5000,
      image: "🧀",
      desc: "Donat empuk bertabur parutan keju cheddar gurih dan krim mentega manis.",
      stok: 48,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C2923] flex flex-col">
      {/* Navbar Pelanggan / Umum */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EFE7DC] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F8A106] to-[#FFCD2E] flex items-center justify-center text-xl shadow-md">
              🍩
            </div>
            <div>
              <span className="text-xl font-black text-[#3C2923] tracking-tight">
                donat habil.
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-[#9C7146] font-semibold">
                Freshly Baked Everyday
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#54443B]">
            <Link href="/" className="text-[#F8A106]">
              Beranda
            </Link>
            <Link href="/pelanggan" className="hover:text-[#F8A106] transition">
              Katalog Menu
            </Link>
            <Link href="/pelanggan#pesanan" className="hover:text-[#F8A106] transition">
              Pesanan Saya
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-[#77431D] hover:bg-[#F2E7DC] rounded-xl transition"
            >
              Masuk
            </Link>
            <Link
              href="/pelanggan"
              className="px-4 py-2 text-xs font-bold bg-[#F8A106] hover:bg-[#E69300] text-white rounded-xl shadow-sm transition"
            >
              Pesan Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-12 pb-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF0D0] text-[#77431D] text-xs font-bold border border-[#FAD692]">
              <span>✨</span> Donat Rumahan Lembut &amp; Higienis
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#3C2923] leading-tight">
              Nikmati Manisnya Hari dengan{" "}
              <span className="text-[#F8A106]">Donat Habil</span>
            </h1>
            <p className="text-sm md:text-base text-[#6D5D55] leading-relaxed">
              Dibuat dari bahan-bahan pilihan berkualitas, lembut hingga gigitan terakhir. 
              Pesan online dengan mudah, pantau proses pengerjaan di dapur secara real-time!
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/pelanggan"
                className="px-6 py-3.5 bg-gradient-to-r from-[#F8A106] to-[#EEA643] text-white font-bold rounded-2xl shadow-lg shadow-[#F8A106]/30 hover:scale-105 active:scale-95 transition text-sm flex items-center gap-2"
              >
                <span>Mulai Pesan</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 bg-white border border-[#E5DACD] text-[#4A3932] font-bold rounded-2xl hover:bg-[#F5ECE0] transition text-sm"
              >
                Akses Multi-Role
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-72 h-72 md:w-88 md:h-88 rounded-full bg-[#FFF0D0] absolute -z-10 blur-xl" />
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[#F0E4D5] shadow-xl max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between border-b border-[#F2E5D6] pb-3">
                <span className="text-xs font-bold text-[#8C6D58] uppercase tracking-wider">
                  Highlight Menu Hari Ini
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  Buka
                </span>
              </div>
              <div className="space-y-3">
                {menuItems.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FCFAF6] hover:bg-[#F9F4EB] border border-[#EFE5D8] transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.image}</span>
                      <div>
                        <div className="text-xs font-bold text-[#3C2923]">
                          {m.name}
                        </div>
                        <div className="text-[11px] text-[#8C7A70]">
                          {m.kategori}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#F8A106]">
                      Rp{m.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Akses Cepat Dashboard Role (Untuk Tugas APSI Modul 4) */}
        <section className="bg-[#FFF4E2] border-y border-[#F3DFC1] py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9C7146]">
                Portal Pengujian Modul 4 APSI
              </span>
              <h2 className="text-2xl font-black text-[#3C2923] mt-1">
                4 Role Sistem Informasi Penjualan Donat
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/pelanggan"
                className="bg-white p-5 rounded-2xl border border-[#EDDEC9] hover:shadow-md hover:border-[#F8A106] transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0D0] text-[#F8A106] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                    👤
                  </div>
                  <h3 className="text-sm font-bold text-[#3C2923]">Pelanggan</h3>
                  <p className="text-xs text-[#7A6B63] mt-1">
                    Katalog donat, keranjang, bayar QRIS/Tunai, upload bukti transfer &amp; tracking status pesanan.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#F8A106] inline-flex items-center gap-1">
                  Buka Portal &rarr;
                </span>
              </Link>

              <Link
                href="/kasir"
                className="bg-white p-5 rounded-2xl border border-[#EDDEC9] hover:shadow-md hover:border-[#77431D] transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F6E9DD] text-[#77431D] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                    🧾
                  </div>
                  <h3 className="text-sm font-bold text-[#3C2923]">Kasir (Validasi)</h3>
                  <p className="text-xs text-[#7A6B63] mt-1">
                    Menerima pesanan, validasi bukti transfer (Valid/Tidak Valid), dan mencetak struk belanja.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#77431D] inline-flex items-center gap-1">
                  Buka Portal &rarr;
                </span>
              </Link>

              <Link
                href="/kitchen"
                className="bg-white p-5 rounded-2xl border border-[#EDDEC9] hover:shadow-md hover:border-[#DE7525] transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFEBDC] text-[#DE7525] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                    🍳
                  </div>
                  <h3 className="text-sm font-bold text-[#3C2923]">Kitchen (Dapur)</h3>
                  <p className="text-xs text-[#7A6B63] mt-1">
                    Antrean pesanan valid, input estimasi waktu pembuatan, dan update pesanan siap diambil.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#DE7525] inline-flex items-center gap-1">
                  Buka Portal &rarr;
                </span>
              </Link>

              <Link
                href="/owner"
                className="bg-white p-5 rounded-2xl border border-[#EDDEC9] hover:shadow-md hover:border-[#3C2923] transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#EFE6DC] text-[#3C2923] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                    👑
                  </div>
                  <h3 className="text-sm font-bold text-[#3C2923]">Owner (Laporan)</h3>
                  <p className="text-xs text-[#7A6B63] mt-1">
                    Memantau ringkasan omzet, total transaksi harian, dan ulasan kepuasan pelanggan.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#3C2923] inline-flex items-center gap-1">
                  Buka Portal &rarr;
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#3C2923] text-[#EDE4DC] py-6 px-6 text-center text-xs">
        <p>&copy; 2026 Toko Donat Habil. Modul 4 Praktikum APSI - Laboratorium Sistem Informasi dan Keputusan (LSIK) Unand.</p>
      </footer>
    </div>
  );
}
