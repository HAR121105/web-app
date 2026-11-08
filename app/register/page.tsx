"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    tanggalLahir: "",
    noTelepon: "",
    email: "",
    alamat: "",
    kodePos: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9E8] via-[#FDF5E6] to-[#F5ECE0] p-4 text-[#3C2923]">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-[#F3E2CF] relative my-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#F8A106] to-[#FFCD2E] rounded-full shadow-md mb-3">
            <span className="text-3xl">🍩</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#3C2923]">
            Registrasi Akun Pelanggan
          </h1>
          <p className="text-xs text-[#7A6B63] mt-1">
            Daftarkan diri Anda untuk memesan donat lezat Habil Donuts
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold text-center">
            Pendaftaran berhasil! Mengarahkan ke halaman login...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#54443B] mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                name="nama"
                placeholder="Contoh: Budi Santoso"
                value={form.nama}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#54443B] mb-1">Tanggal Lahir</label>
              <input
                type="date"
                required
                name="tanggalLahir"
                value={form.tanggalLahir}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#54443B] mb-1">No. Telepon / WhatsApp</label>
              <input
                type="tel"
                required
                name="noTelepon"
                placeholder="08123456xxxx"
                value={form.noTelepon}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#54443B] mb-1">Email</label>
              <input
                type="email"
                required
                name="email"
                placeholder="budi@gmail.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[#54443B] mb-1">Alamat Lengkap</label>
              <input
                type="text"
                required
                name="alamat"
                placeholder="Jl. Melati No. 12, Padang"
                value={form.alamat}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#54443B] mb-1">Kode Pos</label>
              <input
                type="text"
                required
                name="kodePos"
                placeholder="25163"
                value={form.kodePos}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#F2E5D6]">
            <div>
              <label className="block text-[#54443B] mb-1">Username Baru</label>
              <input
                type="text"
                required
                name="username"
                placeholder="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#54443B] mb-1">Password</label>
              <input
                type="password"
                required
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DACD] bg-[#FCFBF8] focus:ring-2 focus:ring-[#F8A106] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-[#F8A106] to-[#EEA643] hover:from-[#E69300] hover:to-[#DE9332] text-white font-bold rounded-xl shadow-md shadow-[#F8A106]/20 transition active:scale-[0.98] text-sm"
          >
            {loading ? "Mendaftarkan Akun..." : "DAFTAR SEKARANG"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#7A6B63]">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#F8A106] font-bold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
