"use client";

import React, { useState } from "react";
import { logoutClient } from "@/lib/client-auth";

interface PesananKasir {
  id: string;
  pelanggan: string;
  items: string;
  total: number;
  metode: "QRIS" | "Tunai";
  statusBayar: "Menunggu Validasi" | "Berhasil" | "Tidak Valid";
  statusPesanan: string;
  waktu: string;
  buktiBayar?: string;
}

export default function KasirPage() {
  const [activeMenu, setActiveMenu] = useState<"beranda" | "masuk" | "validasi" | "struk" | "rekap">("validasi");

  // State Pesanan Kasir (Sesuai seed data Modul 4)
  const [pesananList, setPesananList] = useState<PesananKasir[]>([
    {
      id: "PSN005",
      pelanggan: "Habiib",
      items: "2x Donat Gula Halus, 1x Donat Keju",
      total: 13000,
      metode: "QRIS",
      statusBayar: "Menunggu Validasi",
      statusPesanan: "Menunggu Validasi",
      waktu: "Hari ini, 10:10 WIB",
      buktiBayar: "bukti_transfer_sample.png",
    },
    {
      id: "PSN001",
      pelanggan: "Adzra",
      items: "2x Donat Gula Halus",
      total: 8000,
      metode: "QRIS",
      statusBayar: "Berhasil",
      statusPesanan: "Selesai",
      waktu: "10/18/2026, 09:20 WIB",
      buktiBayar: "/uploads/qris_psn001.png",
    },
    {
      id: "PSN002",
      pelanggan: "Asqa",
      items: "1x Donat Cokelat Meses",
      total: 4000,
      metode: "Tunai",
      statusBayar: "Berhasil",
      statusPesanan: "Selesai",
      waktu: "10/19/2026, 10:35 WIB",
    },
  ]);

  // Modal Cetak Struk
  const [selectedStruk, setSelectedStruk] = useState<PesananKasir | null>(null);

  // Use Case 2: Memvalidasi Pembayaran
  const handleValidasi = (id: string, isValid: boolean) => {
    setPesananList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            statusBayar: isValid ? "Berhasil" : "Tidak Valid",
            statusPesanan: isValid ? "Diproses Kitchen" : "Pembayaran Tidak Valid",
          };
        }
        return p;
      })
    );

    if (isValid) {
      alert(`Pembayaran pesanan ${id} dinyatakan VALID! Pesanan diteruskan ke antrean Dapur (Kitchen).`);
    } else {
      alert(`Pembayaran pesanan ${id} dinyatakan TIDAK VALID! Notifikasi dikirimkan ke Pelanggan.`);
    }
  };

  const pendingValidationCount = pesananList.filter((p) => p.statusBayar === "Menunggu Validasi").length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C2923] flex flex-col md:flex-row">
      {/* Sidebar Panel Kasir (Sesuai Desain Figma Frame 338:10841) */}
      <aside className="w-full md:w-64 bg-white border-r border-[#EFE5D8] p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Panel */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#F2E5D6]">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#77431D] to-[#A05C2C] flex items-center justify-center text-xl text-white shadow-md">
              🧾
            </div>
            <div>
              <h2 className="text-sm font-black text-[#3C2923] tracking-tight">
                Habil Donut
              </h2>
              <span className="text-[11px] font-bold text-[#F8A106] uppercase tracking-wider block">
                Panel Kasir
              </span>
            </div>
          </div>

          {/* Navigasi Kasir */}
          <nav className="mt-6 space-y-1 text-xs font-bold text-[#635147]">
            <button
              onClick={() => setActiveMenu("beranda")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                activeMenu === "beranda" ? "bg-[#FFF0D0] text-[#77431D]" : "hover:bg-[#FAF4ED]"
              }`}
            >
              <span>🏠</span>
              <span>Beranda</span>
            </button>

            <button
              onClick={() => setActiveMenu("validasi")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition ${
                activeMenu === "validasi" ? "bg-[#FFF0D0] text-[#77431D]" : "hover:bg-[#FAF4ED]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span>💳</span>
                <span>Validasi Bayar</span>
              </div>
              {pendingValidationCount > 0 && (
                <span className="bg-[#F8A106] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingValidationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu("masuk")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                activeMenu === "masuk" ? "bg-[#FFF0D0] text-[#77431D]" : "hover:bg-[#FAF4ED]"
              }`}
            >
              <span>📥</span>
              <span>Pesanan Masuk</span>
            </button>

            <button
              onClick={() => setActiveMenu("struk")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                activeMenu === "struk" ? "bg-[#FFF0D0] text-[#77431D]" : "hover:bg-[#FAF4ED]"
              }`}
            >
              <span>🧾</span>
              <span>Cetak Struk</span>
            </button>

            <button
              onClick={() => setActiveMenu("rekap")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                activeMenu === "rekap" ? "bg-[#FFF0D0] text-[#77431D]" : "hover:bg-[#FAF4ED]"
              }`}
            >
              <span>📊</span>
              <span>Rekap Data</span>
            </button>
          </nav>
        </div>

        {/* User Kasir & Keluar */}
        <div className="pt-6 border-t border-[#F2E5D6] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#F3E2CF] flex items-center justify-center font-bold text-xs text-[#77431D]">
              A
            </div>
            <div>
              <div className="text-xs font-bold text-[#3C2923]">Aidil (Kasir 1)</div>
              <div className="text-[10px] text-[#8C7A70]">Shift Pagi</div>
            </div>
          </div>
          <button
            onClick={() => logoutClient()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#8C6D58] hover:bg-[#FAF4ED] transition"
          >
            <span>🚪</span>
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama Kasir */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#3C2923]">Halo, Kasir!</h1>
            <p className="text-xs text-[#7A6B63] mt-1">
              {pendingValidationCount > 0
                ? `Ada ${pendingValidationCount} pembayaran baru yang perlu divalidasi.`
                : "Semua pembayaran saat ini telah divalidasi."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sistem Kasir Aktif
            </span>
          </div>
        </div>

        {/* Tab 1: Validasi Pembayaran (USE CASE UTAMA KASIR) */}
        {activeMenu === "validasi" && (
          <div className="space-y-6">
            <div className="bg-[#FFF4E2] border border-[#F3DFC1] rounded-3xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-sm font-bold text-[#3C2923]">
                    Antrean Validasi Pembayaran
                  </h3>
                  <p className="text-xs text-[#7A6B63]">
                    Periksa bukti bayar pelanggan. Pembayaran valid akan langsung diteruskan ke antrean Dapur (*Kitchen*).
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#77431D] bg-white px-3 py-1.5 rounded-xl border border-[#EDDEC9]">
                Use Case Kasir
              </span>
            </div>

            <div className="space-y-4">
              {pesananList.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2E7DC] pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-[#3C2923] bg-[#FCFAF6] px-3 py-1 rounded-xl border border-[#EADCCE]">
                        {p.id}
                      </span>
                      <div>
                        <div className="font-extrabold text-sm text-[#3C2923]">
                          Pemesan: {p.pelanggan}
                        </div>
                        <div className="text-xs text-[#8C7A70]">{p.waktu}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#77431D] bg-[#F6E9DD] px-3 py-1 rounded-xl">
                        Metode: {p.metode}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          p.statusBayar === "Berhasil"
                            ? "bg-green-100 text-green-700"
                            : p.statusBayar === "Menunggu Validasi"
                            ? "bg-yellow-100 text-yellow-800 animate-pulse"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.statusBayar}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <span className="text-[#9C897D] block mb-1">Pesanan Donat:</span>
                      <p className="font-semibold text-[#3C2923]">{p.items}</p>
                    </div>

                    <div>
                      <span className="text-[#9C897D] block mb-1">Total Tagihan:</span>
                      <p className="font-black text-base text-[#F8A106]">
                        Rp{p.total.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#9C897D] block mb-1">Bukti Transfer Pelanggan:</span>
                      {p.buktiBayar ? (
                        <div className="flex items-center gap-2 p-2 bg-[#FCFAF6] rounded-xl border border-[#EFE5D8]">
                          <span className="text-lg">📷</span>
                          <span className="font-mono text-[11px] text-[#4A3932] truncate">
                            {p.buktiBayar}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#9C897D] italic">Pembayaran Tunai di Kasir</span>
                      )}
                    </div>
                  </div>

                  {/* Tombol Keputusan Validasi Sesuai Activity Diagram */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#F5ECE0] gap-3">
                    <div className="text-xs text-[#7A6B63]">
                      Status Pesanan: <strong className="text-[#3C2923]">{p.statusPesanan}</strong>
                    </div>

                    {p.statusBayar === "Menunggu Validasi" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleValidasi(p.id, false)}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition"
                        >
                          ✕ Tidak Valid (Tolak)
                        </button>
                        <button
                          onClick={() => handleValidasi(p.id, true)}
                          className="px-5 py-2 bg-gradient-to-r from-[#F8A106] to-[#EEA643] hover:from-[#E69300] hover:to-[#DE9332] text-white font-bold rounded-xl shadow-md text-xs transition active:scale-95"
                        >
                          ✓ Valid (Teruskan ke Dapur)
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStruk(p)}
                          className="px-4 py-2 bg-[#F6E9DD] hover:bg-[#EED7B8] text-[#77431D] font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                        >
                          <span>🖨️ Cetak Struk</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Beranda Kasir (Kartu 4 Menu dari Figma) */}
        {activeMenu === "beranda" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div
              onClick={() => setActiveMenu("masuk")}
              className="bg-white p-6 rounded-3xl border border-[#EFE5D8] shadow-sm hover:shadow-md cursor-pointer hover:border-[#F8A106] transition space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0D0] text-2xl flex items-center justify-center text-[#F8A106]">
                📥
              </div>
              <h3 className="font-extrabold text-base text-[#3C2923]">Pesanan Masuk</h3>
              <p className="text-xs text-[#7A6B63]">
                Lihat daftar pesanan baru yang dibuat pelanggan lalu terima pesanan ke sistem.
              </p>
              <span className="text-xs font-bold text-[#F8A106] inline-block">Buka Menu &rarr;</span>
            </div>

            <div
              onClick={() => setActiveMenu("validasi")}
              className="bg-white p-6 rounded-3xl border border-[#EFE5D8] shadow-sm hover:shadow-md cursor-pointer hover:border-[#77431D] transition space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F6E9DD] text-2xl flex items-center justify-center text-[#77431D]">
                💳
              </div>
              <h3 className="font-extrabold text-base text-[#3C2923]">Validasi Pembayaran</h3>
              <p className="text-xs text-[#7A6B63]">
                Pantau bukti transfer, konfirmasi pembayaran valid, dan teruskan ke antrean kitchen.
              </p>
              <span className="text-xs font-bold text-[#77431D] inline-block">Buka Menu &rarr;</span>
            </div>

            <div
              onClick={() => setActiveMenu("struk")}
              className="bg-white p-6 rounded-3xl border border-[#EFE5D8] shadow-sm hover:shadow-md cursor-pointer hover:border-[#DE7525] transition space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFEBDC] text-2xl flex items-center justify-center text-[#DE7525]">
                🧾
              </div>
              <h3 className="font-extrabold text-base text-[#3C2923]">Struk Penjualan</h3>
              <p className="text-xs text-[#7A6B63]">
                Buat dan cetak struk resmi transaksi penjualan untuk diserahkan ke pelanggan.
              </p>
              <span className="text-xs font-bold text-[#DE7525] inline-block">Buka Menu &rarr;</span>
            </div>

            <div
              onClick={() => setActiveMenu("rekap")}
              className="bg-white p-6 rounded-3xl border border-[#EFE5D8] shadow-sm hover:shadow-md cursor-pointer hover:border-[#3C2923] transition space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EFE6DC] text-2xl flex items-center justify-center text-[#3C2923]">
                📊
              </div>
              <h3 className="font-extrabold text-base text-[#3C2923]">Rekap Data</h3>
              <p className="text-xs text-[#7A6B63]">
                Rekap pesanan dan transaksi harian untuk laporan berkala kasir ke owner.
              </p>
              <span className="text-xs font-bold text-[#3C2923] inline-block">Buka Menu &rarr;</span>
            </div>
          </div>
        )}

        {/* Tab 3: Pesanan Masuk / Tagihan */}
        {activeMenu === "masuk" && (
          <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] space-y-4">
            <h3 className="font-black text-base text-[#3C2923]">Daftar Pesanan Masuk</h3>
            <div className="divide-y divide-[#F2E5D6]">
              {pesananList.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#3C2923]">{p.id} - {p.pelanggan}</span>
                    <p className="text-[#7A6B63]">{p.items}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[#F8A106]">Rp{p.total.toLocaleString("id-ID")}</span>
                    <p className="text-[10px] text-green-700 font-bold">{p.statusPesanan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Cetak Struk */}
        {activeMenu === "struk" && (
          <div className="space-y-4">
            <h3 className="font-black text-base text-[#3C2923]">Cetak Struk Transaksi</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {pesananList
                .filter((p) => p.statusBayar === "Berhasil")
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-5 rounded-2xl border border-[#EFE5D8] flex items-center justify-between"
                  >
                    <div className="text-xs">
                      <div className="font-bold text-[#3C2923]">{p.id} &bull; {p.pelanggan}</div>
                      <div className="text-[#8C7A70]">{p.waktu}</div>
                      <div className="font-black text-[#F8A106] mt-1">Rp{p.total.toLocaleString("id-ID")}</div>
                    </div>
                    <button
                      onClick={() => setSelectedStruk(p)}
                      className="px-4 py-2 bg-[#F8A106] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#E69300]"
                    >
                      Buka Struk
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 5: Rekap Data Kasir */}
        {activeMenu === "rekap" && (
          <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-[#3C2923]">Rekapitulasi Kasir Shift Ini</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 font-bold rounded-full text-[11px]">
                Kasir: Aidil
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-[#FCFAF6] rounded-2xl border border-[#EFE5D8]">
                <span className="text-[#8C7A70]">Total Transaksi</span>
                <p className="text-xl font-black text-[#3C2923] mt-1">{pesananList.length}</p>
              </div>
              <div className="p-4 bg-[#FCFAF6] rounded-2xl border border-[#EFE5D8]">
                <span className="text-[#8C7A70]">Total Pendapatan</span>
                <p className="text-xl font-black text-[#F8A106] mt-1">
                  Rp{pesananList.filter((p) => p.statusBayar === "Berhasil").reduce((a, b) => a + b.total, 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="p-4 bg-[#FCFAF6] rounded-2xl border border-[#EFE5D8]">
                <span className="text-[#8C7A70]">Menunggu Validasi</span>
                <p className="text-xl font-black text-orange-600 mt-1">{pendingValidationCount}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Cetak Struk (Sesuai Desain Figma 338:11409) */}
      {selectedStruk && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EFE5D8] shadow-2xl space-y-4">
            {/* Tampilan Fisik Struk */}
            <div className="text-center font-mono text-xs border-b border-dashed border-[#CCC] pb-4">
              <div className="text-2xl mb-1">🍩</div>
              <h4 className="font-bold text-sm tracking-wider">TOKO DONAT HABIL</h4>
              <p className="text-[10px] text-[#666]">Jl. Melati No. 10, Padang</p>
              <p className="text-[10px] text-[#666]">Telp: 081234561231</p>
            </div>

            <div className="font-mono text-[11px] space-y-2 border-b border-dashed border-[#CCC] pb-3">
              <div className="flex justify-between">
                <span>No. Pesanan:</span>
                <span className="font-bold">{selectedStruk.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{selectedStruk.pelanggan}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{selectedStruk.waktu}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold">{selectedStruk.metode}</span>
              </div>
              <div className="pt-2">
                <span className="text-[#666] block">Pesanan:</span>
                <p className="font-bold">{selectedStruk.items}</p>
              </div>
            </div>

            <div className="font-mono text-xs flex justify-between font-bold">
              <span>TOTAL BAYAR:</span>
              <span className="text-[#F8A106]">Rp{selectedStruk.total.toLocaleString("id-ID")}</span>
            </div>

            <div className="text-center font-mono text-[10px] text-[#777] pt-1">
              *** LUNAS - TERIMA KASIH ***
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStruk(null)}
                className="flex-1 py-2 bg-[#F4EBE1] text-[#6D5D55] font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-[#77431D] text-white font-bold rounded-xl text-xs shadow-sm hover:bg-[#5E3416]"
              >
                🖨️ Cetak Fisik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
