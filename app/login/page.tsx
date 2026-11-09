"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("pelanggan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Silakan masukkan username dan password!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal masuk ke sistem.");
        setLoading(false);
        return;
      }

      // Simpan info user untuk kemudahan UI
      if (typeof window !== "undefined") {
        localStorage.setItem("user_session", JSON.stringify(data.user));
      }

      const targetRole = data.user.role;
      if (targetRole === "kasir") router.push("/kasir");
      else if (targetRole === "kitchen") router.push("/kitchen");
      else if (targetRole === "owner") router.push("/owner");
      else router.push("/pelanggan");
    } catch {
      setError("Terjadi kesalahan jaringan. Pastikan server aktif.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9E8] via-[#FDF5E6] to-[#F5ECE0] p-4 text-[#3C2923]">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-[#F3E2CF] relative overflow-hidden">
        {/* Ornamen Latar Belakang Hangat */}
        <div className="absolute -top-14 -right-14 w-36 h-36 bg-[#F8A106]/15 rounded-full blur-2xl" />
        <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-[#77431D]/10 rounded-full blur-2xl" />

        {/* Brand & Logo Donat */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-[#F8A106] to-[#FFCD2E] rounded-full shadow-lg mb-4 shadow-[#F8A106]/30">
            <span className="text-4xl" role="img" aria-label="donut">
              🍩
            </span>
          </div>
          <h2 className="text-sm font-semibold tracking-widest text-[#9C7146] uppercase">
            Selamat Datang di
          </h2>
          <h1 className="text-3xl font-extrabold text-[#3C2923] tracking-tight mt-1">
            Habil Donuts
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1">
            Sistem Informasi Penjualan &amp; Produksi Donat
          </p>
        </div>

        {/* Pesan Kesalahan */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0 fill-current text-red-500"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#54443B] mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9C897D]">
                👤
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] text-sm text-[#3C2923] placeholder-[#A8988C] focus:outline-none focus:ring-2 focus:ring-[#F8A106] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#54443B] mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9C897D]">
                🔒
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] text-sm text-[#3C2923] placeholder-[#A8988C] focus:outline-none focus:ring-2 focus:ring-[#F8A106] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#54443B] mb-1">
              Pilih Role Akses
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F4EBE1] rounded-xl text-xs font-medium text-[#54443B]">
              {(["pelanggan", "kasir", "kitchen", "owner"] as const).map(
                (r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 rounded-lg capitalize transition-all ${
                      role === r
                        ? "bg-white text-[#3C2923] font-bold shadow-sm"
                        : "text-[#7A6B63] hover:text-[#3C2923]"
                    }`}
                  >
                    {r}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#F8A106] to-[#EEA643] hover:from-[#E69300] hover:to-[#DE9332] text-white font-bold rounded-xl shadow-lg shadow-[#F8A106]/25 transition-all transform active:scale-[0.98] disabled:opacity-70 text-sm tracking-wide"
          >
            {loading ? "Memproses Masuk..." : "MASUK KE SISTEM"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#7A6B63]">
          Belum punya akun pelanggan?{" "}
          <Link
            href="/register"
            className="text-[#F8A106] font-bold hover:underline"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
