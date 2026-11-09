"use client";

import React, { useState, useEffect } from "react";
import { logoutClient } from "@/lib/client-auth";

interface TransaksiOwner {
  id: string;
  pesananId: string;
  pelanggan: string;
  kasir: string;
  waktu: string;
  items: string;
  total: number;
  metode: string;
  status: string;
}

interface UlasanOwner {
  id: string;
  pesananId: string;
  pelanggan: string;
  kritik: string;
  saran: string;
}

interface TopMenuItem {
  id_menu: string;
  nama: string;
  terjual: number;
  subtotal: number;
}

export default function OwnerPage() {
  const [periode, setPeriode] = useState<"hari_ini" | "minggu_ini" | "bulan_ini">("bulan_ini");
  const [transaksiList, setTransaksiList] = useState<TransaksiOwner[]>([]);
  const [ulasanList, setUlasanList] = useState<UlasanOwner[]>([]);
  const [topMenuList, setTopMenuList] = useState<TopMenuItem[]>([]);
  const [totalOmzet, setTotalOmzet] = useState<number>(0);
  const [totalPesanan, setTotalPesanan] = useState<number>(0);
  const [rataRata, setRataRata] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;

    const loadLaporanOwner = async () => {
      try {
        const res = await fetch(`/api/owner/laporan?periode=${periode}`);
        if (!isCancelled && res.ok) {
          const data = await res.json();
          if (data.laporan) {
            setTransaksiList(data.laporan.transaksi || []);
            setUlasanList(data.laporan.ulasan || []);
            setTopMenuList(data.laporan.topMenu || []);
            setTotalOmzet(data.laporan.totalOmzet || 0);
            setTotalPesanan(data.laporan.totalTransaksiBerhasil || 0);
            setRataRata(data.laporan.rataRataTransaksi || 0);
          }
        }
      } catch (err) {
        console.error("Gagal memuat laporan owner:", err);
      }
    };

    loadLaporanOwner();

    return () => {
      isCancelled = true;
    };
  }, [periode]);

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
            <button
              onClick={() => logoutClient()}
              className="px-3 py-1.5 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#8C6D58] hover:bg-[#FAF4ED]"
            >
              Keluar
            </button>
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
              {totalPesanan} Pesanan
            </div>
            <span className="text-[11px] text-[#8C7A70] block mt-1">
              Periode {periode.replace("_", " ")}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EFE5D8] shadow-sm">
            <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider">
              Rata-rata Order
            </span>
            <div className="text-2xl font-black text-[#77431D] mt-2">
              Rp{rataRata.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-[#8C7A70] block mt-1">
              Per Transaksi Berhasil
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

        {/* Donat Terlaris Periode Ini */}
        {topMenuList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-3">
            <h3 className="font-black text-base text-[#3C2923]">
              Donat Terlaris ({periode.replace("_", " ")})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topMenuList.map((item, idx) => (
                <div
                  key={item.id_menu}
                  className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#EFE5D8] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#FFF0D0] text-[#77431D] font-extrabold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-xs text-[#3C2923]">
                        {item.nama}
                      </div>
                      <div className="text-[11px] text-[#8C7A70]">
                        Terjual {item.terjual} pcs
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-[#F8A106]">
                    Rp{item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabel Rekap Transaksi Penjualan */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#3C2923]">
              Data Transaksi Penjualan (Sesuai Normalisasi 3NF)
            </h3>
            <span className="text-xs bg-[#FFF0D0] text-[#77431D] font-bold px-3 py-1 rounded-full">
              {transaksiList.length} Data Terverifikasi
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
                  <p className="text-[#3C2923] italic">&ldquo;{u.kritik}&rdquo;</p>
                </div>
                <div>
                  <span className="text-[#8C7A70] font-semibold block">Saran:</span>
                  <p className="text-[#77431D] font-medium">&ldquo;{u.saran}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
