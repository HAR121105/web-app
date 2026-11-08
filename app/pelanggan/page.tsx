"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export default function PelangganPage() {
  const [activeTab, setActiveTab] = useState<"katalog" | "pesanan">("katalog");
  const [selectedKategori, setSelectedKategori] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Data Menu Donat
  const menuList = [
    {
      id: "MNU001",
      name: "Donat Gula Halus",
      kategori: "Donat Klasik",
      price: 4000,
      image: "🍩",
      desc: "Donat kentang tradisional dengan taburan gula halus salju premium yang manis lembut.",
      stok: 60,
    },
    {
      id: "MNU002",
      name: "Donat Cokelat Meses",
      kategori: "Donat Topping",
      price: 4000,
      image: "🍫",
      desc: "Balutan cokelat tebal nikmat bertabur butiran meses cokelat manis melimpah.",
      stok: 55,
    },
    {
      id: "MNU003",
      name: "Donat Keju",
      kategori: "Donat Topping",
      price: 5000,
      image: "🧀",
      desc: "Donat empuk gurih dengan parutan keju cheddar melimpah dan krim manis spesial.",
      stok: 48,
    },
  ];

  // State Keranjang
  const [cart, setCart] = useState<CartItem[]>([
    { id: "MNU001", name: "Donat Gula Halus", price: 4000, qty: 2, image: "🍩" },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [metodeBayar, setMetodeBayar] = useState<"QRIS" | "Tunai">("QRIS");
  const [buktiBayar, setBuktiBayar] = useState<string | null>(null);

  // State Pesanan Pelanggan (Data Awal Sesuai Modul 4)
  const [pesananList, setPesananList] = useState([
    {
      id: "PSN001",
      tanggal: "2026-11-01",
      waktu: "09:15",
      items: "2x Donat Gula Halus",
      total: 8000,
      metode: "QRIS",
      status: "Selesai",
      estimasi: "09:35",
      bukti: "/uploads/qris_psn001.png",
      ulasanAda: true,
    },
    {
      id: "PSN005",
      tanggal: "2026-11-08",
      waktu: "10:10",
      items: "2x Donat Gula Halus, 1x Donat Keju",
      total: 13000,
      metode: "QRIS",
      status: "Menunggu Validasi",
      estimasi: "Menunggu Kasir...",
      bukti: "bukti_transfer_sample.png",
      ulasanAda: false,
    },
  ]);

  // Modal Ulasan
  const [ulasanModal, setUlasanModal] = useState<{ open: boolean; pesananId: string }>({
    open: false,
    pesananId: "",
  });
  const [kritik, setKritik] = useState("");
  const [saran, setSaran] = useState("");

  const addToCart = (menu: typeof menuList[0]) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === menu.id);
      if (exists) {
        return prev.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: menu.id, name: menu.name, price: menu.price, qty: 1, image: menu.image }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCart = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);

  const handleKirimPesanan = () => {
    if (cart.length === 0) return;
    const newId = `PSN00${pesananList.length + 1}`;
    const itemsDesc = cart.map((c) => `${c.qty}x ${c.name}`).join(", ");

    const newPesanan = {
      id: newId,
      tanggal: "2026-11-08",
      waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      items: itemsDesc,
      total: totalCart,
      metode: metodeBayar,
      status: "Menunggu Validasi",
      estimasi: "Menunggu Kasir...",
      bukti: buktiBayar || "bukti_bayar_mandiri.png",
      ulasanAda: false,
    };

    setPesananList([newPesanan, ...pesananList]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTab("pesanan");
    alert(`Pesanan ${newId} berhasil dibuat! Menunggu verifikasi pembayaran oleh Kasir.`);
  };

  const handleSimpanUlasan = () => {
    setPesananList((prev) =>
      prev.map((p) => (p.id === ulasanModal.pesananId ? { ...p, ulasanAda: true } : p))
    );
    setUlasanModal({ open: false, pesananId: "" });
    setKritik("");
    setSaran("");
    alert("Terima kasih atas ulasan dan kritik saran Anda!");
  };

  const filteredMenu = menuList.filter((m) => {
    const matchCat = selectedKategori === "Semua" || m.kategori === selectedKategori;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C2923] flex flex-col">
      {/* Header Pelanggan Sesuai Desain Figma */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE5D8] px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F8A106] flex items-center justify-center text-lg shadow-sm">
              🍩
            </div>
            <span className="font-black text-lg text-[#3C2923] tracking-tight">
              donat habil.
            </span>
          </Link>

          {/* Navigation Auto Layout */}
          <div className="flex items-center gap-1 bg-[#F2E8DC] p-1 rounded-2xl text-xs font-bold text-[#5C4A40]">
            <button
              onClick={() => setActiveTab("katalog")}
              className={`px-4 py-2 rounded-xl transition ${
                activeTab === "katalog" ? "bg-white text-[#F8A106] shadow-sm" : "hover:text-[#F8A106]"
              }`}
            >
              Katalog Menu
            </button>
            <button
              onClick={() => setActiveTab("pesanan")}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === "pesanan" ? "bg-white text-[#F8A106] shadow-sm" : "hover:text-[#F8A106]"
              }`}
            >
              <span>Pesanan Saya</span>
              {pesananList.some((p) => p.status === "Menunggu Validasi" || p.status === "Diproses Kitchen") && (
                <span className="w-2 h-2 rounded-full bg-[#F8A106] animate-ping" />
              )}
            </button>
          </div>

          {/* Keranjang & Profil */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-white border border-[#E8DACB] rounded-2xl hover:border-[#F8A106] transition flex items-center gap-2 text-xs font-bold"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Keranjang</span>
              {cart.length > 0 && (
                <span className="bg-[#F8A106] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </button>
            <Link
              href="/login"
              className="text-xs font-semibold text-[#8C6D58] hover:text-[#3C2923] px-2 py-1"
            >
              Keluar
            </Link>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        {activeTab === "katalog" ? (
          <div>
            {/* Banner Selamat Datang */}
            <div className="bg-gradient-to-r from-[#FFF0D0] via-[#FEE8B7] to-[#FCD88D] rounded-3xl p-6 md:p-8 mb-8 border border-[#FAD692] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#77431D]">
                  Halo, Selamat Menikmati!
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-[#3C2923] mt-1">
                  Pilih Donat Favoritmu Hari Ini
                </h1>
                <p className="text-xs md:text-sm text-[#61453F] mt-1.5 max-w-lg">
                  Semua donat dibuat fresh setiap pagi dengan bahan berkualitas premium. Pesan sekarang dan ambil hangat-hangat!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="⌕ Cari donat favorit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#E2CEB9] text-xs focus:ring-2 focus:ring-[#F8A106] focus:outline-none w-56"
                />
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-2 mb-6">
              {(["Semua", "Donat Klasik", "Donat Topping"] as const).map((kategori) => (
                <button
                  key={kategori}
                  onClick={() => setSelectedKategori(kategori)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedKategori === kategori
                      ? "bg-[#3C2923] text-white shadow-sm"
                      : "bg-white border border-[#EADBCC] text-[#635147] hover:bg-[#F2E5D6]"
                  }`}
                >
                  {kategori}
                </button>
              ))}
            </div>

            {/* Grid Katalog Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-5 border border-[#EFE5D8] shadow-sm hover:shadow-md hover:border-[#F8A106] transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-full h-40 bg-gradient-to-br from-[#FFF9E8] to-[#FFF0D0] rounded-2xl flex items-center justify-center text-6xl shadow-inner mb-4 group-hover:scale-105 transition duration-200">
                      {m.image}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#9C7146] uppercase tracking-wider">
                        {m.kategori}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold">
                        Stok: {m.stok}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#3C2923] mt-1">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#7A6B63] mt-1.5 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#F2E7DC] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#9C897D] block">Harga</span>
                      <span className="text-base font-black text-[#F8A106]">
                        Rp{m.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(m)}
                      className="px-4 py-2 bg-[#F8A106] hover:bg-[#E69300] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
                    >
                      <span>+ Tambah</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tab Pesanan Saya */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#3C2923]">Pesanan Saya</h2>
              <p className="text-xs text-[#7A6B63] mt-1">
                Pantau status pembuatan donat di dapur dan riwayat pembayaran Anda
              </p>
            </div>

            <div className="space-y-4">
              {pesananList.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-6 border border-[#EFE5D8] shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2E7DC] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#3C2923]">{p.id}</span>
                        <span className="text-xs text-[#8C7A70]">&bull; {p.tanggal} ({p.waktu} WIB)</span>
                      </div>
                      <div className="text-xs text-[#77431D] font-semibold mt-0.5">
                        Metode: {p.metode}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          p.status === "Selesai"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Diproses Kitchen"
                            ? "bg-orange-100 text-orange-700"
                            : p.status === "Menunggu Validasi"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[#9C897D] block mb-1">Rincian Menu:</span>
                      <p className="font-semibold text-[#3C2923]">{p.items}</p>
                    </div>
                    <div>
                      <span className="text-[#9C897D] block mb-1">Estimasi Selesai (Kitchen):</span>
                      <p className="font-bold text-[#F8A106]">{p.estimasi}</p>
                    </div>
                    <div>
                      <span className="text-[#9C897D] block mb-1">Total Pembayaran:</span>
                      <p className="font-black text-sm text-[#3C2923]">
                        Rp{p.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Aksi Pelanggan */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F5ECE0]">
                    <div className="text-[11px] text-[#7A6B63]">
                      {p.status === "Menunggu Validasi" && "Mohon tunggu kasir memeriksa bukti bayar Anda."}
                      {p.status === "Diproses Kitchen" && "Dapur sedang membuat donat hangat Anda!"}
                      {p.status === "Selesai" && "Pesanan telah selesai diserahkan."}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.status === "Selesai" && !p.ulasanAda && (
                        <button
                          onClick={() => setUlasanModal({ open: true, pesananId: p.id })}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FFF0D0] text-[#77431D] hover:bg-[#FCE1AA] text-xs font-bold transition"
                        >
                          ⭐ Beri Ulasan
                        </button>
                      )}
                      {p.status === "Selesai" && p.ulasanAda && (
                        <span className="text-[11px] text-green-700 font-bold">
                          ✓ Ulasan Terkirim
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Drawer Keranjang */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-[#F0E4D5] pb-4 mb-4">
                <h3 className="font-extrabold text-lg text-[#3C2923]">Keranjang Belanja</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F4EBE1] flex items-center justify-center text-sm font-bold text-[#6D5D55]"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-[#9C897D]">
                  <span className="text-4xl block mb-2">🍩</span>
                  <p className="text-xs">Keranjang Anda masih kosong.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FCFAF6] border border-[#EFE5D8]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <div className="text-xs font-bold text-[#3C2923]">{item.name}</div>
                          <div className="text-[11px] text-[#F8A106] font-bold">
                            Rp{item.price.toLocaleString("id-ID")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-[#DDD] font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-extrabold w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#F8A106] text-white font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-[#F0E4D5] space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#6D5D55]">Total Tagihan:</span>
                  <span className="font-black text-lg text-[#F8A106]">
                    Rp{totalCart.toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3 bg-[#F8A106] hover:bg-[#E69300] text-white font-bold rounded-2xl shadow-md transition text-xs tracking-wider"
                >
                  LANJUT KE PEMBAYARAN &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Checkout & Upload Bukti Bayar */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EFE5D8] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0E4D5] pb-3">
              <h3 className="font-black text-base text-[#3C2923]">
                Penyelesaian Pesanan &amp; Pembayaran
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F4EBE1] flex items-center justify-center text-xs font-bold text-[#6D5D55]"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-[#6D5D55] font-semibold mb-1">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("QRIS")}
                    className={`p-3 rounded-2xl border text-center font-bold transition ${
                      metodeBayar === "QRIS"
                        ? "border-[#F8A106] bg-[#FFF0D0] text-[#77431D]"
                        : "border-[#E8DACB] bg-[#FCFAF6] text-[#6D5D55]"
                    }`}
                  >
                    💳 QRIS / Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("Tunai")}
                    className={`p-3 rounded-2xl border text-center font-bold transition ${
                      metodeBayar === "Tunai"
                        ? "border-[#F8A106] bg-[#FFF0D0] text-[#77431D]"
                        : "border-[#E8DACB] bg-[#FCFAF6] text-[#6D5D55]"
                    }`}
                  >
                    💵 Tunai di Kasir
                  </button>
                </div>
              </div>

              {metodeBayar === "QRIS" ? (
                <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#EFE5D8] text-center space-y-2">
                  <span className="text-[11px] font-bold text-[#77431D]">
                    Scan QRIS Donat Habil
                  </span>
                  <div className="w-36 h-36 mx-auto bg-white border border-[#DDD] rounded-xl flex items-center justify-center shadow-sm">
                    {/* QR Code Dummy */}
                    <div className="text-center">
                      <div className="text-3xl">📱</div>
                      <div className="text-[9px] font-mono mt-1">QRIS TOKO HABIL</div>
                      <div className="text-[10px] font-extrabold text-[#F8A106]">
                        Rp{totalCart.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#7A6B63] mb-1 font-semibold">
                      Unggah Bukti Bayar / Screenshot:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setBuktiBayar(e.target.files[0].name);
                        }
                      }}
                      className="text-xs text-[#6D5D55] file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#F8A106] file:text-white hover:file:bg-[#E69300]"
                    />
                    {buktiBayar && (
                      <p className="text-[10px] text-green-700 font-bold mt-1">
                        ✓ Terlampir: {buktiBayar}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#FFF9E8] border border-[#FAD692] rounded-xl text-xs text-[#77431D]">
                  Silakan siapkan uang pas sebesar <strong>Rp{totalCart.toLocaleString("id-ID")}</strong> untuk dibayarkan langsung ke kasir saat mengambil pesanan.
                </div>
              )}
            </div>

            <button
              onClick={handleKirimPesanan}
              className="w-full py-3 bg-[#F8A106] hover:bg-[#E69300] text-white font-bold rounded-2xl shadow-md transition text-xs tracking-wider"
            >
              KONFIRMASI &amp; BUAT PESANAN
            </button>
          </div>
        </div>
      )}

      {/* Modal Beri Ulasan */}
      {ulasanModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#EFE5D8] shadow-2xl space-y-4">
            <h3 className="font-black text-base text-[#3C2923]">
              Beri Ulasan ({ulasanModal.pesananId})
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6D5D55] font-semibold mb-1">
                  Kritik Pelanggan:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan hal yang kurang memuaskan..."
                  value={kritik}
                  onChange={(e) => setKritik(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DACB] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#6D5D55] font-semibold mb-1">
                  Saran untuk Toko Donat Habil:
                </label>
                <textarea
                  rows={2}
                  placeholder="Saran varian topping baru atau peningkatan..."
                  value={saran}
                  onChange={(e) => setSaran(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E8DACB] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUlasanModal({ open: false, pesananId: "" })}
                className="flex-1 py-2 bg-[#F4EBE1] text-[#6D5D55] font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSimpanUlasan}
                className="flex-1 py-2 bg-[#F8A106] text-white font-bold rounded-xl text-xs shadow-sm hover:bg-[#E69300]"
              >
                Kirim Ulasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
