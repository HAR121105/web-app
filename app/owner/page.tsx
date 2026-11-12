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
  isDeleted?: boolean;
  dihapusPada?: string | null;
  dihapusOleh?: string | null;
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
  const [tampilkanTerhapus, setTampilkanTerhapus] = useState<boolean>(false);
  const [transaksiList, setTransaksiList] = useState<TransaksiOwner[]>([]);
  const [ulasanList, setUlasanList] = useState<UlasanOwner[]>([]);
  const [topMenuList, setTopMenuList] = useState<TopMenuItem[]>([]);
  const [totalOmzet, setTotalOmzet] = useState<number>(0);
  const [totalPesanan, setTotalPesanan] = useState<number>(0);
  const [rataRata, setRataRata] = useState<number>(0);
  const [totalRekapTerhapus, setTotalRekapTerhapus] = useState<number>(0);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  // State Modal Konfirmasi Hapus Rekapan (Persisten via rekap_dihapus)
  const [hapusRekapModal, setHapusRekapModal] = useState<{
    open: boolean;
    transaksiId: string;
    pesananId: string;
    pelanggan: string;
    total: number;
    loading: boolean;
  }>({
    open: false,
    transaksiId: "",
    pesananId: "",
    pelanggan: "",
    total: 0,
    loading: false,
  });

  // State Modal Konfirmasi Pulihkan Rekapan
  const [pulihkanModal, setPulihkanModal] = useState<{
    open: boolean;
    transaksiId: string;
    pesananId: string;
    pelanggan: string;
    loading: boolean;
  }>({
    open: false,
    transaksiId: "",
    pesananId: "",
    pelanggan: "",
    loading: false,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchLaporan = async () => {
      try {
        const res = await fetch(
          `/api/owner/laporan?periode=${periode}&terhapus=${tampilkanTerhapus}`
        );
        if (!isCancelled && res.ok) {
          const data = await res.json();
          if (data.laporan) {
            setTransaksiList(data.laporan.transaksi || []);
            setUlasanList(data.laporan.ulasan || []);
            setTopMenuList(data.laporan.topMenu || []);
            setTotalOmzet(data.laporan.totalOmzet || 0);
            setTotalPesanan(data.laporan.totalTransaksiBerhasil || 0);
            setRataRata(data.laporan.rataRataTransaksi || 0);
            setTotalRekapTerhapus(data.laporan.totalRekapTerhapus || 0);
          }
        }
      } catch (err) {
        console.error("Gagal memuat laporan owner:", err);
      }
    };

    fetchLaporan();

    return () => {
      isCancelled = true;
    };
  }, [periode, tampilkanTerhapus, refreshCounter]);

  const handleUnduhCsv = () => {
    // Unduh CSV dari endpoint GET /api/owner/rekap/export?periode=...
    const url = `/api/owner/rekap/export?periode=${periode}`;
    window.open(url, "_blank");
  };

  const handleHapusRekap = async () => {
    if (!hapusRekapModal.transaksiId) return;

    setHapusRekapModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/owner/rekap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: hapusRekapModal.transaksiId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyembunyikan rekapan.");
        setHapusRekapModal((prev) => ({ ...prev, loading: false }));
        return;
      }

      setHapusRekapModal({
        open: false,
        transaksiId: "",
        pesananId: "",
        pelanggan: "",
        total: 0,
        loading: false,
      });

      // Data tampilan selalu berasal dari API setelah aksi (re-fetch autoritatif)
      setRefreshCounter((c) => c + 1);
      alert(data.message || "Baris rekapan berhasil disembunyikan.");
    } catch {
      alert("Terjadi kesalahan jaringan saat menyembunyikan rekapan.");
      setHapusRekapModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePulihkanRekap = async () => {
    if (!pulihkanModal.transaksiId) return;

    setPulihkanModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/owner/rekap/pulihkan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pulihkanModal.transaksiId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal memulihkan rekapan.");
        setPulihkanModal((prev) => ({ ...prev, loading: false }));
        return;
      }

      setPulihkanModal({
        open: false,
        transaksiId: "",
        pesananId: "",
        pelanggan: "",
        loading: false,
      });

      // Data tampilan selalu berasal dari API setelah aksi (re-fetch autoritatif)
      setRefreshCounter((c) => c + 1);
      alert(data.message || "Baris rekapan berhasil dipulihkan.");
    } catch {
      alert("Terjadi kesalahan jaringan saat memulihkan rekapan.");
      setPulihkanModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C2923] flex flex-col">
      {/* Header Owner Panel */}
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
              className="px-3 py-1.5 rounded-xl border border-[#EADBCC] text-xs font-bold text-[#8C6D58] hover:bg-[#FAF4ED] transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Owner */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Filter Periode dan Tombol Aksi */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#3C2923]">
              Ringkasan Kinerja Penjualan
            </h2>
            <p className="text-xs text-[#7A6B63] mt-0.5">
              Pantau arus pendapatan toko donat dan kepuasan pelanggan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Waktu */}
            <div className="flex bg-[#F2E5D6] p-1 rounded-2xl border border-[#E5D7C6]">
              {(["hari_ini", "minggu_ini", "bulan_ini"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    periode === p
                      ? "bg-[#3C2923] text-white shadow-sm"
                      : "text-[#635147] hover:text-[#3C2923]"
                  }`}
                >
                  {p.replace("_", " ")}
                </button>
              ))}
            </div>

            <button
              onClick={handleUnduhCsv}
              className="px-4 py-2 bg-gradient-to-r from-[#F8A106] to-[#DE7525] hover:from-[#E69300] hover:to-[#C6651E] text-white font-extrabold rounded-2xl text-xs shadow-md transition flex items-center gap-1.5"
              title="Unduh rekapan penjualan dalam format file CSV untuk Excel"
            >
              <span>📥</span> Unduh CSV
            </button>
          </div>
        </div>

        {/* 4 Kartu Metrik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-[#EFE5D8] shadow-sm">
            <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider">
              {tampilkanTerhapus ? "Nilai Rekap Disembunyikan" : "Total Pendapatan"}
            </span>
            <div className="text-2xl font-black text-[#F8A106] mt-2">
              Rp{totalOmzet.toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-green-700 font-bold block mt-1">
              ✓ {tampilkanTerhapus ? "Daftar Tersembunyi" : "Semua Transaksi Tampil"}
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
              Rekap Disembunyikan
            </span>
            <div className="text-2xl font-black text-red-600 mt-2">
              {totalRekapTerhapus} Baris
            </div>
            <span className="text-[11px] text-[#8C7A70] block mt-1">
              Tersimpan di Audit Database
            </span>
          </div>
        </div>

        {/* Donat Terlaris */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4">
          <h3 className="font-black text-base text-[#3C2923]">
            🍩 Donat Terlaris Periode Ini
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            {topMenuList.length === 0 ? (
              <p className="text-xs text-[#8C7A70] col-span-3">
                Belum ada transaksi valid pada periode ini.
              </p>
            ) : (
              topMenuList.map((m, idx) => (
                <div
                  key={m.id_menu}
                  className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#EFE5D8] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? "bg-[#F8A106] text-white"
                          : idx === 1
                          ? "bg-[#968278] text-white"
                          : "bg-[#D6C2B4] text-[#3C2923]"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#3C2923]">{m.nama}</h4>
                      <span className="text-[10px] text-[#8C7A70]">{m.id_menu}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-[#F8A106] block">
                      {m.terjual} terjual
                    </span>
                    <span className="text-[10px] text-[#8C7A70]">
                      Rp{m.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tabel Rekapitulasi Penjualan & Pembukuan */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-base text-[#3C2923] flex items-center gap-2">
                <span>{tampilkanTerhapus ? "📋 Daftar Rekapan Disembunyikan" : "📋 Rekapitulasi Penjualan & Pembukuan"}</span>
              </h3>
              <p className="text-xs text-[#7A6B63] mt-0.5">
                {tampilkanTerhapus
                  ? "Baris-baris ini sedang disembunyikan dari laporan dan ekspor CSV. Anda dapat memulihkannya kapan saja."
                  : "Rekap transaksi donat terverifikasi kasir untuk pembukuan omzet toko"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Tampilkan Rekap Terhapus */}
              <button
                type="button"
                onClick={() => setTampilkanTerhapus(!tampilkanTerhapus)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                  tampilkanTerhapus
                    ? "bg-red-50 text-red-700 border-red-300 shadow-inner"
                    : "bg-[#FAF4ED] text-[#635147] border-[#EADBCC] hover:bg-[#F2E5D6]"
                }`}
              >
                <span>{tampilkanTerhapus ? "👁️" : "🗑️"}</span>
                {tampilkanTerhapus ? "Kembali ke Rekap Aktif" : `Tampilkan Rekap Terhapus (${totalRekapTerhapus})`}
              </button>

              <span className="text-xs bg-[#FFF0D0] text-[#77431D] font-bold px-3 py-1.5 rounded-full">
                {transaksiList.length} Data {tampilkanTerhapus ? "Disembunyikan" : "Aktif"}
              </span>
            </div>
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
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center rounded-r-xl">Aksi Rekap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E5D6]">
                {transaksiList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-[#8C7A70]">
                      {tampilkanTerhapus
                        ? "Tidak ada rekapan yang sedang disembunyikan."
                        : "Tidak ada transaksi pada periode ini."}
                    </td>
                  </tr>
                ) : (
                  transaksiList.map((t) => (
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
                        {tampilkanTerhapus ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                            Disembunyikan
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold text-[10px]">
                            {t.status}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {tampilkanTerhapus ? (
                          <button
                            onClick={() =>
                              setPulihkanModal({
                                open: true,
                                transaksiId: t.id,
                                pesananId: t.pesananId,
                                pelanggan: t.pelanggan,
                                loading: false,
                              })
                            }
                            className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-bold rounded-lg text-[11px] transition shadow-xs flex items-center gap-1 mx-auto"
                            title="Pulihkan baris rekapan ini ke laporan aktif"
                          >
                            <span>🔄</span> Pulihkan
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setHapusRekapModal({
                                open: true,
                                transaksiId: t.id,
                                pesananId: t.pesananId,
                                pelanggan: t.pelanggan,
                                total: t.total,
                                loading: false,
                              })
                            }
                            className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-lg text-[11px] transition shadow-xs flex items-center gap-1 mx-auto"
                            title="Sembunyikan baris rekapan ini dari laporan"
                          >
                            <span>🗑️</span> Sembunyikan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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

      {/* Modal Dialog Konfirmasi Hapus/Sembunyikan Rekap */}
      {hapusRekapModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EFE5D8] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto">
              📋
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-[#3C2923]">
                Konfirmasi Sembunyikan Rekapan
              </h3>
              <p className="text-xs text-[#7A6B63]">
                Sembunyikan rekapan transaksi <strong className="text-[#3C2923]">{hapusRekapModal.transaksiId}</strong> ({hapusRekapModal.pesananId} - {hapusRekapModal.pelanggan})?
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
              <p className="font-bold">Perhatian Integritas Data:</p>
              <p>
                Baris ini akan disembunyikan dari laporan. Data transaksi dan pesanan asli tidak dihapus dan rekap dapat dipulihkan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setHapusRekapModal({
                    open: false,
                    transaksiId: "",
                    pesananId: "",
                    pelanggan: "",
                    total: 0,
                    loading: false,
                  })
                }
                disabled={hapusRekapModal.loading}
                className="flex-1 py-2.5 bg-[#F4EBE1] text-[#6D5D55] font-bold rounded-xl text-xs hover:bg-[#EADBCC] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleHapusRekap}
                disabled={hapusRekapModal.loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {hapusRekapModal.loading ? "Memproses..." : "Ya, Sembunyikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Pulihkan Rekapan */}
      {pulihkanModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EFE5D8] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl mx-auto">
              🔄
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-[#3C2923]">
                Konfirmasi Pemulihan Rekapan
              </h3>
              <p className="text-xs text-[#7A6B63]">
                Pulihkan rekapan transaksi <strong className="text-[#3C2923]">{pulihkanModal.transaksiId}</strong> ({pulihkanModal.pesananId} - {pulihkanModal.pelanggan})?
              </p>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-[11px] text-green-800 space-y-1">
              <p className="font-bold">Informasi Pemulihan:</p>
              <p>
                Baris rekapan ini akan kembali dimasukkan ke laporan penjualan aktif dan dihitung dalam ringkasan total omzet toko.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setPulihkanModal({
                    open: false,
                    transaksiId: "",
                    pesananId: "",
                    pelanggan: "",
                    loading: false,
                  })
                }
                disabled={pulihkanModal.loading}
                className="flex-1 py-2.5 bg-[#F4EBE1] text-[#6D5D55] font-bold rounded-xl text-xs hover:bg-[#EADBCC] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePulihkanRekap}
                disabled={pulihkanModal.loading}
                className="flex-1 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {pulihkanModal.loading ? "Memproses..." : "Ya, Pulihkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
