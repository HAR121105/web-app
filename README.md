# Sistem Informasi Penjualan Toko Donat Habil

Aplikasi web sistem informasi penjualan dan pemantauan produksi donat untuk Toko Donat Habil, dikembangkan sebagai tugas praktikum **Modul 4 APSI (Analisis dan Perancangan Sistem Informasi)** di Laboratorium Sistem Informasi dan Keputusan (LSIK), Departemen Teknik Industri, Fakultas Teknik, Universitas Andalas.

---

## 🍩 Gambaran Sistem

Sistem ini mendukung otomatisasi alur pemesanan donat secara multi-role, meliputi:
1. **Pelanggan**: Melakukan pemesanan mandiri/online, memilih metode pembayaran (QRIS/Tunai), mengunggah bukti transfer, memantau tahapan antrean dapur, dan memberikan ulasan/kritik saran.
2. **Kasir**: Menerima pesanan masuk, memvalidasi bukti pembayaran pelanggan (**Valid** / **Tidak Valid**), meneruskan pesanan valid ke antrean dapur (*Kitchen*), serta mencetak struk transaksi.
3. **Kitchen (Dapur)**: Menerima antrean pengerjaan pesanan yang telah valid bayar, menginput estimasi waktu pengerjaan donat, memproses pembuatan donat, mengonfirmasi pesanan selesai (siap diambil), serta mengelola ketersediaan stok donat.
4. **Owner**: Memantau dashboard ringkasan transaksi, rekap pendapatan/omzet per periode (hari ini, minggu ini, bulan ini), dan kepuasan pelanggan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router) + [React](https://react.dev)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (Palet Warm Amber `#F8A106`, Chocolate `#3C2923`, Vanilla Cream `#FAF7F2`)
- **Basis Data**: PostgreSQL 18 (Docker container untuk lokal, Neon untuk cloud production)
- **ORM & Data Layer**: [Prisma ORM](https://www.prisma.io) dengan `@prisma/adapter-pg`
- **Keamanan**: Hash password dengan `bcryptjs` (salt 10), Session cookie bertanda tangan HMAC-SHA256
- **Deployment Target**: [Vercel](https://vercel.com)

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal

### 1. Prasyarat
- Node.js (v20+) dan npm
- Docker Desktop / Docker Engine aktif

### 2. Langkah Instalasi & Menjalankan

1. **Clone repository dan install dependensi**:
   ```bash
   git clone https://github.com/HAR121105/web-app.git
   cd web-app
   npm install
   ```

2. **Jalankan container PostgreSQL lokal**:
   ```bash
   docker compose up -d
   ```

3. **Konfigurasi Environment Variables**:
   Salin template `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *Catatan: Isi `SESSION_SECRET` dengan string acak (misal: `openssl rand -base64 32`).*

4. **Inisialisasi Skema & Data Awal Basis Data**:
   Impor file `db/schema.sql` ke dalam container:
   ```bash
   docker exec -i web-app-db psql -U habib -d web_app < db/schema.sql
   ```

5. **Generate Prisma Client**:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

6. **Jalankan Aplikasi Development Server**:
   ```bash
   npm run dev
   ```
   Buka peramban di **`http://localhost:3000`**.

---

## 👥 Akun Demo Sistem (Sesuai Role & Data Seed)

Gunakan username berikut di halaman `/login` (password dipegang pemilik project, tidak disimpan di repo):

| Role | Username Akun Demo | Hak Akses Utama |
|---|---|---|
| **Pelanggan** | `adzra`, `asqa`, `habiib`, `arya` | Katalog menu, checkout, bayar QRIS/Tunai, pantau status, ulasan |
| **Kasir** | `aidil`, `aini` | Validasi bukti bayar, konfirmasi pesanan masuk, cetak struk |
| **Kitchen** | `daniel`, `mia` | Antrean masak, input estimasi waktu, update status pengerjaan, stok |
| **Owner** | `owner` | Ringkasan omzet, rekap transaksi penjualan, kritik & saran |

---

## 🧪 Perintah Pengujian & Verifikasi

- `npm run lint` &rarr; Cek linting kode Next.js
- `npx tsc --noEmit` &rarr; Cek validitas tipe data TypeScript
- `npm run build` &rarr; Uji kompilasi produksi (termasuk `prisma generate`)
- `npx prisma studio` &rarr; Buka GUI penjelajah database di `http://localhost:5555`
