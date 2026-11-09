# Ringkasan Implementasi Sistem Informasi Penjualan Toko Donat Habil
**Tugas Modul 4 APSI - Laboratorium Sistem Informasi & Komputasi (LSIK) Universitas Andalas**

---

## 1. Ikhtisar Proyek

Sistem Informasi Penjualan Toko Donat Habil adalah aplikasi berbasis web modern yang dibangun untuk mendigitalkan seluruh siklus penjualan dan operasional produksi donat, mulai dari pemesanan mandiri oleh pelanggan, verifikasi pembayaran oleh kasir, antrean pembuatan di dapur (*kitchen*), hingga pemantauan pendapatan (*revenue monitoring*) oleh pemilik toko (*owner*).

Sistem ini menerapkan arsitektur **Role-Based Access Control (RBAC)** dengan 4 peran pengguna:
1. **Pelanggan**: Melakukan pemesanan donat mandiri/online, memilih metode pembayaran (QRIS/Tunai), mengunggah bukti bayar, memantau status pesanan realtime, dan mengirim ulasan.
2. **Kasir**: Menerima pesanan masuk, memvalidasi keabsahan bukti bayar pelanggan (Valid / Tidak Valid), meneruskan pesanan ke antrean dapur, menyerahkan donat, dan mencetak struk fisik.
3. **Kitchen**: Menerima antrean donat yang valid bayar, menginput estimasi waktu pengerjaan, memasak donat, mengonfirmasi donat siap diambil (dengan pengurangan stok otomatis), dan mengelola persediaan.
4. **Owner**: Memantau laporan kinerja transaksi, omzet pendapatan toko per periode (Hari ini, Minggu ini, Bulan ini), donat terlaris, serta umpan balik kritik dan saran dari pembeli.

---

## 2. Tech Stack & Arsitektur

- **Frontend & Server**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS.
- **Basis Data**: PostgreSQL 18 (Docker lokal untuk pengembangan, Neon PostgreSQL untuk cloud production).
- **ORM & Data Layer**: Prisma ORM v7 dengan adapter `@prisma/adapter-pg` dan model type-safe di `generated/prisma/client`.
- **Autentikasi & Keamanan**:
  - Hashing sandi menggunakan `bcryptjs` (salt rounds 10).
  - Manajemen sesi menggunakan token digital **HMAC-SHA256** pada cookie HTTP-only berdurasi 8 jam (`SameSite=Lax`, path `/`).
  - Proteksi navigasi halaman multi-role menggunakan konvensi Next.js 16 [`proxy.ts`](file:///home/habib/Projects/web-app/proxy.ts).
  - Helper otorisasi sisi server [`lib/auth.ts`](file:///home/habib/Projects/web-app/lib/auth.ts) pada setiap endpoint API.
- **Desain Antarmuka**: 100% patuh pada prototype Figma UI Design 5C (`caQFfrAJEQnq4kpMGPWs3Y`) dengan token palet warna:
  - Warm Amber: `#F8A106`
  - Chocolate Brown: `#3C2923`
  - Soft Vanilla Cream: `#FAF7F2`

---

## 3. Skema Basis Data 3NF (12 Tabel)

Basis data telah memenuhi bentuk normal ketiga (3NF) sesuai *Final ERD* dengan sumber kebenaran pada file [`db/schema.sql`](file:///home/habib/Projects/web-app/db/schema.sql):

1. `akun`: Menyimpan kredensial (`id_akun`, `username`, `password_hash`, `role`).
2. `pelanggan`: Profil pembeli donat (`id_pelanggan`, `id_akun`, `nama`, `tanggal_lahir`, `no_telepon`, `email`, `alamat`, `kode_pos`).
3. `kasir`: Data petugas kasir (`id_kasir`, `id_akun`, `nama_kasir`, ...).
4. `kitchen`: Data koki/staf dapur (`id_kitchen`, `id_akun`, `nama_kitchen`, ...).
5. `owner`: Data pemilik usaha (`id_owner`, `id_akun`, `nama_owner`).
6. `menu`: Daftar varian donat (`id_menu`, `nama_menu`, `kategori_menu`, `harga_satuan`).
7. `persediaan`: Ketersediaan stok donat (`id_persediaan`, `id_menu`, `jumlah_persediaan`).
8. `pesanan`: Header pemesanan (`id_pesanan`, `id_pelanggan`, `id_kasir`, `id_kitchen`, `tanggal_pesanan`, `waktu_pesanan`, `status_pesanan`, `estimasi_selesai`, `waktu_selesai`).
9. `detail_pesanan`: Item pesanan donat (`id_pesanan`, `id_menu`, `jumlah_pesanan`, `harga_satuan`, `subtotal`).
10. `transaksi`: Pembayaran (`id_transaksi`, `id_pesanan`, `id_kasir`, `waktu_transaksi`, `total_transaksi`, `metode_pembayaran`, `status_pembayaran`, `bukti_pembayaran`).
11. `riwayat_status_pesanan`: Log audit perubahan status pesanan (`id_riwayat_pesanan`, `id_pesanan`, `status_pesanan`, `waktu_update`).
12. `ulasan`: Umpan balik pelanggan (`id_ulasan`, `id_pesanan`, `kritik_pelanggan`, `saran_pelanggan`).

---

## 4. Rincian Pengerjaan Seluruh Fase

| Fase | Deskripsi Pekerjaan | Hasil / Status |
|---|---|---|
| **Fase 0** | Audit repositori & penyusunan rencana eksekusi komprehensif | Dokumen [`docs/EXECUTION_PLAN.md`](file:///home/habib/Projects/web-app/docs/EXECUTION_PLAN.md) |
| **Fase 1** | Pembersihan scaffold `User`, migrasi usang, pembuatan `.env.example`, README, dan script build | Commit `49b83e6` |
| **Fase 2** | Autentikasi session cookie HMAC-SHA256, registrasi pelanggan, dan proteksi rute `proxy.ts` | Commit `d64aa48` |
| **Fase 3** | Implementasi UC1 Pelanggan (katalog donat, pesanan QRIS/Tunai, upload bukti, ulasan) | Commit `8897e32` |
| **Fase 4** | Implementasi UC2 Kasir (validasi bayar, serahkan pesanan, cetak struk, rekapitulasi shift) | Commit `425d120` |
| **Fase 5** | Implementasi UC3 Kitchen (antrean masak FIFO, estimasi waktu, siap diambil + potong stok otomatis, kelola persediaan) | Commit `0697829` |
| **Fase 6** | Fitur pendukung Owner (laporan omzet, pesanan terlaris, filter periode, kritik saran) | Commit `30cf3b5` |
| **Fase 7** | Skrip verifikasi akses [`scripts/verify-access.mjs`](file:///home/habib/Projects/web-app/scripts/verify-access.mjs) & Black Box Testing [`docs/test-case.md`](file:///home/habib/Projects/web-app/docs/test-case.md) (29 skenario) | Commit `dc9f2e3` |
| **Fase 8** | Pembaruan catatan prompt CFC dan dokumentasi arsitektur di [`AGENTS.md`](file:///home/habib/Projects/web-app/AGENTS.md) | Commit `f163b44` |
| **Fase 9** | Skrip seed cloud [`db/seed.sql`](file:///home/habib/Projects/web-app/db/seed.sql), panduan deployment [`docs/deployment.md`](file:///home/habib/Projects/web-app/docs/deployment.md), dan verifikasi build produksi bersih | Selesai |

---

## 5. Akun Pengguna Demo

| Role | Username | Password Demo | Kegunaan Uji |
|---|---|---|---|
| **Pelanggan** | `adzra` | *(password dipegang pemilik project, tidak disimpan di repo)* | Uji katalog, pemesanan donat, upload bukti transfer QRIS, & ulasan |
| **Kasir** | `aidil` | *(password dipegang pemilik project, tidak disimpan di repo)* | Uji validasi pembayaran pelanggan, serahkan pesanan, cetak struk |
| **Kitchen** | `daniel` | *(password dipegang pemilik project, tidak disimpan di repo)* | Uji penerimaan antrean masak, input estimasi waktu, & potong stok |
| **Owner** | `owner` | *(password dipegang pemilik project, tidak disimpan di repo)* | Uji visualisasi laporan omzet, donat terlaris, & rekapitulasi penjualan |
