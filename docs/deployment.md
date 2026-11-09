# Panduan Deployment Neon PostgreSQL & Vercel

Dokumen ini memandu langkah demi langkah peluncuran (*deployment*) Sistem Informasi Penjualan Toko Donat Habil ke cloud platform **Neon** (Database) dan **Vercel** (Serverless Web App).

---

## 1. Setup Database Cloud di Neon

1. Kunjungi [neon.tech](https://neon.tech) dan login dengan akun GitHub Anda.
2. Buat proyek baru dengan nama: `web-app-db` (Region: Singapore `ap-southeast-1` untuk latensi tercepat ke Indonesia).
3. Salin **Connection String** yang disediakan Neon. Formatnya:
   ```text
   postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
   ```
4. Buka menu **SQL Editor** pada dashboard Neon, buka file [`db/schema.sql`](file:///home/habib/Projects/web-app/db/schema.sql) dari repositori ini, salin seluruh isi DDL (bagian pembuatan 12 tabel), lalu klik **Run**.
5. Buka file [`db/seed.sql`](file:///home/habib/Projects/web-app/db/seed.sql), salin seluruh isi query INSERT, lalu klik **Run** di SQL Editor Neon untuk mengisi data awal (akun demo, menu, persediaan).

---

## 2. Setup Deployment di Vercel

1. Kunjungi [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** > **Project**, lalu pilih repositori `web-app` (atau nama repositori yang Anda gunakan).
3. Pada pengaturan konfigurasi proyek:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build` *(otomatis terdeteksi dari package.json)*
   - **Output Directory**: `.next`
4. Buka bagian **Environment Variables** dan tambahkan dua variabel wajib berikut:

| Key | Value / Contoh | Deskripsi |
|---|---|---|
| `DATABASE_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Connection string PostgreSQL Neon Anda |
| `SESSION_SECRET` | *(hasil generate string acak min 32 char)* | Kunci HMAC-SHA256 penandatangan cookie sesi |

> [!TIP]
> Anda dapat menghasilkan `SESSION_SECRET` yang aman melalui terminal dengan menjalankan:
> ```bash
> openssl rand -base64 32
> ```

5. Klik tombol **Deploy**.
6. Tunggu proses build selesai (~1-2 menit). Vercel akan memberikan domain aktif (misal: `https://web-app-xxxx.vercel.app`).

---

## 3. Uji Asap (*Smoke Test*) Pasca Deployment

Setelah deployment sukses, lakukan pengujian cepat pada domain produksi:

1. **Halaman Publik**:
   - Buka URL utama `/` &rarr; Landing page Donat Habil terbuka.
   - Buka `/login` &rarr; Form login muncul.
2. **Login & RBAC**:
   - Klik kartu cepat demo **Pelanggan** (`adzra` / `Adzra_123`) &rarr; Dashboard `/pelanggan` terbuka, katalog donat tampil dengan stok dari Neon.
   - Logout, lalu login sebagai **Kasir** (`aidil` / `Aidil@Kasa1`) &rarr; Dashboard `/kasir` terbuka, daftar pesanan tampil.
   - Logout, lalu login sebagai **Kitchen** (`daniel` / `Danil1_Kitchen`) &rarr; Dashboard `/kitchen` terbuka, antrean masak tampil.
   - Logout, lalu login sebagai **Owner** (`owner` / `Owner_123`) &rarr; Dashboard `/owner` terbuka, grafik omzet dan laporan tampil.
3. **Pemesanan End-to-End**:
   - Login sebagai pelanggan, buat pesanan donat baru.
   - Login sebagai kasir, lakukan validasi pembayaran.
   - Login sebagai kitchen, input estimasi waktu dan konfirmasi siap diambil.
   - Login sebagai kasir, klik serahkan donat.
   - Login sebagai pelanggan, beri ulasan.
   - Cek dashboard owner untuk memastikan omzet dan ulasan terupdate.
