"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function OwnerPage() {
  const [periode, setPeriode] = useState<"hari_ini" | "minggu_ini" | "bulan_ini">("bulan_ini");

  // Data Rekap Transaksi (Sesuai seed data Modul 4)
  const transaksiList = [
    {
      id: "TRX001",
      pesananId: "PSN001",
      pelanggan: "Adzra",
      kasir: "Aidil",
      waktu: "2026-11-01 09:20 WIB",
      items: "2x Donat Gula Halus",
      total: 8000,
      metode: "QRIS",
      status: "Berhasil",
    },
    {
      id: "TRX002",
      pesananId: "PSN002",
      pelanggan: "Asqa",
      kasir: "Aidil",
      waktu: "2026-11-02 10:35 WIB",
      items: "1x Donat Cokelat Meses",
      total: 4000,
      metode: "Tunai",
      status: "Berhasil",
    },
    {
      id: "TRX003",
      pesananId: "PSN003",
      pelanggan: "Habiib",
      kasir: "Aini",
      waktu: "2026-11-02 11:20 WIB",
      items: "2x Donat Keju",
      total: 10000,
      metode: "QRIS",
      status: "Berhasil",
    },
    {
      id: "TRX004",
      pesananId: "PSN004",
      pelanggan: "Arya",
      kasir: "Aidil",
      waktu: "2026-11-03 10:18 WIB",
      items: "4x Donat Gula Halus",
      total: 16000,
      metode: "Tunai",
      status: "Berhasil",
    },
  ];

  // Data Ulasan Pelanggan
  const ulasanList = [
    {
      id: "ULS001",
      pesananId: "PSN001",
      pelanggan: "Adzra",
      kritik: "Rasa donat sangat enak dan empuk.",
      saran: "Perbanyak varian topping matcha dan minuman dingin.",
    },
    {
      id: "ULS002",
      pesananId: "PSN002",
      pelanggan: "Asqa",
      kritik: "Pelayanan kasir ramah dan cepat.",
      saran: "Pertahankan konsistensi rasa dan packaging.",
    },
  ];

  const totalOmzet = transaksiList.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C2923] flex flex-col">
      {/* Header Owner Panel (Sesuai Desain Figma Frame 412:2237) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EFE5D8] px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3C2923] to-[#77431D] flex items-center justify-center text-xl text-white shadow-md">
              👑
            </div>
            <div>
              <h1 className="text-base font-black text-[#3C2923] tracking-tight">
                HABIL DONUTS - OWNER
              </h1>
              <span className="text-[10px] font-bold text-[#F8A106] uppercase tracking-wider block">
                Executive &amp; Sales Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="font-bold text-[#3C2923] block">Habil (Owner)</span>
              <span className="text-[10px] text-[#8C7A70]">Toko Donat Habil</span>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#8C6D58] hover:bg-[#FAF4ED]"
            >
              Keluar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Owner */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Filter Periode */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#3C2923]">
              Ringkasan Kinerja Penjualan
            </h2>
            <p className="text-xs text-[#7A6B63] mt-0.5">
              Pantau arus pendapatan toko donat dan kepuasan pelanggan
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#F4EBE1] p-1 rounded-2xl text-xs font-bold">
            {(["hari_ini", "minggu_ini", "bulan_ini"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`px-3 py-1.5 rounded-xl transition capitalize ${
                  periode === p
                    ? "bg-[#3C2923] text-white shadow-sm"
                    : "text-[#635147] hover:text-[#3C2923]"
                }`}
              >
                {p.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Kartu Metrik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-[#EFE5D8] shadow-sm">
            <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider">
              Total Pendapatan
            </span>
            <div className="text-2xl font-black text-[#F8A106] mt-2">
              Rp{totalOmzet.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-green-700 font-bold block mt-1">
              ✓ Semua Transaksi Valid
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EFE5D8] shadow-sm">
            <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="text-2xl font-black text-[#3C2923] mt-2">
              {transaksiList.length} Pesanan
            </div>
            <span className="text-[11px] text-[#8C7A70] block mt-1">
              100% Selesai Dikerjakan
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EFE5D8] shadow-sm">
            <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider">
              Rata-rata Order
            </span>
            <div className="text-2xl font-black text-[#77431D] mt-2">
              Rp{(totalOmzet / transaksiList.length).toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-[#8C7A70] block mt-1">
              Per Keranjang Belanja
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EFE5D8] shadow-sm">
            <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider">
              Kepuasan Pelanggan
            </span>
            <div className="text-2xl font-black text-green-600 mt-2">
              4.9 / 5.0 ⭐
            </div>
            <span className="text-[11px] text-green-700 block mt-1">
              {ulasanList.length} Ulasan Masuk
            </span>
          </div>
        </div>

        {/* Tabel Rekap Transaksi Penjualan */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#3C2923]">
              Data Transaksi Penjualan (Sesuai Normalisasi 3NF)
            </h3>
            <span className="text-xs bg-[#FFF0D0] text-[#77431D] font-bold px-3 py-1 rounded-full">
              4 Data Terverifikasi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF4ED] text-[#77431D] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">ID Transaksi</th>
                  <th className="p-3.5">No. Pesanan</th>
                  <th className="p-3.5">Pelanggan</th>
                  <th className="p-3.5">Kasir</th>
                  <th className="p-3.5">Rincian Menu</th>
                  <th className="p-3.5">Metode</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E5D6]">
                {transaksiList.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FCFAF6] transition">
                    <td className="p-3.5 font-mono font-bold text-[#8C7A70]">{t.id}</td>
                    <td className="p-3.5 font-mono font-bold text-[#3C2923]">{t.pesananId}</td>
                    <td className="p-3.5 font-bold text-[#3C2923]">{t.pelanggan}</td>
                    <td className="p-3.5 text-[#635147]">{t.kasir}</td>
                    <td className="p-3.5 text-[#635147]">{t.items}</td>
                    <td className="p-3.5 font-semibold text-[#77431D]">{t.metode}</td>
                    <td className="p-3.5 font-black text-[#F8A106]">
                      Rp{t.total.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold text-[10px]">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Ulasan dan Feedback */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4">
          <h3 className="font-black text-base text-[#3C2923]">
            Ulasan &amp; Kritik Saran Pelanggan
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {ulasanList.map((u) => (
              <div
                key={u.id}
                className="p-5 rounded-2xl bg-[#FCFAF6] border border-[#EFE5D8] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#F2E5D6] pb-2">
                  <span className="font-bold text-[#3C2923]">
                    {u.pelanggan} ({u.pesananId})
                  </span>
                  <span className="font-mono text-[#8C7A70] text-[10px]">{u.id}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] font-semibold block">Kritik:</span>
                  <p className="text-[#3C2923] italic">"{u.kritik}"</p>
                </div>
                <div>
                  <span className="text-[#8C7A70] font-semibold block">Saran:</span>
                  <p className="text-[#77431D] font-medium">"{u.saran}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
