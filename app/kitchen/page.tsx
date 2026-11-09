"use client";

import React, { useState, useEffect } from "react";
import { logoutClient } from "@/lib/client-auth";

interface AntreanDapur {
  id: string;
  pelanggan: string;
  items: string;
  status: "Perlu Estimasi" | "Diproses" | "Siap Diambil" | "Selesai";
  estimasi: string;
  waktuMasuk: string;
}

interface PersediaanItem {
  id: string;
  menuId: string;
  nama: string;
  stok: number;
  kategori: string;
}

export default function KitchenPage() {
  const [activeTab, setActiveTab] = useState<"antrian" | "persediaan">("antrian");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [refreshKey, setRefreshKey] = useState(0);

  // State Antrean Masak
  const [antrean, setAntrean] = useState<AntreanDapur[]>([]);

  // State Persediaan Stok
  const [persediaan, setPersediaan] = useState<PersediaanItem[]>([]);

  // Modal Estimasi Waktu (Use Case 3)
  const [estimasiModal, setEstimasiModal] = useState<{ open: boolean; pesananId: string }>({
    open: false,
    pesananId: "",
  });
  const [inputEstimasi, setInputEstimasi] = useState("15");

  useEffect(() => {
    let isCancelled = false;

    const loadKitchenData = async () => {
      try {
        const [resAntrean, resPersediaan] = await Promise.all([
          fetch("/api/kitchen/antrean"),
          fetch("/api/kitchen/persediaan"),
        ]);

        if (!isCancelled && resAntrean.ok) {
          const dataAntrean = await resAntrean.json();
          if (dataAntrean.antrean && Array.isArray(dataAntrean.antrean)) {
            interface RawAntrean {
              id_pesanan: string;
              pelanggan?: { nama: string };
              detail_pesanan?: {
                jumlah_pesanan: number;
                menu?: { nama_menu: string };
              }[];
              status_pesanan: string;
              estimasi_selesai?: string | null;
              waktu_pesanan: string;
            }

            const mapped: AntreanDapur[] = dataAntrean.antrean.map((a: RawAntrean) => {
              const itemsDesc = (a.detail_pesanan || [])
                .map((d) => `${d.jumlah_pesanan}x ${d.menu?.nama_menu || "Donat"}`)
                .join(", ");

              const waktuMasukStr = a.waktu_pesanan
                ? new Date(a.waktu_pesanan).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) + " WIB"
                : "-";

              let uiStatus: "Perlu Estimasi" | "Diproses" | "Siap Diambil" | "Selesai" = "Perlu Estimasi";
              let estimasiStr = "-";

              if (a.status_pesanan === "Siap Diambil") {
                uiStatus = "Siap Diambil";
                estimasiStr = "Selesai dimasak";
              } else if (a.status_pesanan === "Selesai") {
                uiStatus = "Selesai";
                estimasiStr = "Selesai";
              } else if (a.estimasi_selesai) {
                uiStatus = "Diproses";
                estimasiStr = new Date(a.estimasi_selesai).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " WIB";
              } else {
                uiStatus = "Perlu Estimasi";
                estimasiStr = "-";
              }

              return {
                id: a.id_pesanan,
                pelanggan: a.pelanggan?.nama || "Pelanggan",
                items: itemsDesc || "-",
                status: uiStatus,
                estimasi: estimasiStr,
                waktuMasuk: waktuMasukStr,
              };
            });

            setAntrean(mapped);
          }
        }

        if (!isCancelled && resPersediaan.ok) {
          const dataStok = await resPersediaan.json();
          if (dataStok.persediaan && Array.isArray(dataStok.persediaan)) {
            const mappedStok: PersediaanItem[] = dataStok.persediaan.map((p: {
              id_persediaan: string;
              id_menu: string;
              nama_menu: string;
              kategori_menu: string;
              jumlah_persediaan: number;
            }) => ({
              id: p.id_persediaan,
              menuId: p.id_menu,
              nama: p.nama_menu,
              kategori: p.kategori_menu,
              stok: p.jumlah_persediaan,
            }));
            setPersediaan(mappedStok);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data dapur:", err);
      }
    };

    loadKitchenData();

    return () => {
      isCancelled = true;
    };
  }, [refreshKey]);

  const handleSimpanEstimasi = async () => {
    const menit = parseInt(inputEstimasi.replace(/\D/g, ""), 10) || 15;

    try {
      const res = await fetch(`/api/pesanan/${estimasiModal.pesananId}/estimasi`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimasi_menit: menit }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyimpan estimasi.");
        return;
      }

      setEstimasiModal({ open: false, pesananId: "" });
      setRefreshKey((k) => k + 1);
      alert(data.message || `Estimasi ${menit} menit berhasil disimpan!`);
    } catch {
      alert("Terjadi kesalahan jaringan saat mengirim estimasi waktu.");
    }
  };

  const handleKonfirmasiSiapDiambil = async (id: string) => {
    try {
      const res = await fetch(`/api/pesanan/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Siap Diambil" }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal memperbarui status pesanan.");
        return;
      }

      setRefreshKey((k) => k + 1);
      alert(data.message || `Pesanan ${id} siap diambil! Stok telah dipotong.`);
    } catch {
      alert("Terjadi kesalahan jaringan saat memperbarui status pesanan.");
    }
  };

  const updateStok = async (id: string, delta: number) => {
    const item = persediaan.find((p) => p.id === id);
    if (!item) return;

    const newStok = Math.max(0, item.stok + delta);

    try {
      const res = await fetch(`/api/kitchen/persediaan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jumlah_persediaan: newStok }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal memperbarui persediaan.");
        return;
      }

      setRefreshKey((k) => k + 1);
    } catch {
      alert("Terjadi kesalahan jaringan saat memperbarui persediaan.");
    }
  };

  const filteredAntrean = antrean.filter((a) => {
    if (filterStatus === "Semua") return true;
    return a.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C2923] flex flex-col">
      {/* Header Kitchen Dapur Sesuai Desain Figma (Frame 438:6143) */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EFE5D8] px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#DE7525] to-[#F8A106] flex items-center justify-center text-xl text-white shadow-md">
              🍳
            </div>
            <div>
              <h1 className="text-base font-black text-[#3C2923] tracking-tight">
                DAPUR HABIL DONUTS
              </h1>
              <span className="text-[10px] font-bold text-[#DE7525] uppercase tracking-wider block">
                Panel Kitchen &amp; Antrean Masak
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F4EBE1] p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab("antrian")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === "antrian" ? "bg-white text-[#DE7525] shadow-sm" : "text-[#635147]"
              }`}
            >
              <span>Antrian Masak</span>
              <span className="bg-[#DE7525] text-white text-[10px] px-2 py-0.5 rounded-full">
                {antrean.filter((a) => a.status !== "Selesai").length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("persediaan")}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === "persediaan" ? "bg-white text-[#DE7525] shadow-sm" : "text-[#635147]"
              }`}
            >
              Kelola Persediaan
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right text-xs">
              <span className="font-bold text-[#3C2923] block">Chef Daniel</span>
              <span className="text-[10px] text-green-700 font-bold">Dapur Standby</span>
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

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        {activeTab === "antrian" ? (
          <div className="space-y-6">
            {/* Banner Keterangan Sesuai Figma */}
            <div className="bg-[#FFF4E2] border border-[#F3DFC1] rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#77431D]">
                  Antrean Masak Donat
                </span>
                <p className="text-xs text-[#7A6B63] mt-0.5 font-medium">
                  Hanya pesanan dengan <strong>pembayaran valid</strong> dari Kasir yang masuk ke antrean ini.
                </p>
              </div>

              {/* Filter Tabs Status */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {(["Semua", "Perlu Estimasi", "Diproses", "Siap Diambil"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      filterStatus === st
                        ? "bg-[#DE7525] text-white shadow-sm"
                        : "bg-white border border-[#EADBCC] text-[#635147] hover:bg-[#F2E5D6]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List Antrean Masak */}
            <div className="grid gap-4">
              {filteredAntrean.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2E7DC] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-[#DE7525] bg-[#FFF0D0] px-3 py-1 rounded-xl">
                        {a.id}
                      </span>
                      <div>
                        <span className="font-extrabold text-sm text-[#3C2923]">
                          Pemesan: {a.pelanggan}
                        </span>
                        <span className="text-xs text-[#8C7A70] block">
                          Waktu Masuk: {a.waktuMasuk}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        a.status === "Siap Diambil"
                          ? "bg-green-100 text-green-700"
                          : a.status === "Diproses"
                          ? "bg-orange-100 text-orange-700 animate-pulse"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#9C897D] block mb-1">Menu Donat yang Dibuat:</span>
                      <p className="font-bold text-sm text-[#3C2923]">{a.items}</p>
                    </div>

                    <div>
                      <span className="text-[#9C897D] block mb-1">Estimasi Waktu Penyelesaian:</span>
                      <p className="font-black text-sm text-[#DE7525]">
                        {a.estimasi !== "-" ? a.estimasi : "Belum diinput"}
                      </p>
                    </div>
                  </div>

                  {/* Aksi Kitchen Sesuai Use Case */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#F5ECE0]">
                    {a.status === "Perlu Estimasi" && (
                      <button
                        onClick={() => setEstimasiModal({ open: true, pesananId: a.id })}
                        className="px-4 py-2 bg-gradient-to-r from-[#F8A106] to-[#DE7525] hover:from-[#E69300] hover:to-[#C6651E] text-white font-bold rounded-xl text-xs shadow-sm"
                      >
                        ⏱️ Kirim Estimasi Waktu
                      </button>
                    )}

                    {a.status === "Diproses" && (
                      <button
                        onClick={() => handleKonfirmasiSiapDiambil(a.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-sm"
                      >
                        ✓ Konfirmasi Pesanan Selesai (Siap Diambil)
                      </button>
                    )}

                    {a.status === "Siap Diambil" && (
                      <span className="text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                        Donat Siap di Meja Pengambilan (Kasir)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tab Kelola Persediaan (Stok) */
          <div className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#3C2923]">
                Kelola Ketersediaan Menu &amp; Stok Donat
              </h2>
              <p className="text-xs text-[#7A6B63] mt-1">
                Kitchen berwenang memantau dan mengubah jumlah ketersediaan donat siap saji
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF4ED] text-[#77431D] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">ID Persediaan</th>
                    <th className="p-3.5">Nama Menu</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5 text-center">Jumlah Stok</th>
                    <th className="p-3.5 text-center rounded-r-xl">Aksi Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E5D6]">
                  {persediaan.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FCFAF6] transition">
                      <td className="p-3.5 font-mono font-bold text-[#8C7A70]">{p.id}</td>
                      <td className="p-3.5 font-extrabold text-[#3C2923]">{p.nama}</td>
                      <td className="p-3.5 text-[#7A6B63]">{p.kategori}</td>
                      <td className="p-3.5 text-center">
                        <span className="font-black text-sm text-[#F8A106] bg-[#FFF0D0] px-3 py-1 rounded-xl">
                          {p.stok} pcs
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-[#F4EBE1] p-1 rounded-xl">
                          <button
                            onClick={() => updateStok(p.id, -5)}
                            className="w-7 h-7 bg-white rounded-lg font-black hover:bg-red-50 text-red-600 shadow-sm"
                            title="Kurang 5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => updateStok(p.id, 5)}
                            className="w-7 h-7 bg-[#DE7525] rounded-lg font-black text-white hover:bg-[#C6651E] shadow-sm"
                            title="Tambah 5"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Input Estimasi Waktu */}
      {estimasiModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EFE5D8] shadow-2xl space-y-4">
            <h3 className="font-black text-base text-[#3C2923]">
              Kirim Estimasi Waktu Pengerjaan
            </h3>
            <p className="text-xs text-[#7A6B63]">
              Pesanan: <strong>{estimasiModal.pesananId}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#6D5D55] mb-1">
                Pilih atau Tuliskan Estimasi:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["10 Menit", "15 Menit", "25 Menit"].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setInputEstimasi(w)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      inputEstimasi === w
                        ? "bg-[#FFF0D0] border-[#DE7525] text-[#DE7525]"
                        : "bg-white border-[#E5DACD] text-[#635147]"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={inputEstimasi}
                onChange={(e) => setInputEstimasi(e.target.value)}
                placeholder="Contoh: 15 Menit (10:35 WIB)"
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] text-xs focus:ring-2 focus:ring-[#DE7525] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEstimasiModal({ open: false, pesananId: "" })}
                className="flex-1 py-2 bg-[#F4EBE1] text-[#6D5D55] font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSimpanEstimasi}
                className="flex-1 py-2 bg-[#DE7525] text-white font-bold rounded-xl text-xs shadow-sm hover:bg-[#C6651E]"
              >
                Kirim Estimasi &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
