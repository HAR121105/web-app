# Rencana Eksekusi Sisa Progres Modul 4 APSI (Toko Donat Habil)

Dokumen ini memetakan seluruh tahapan pengerjaan Fase 0 hingga Fase 9 untuk penyelesaian tugas Modul 4 Sistem Informasi Penjualan Toko Donat Habil.

---

## 1. Checklist Fase Pengerjaan

- [x] **Fase 0: Audit Repo & Penyusunan Dokumen Rencana Eksekusi**
- [x] **Fase 1: Pembersihan Repo & Scaffold**
  - [x] Hapus tabel/model `User` scaffold bawaan create-next-app
  - [x] Hapus folder `prisma/migrations`
  - [x] Introspeksi ulang `npx prisma db pull` dan `npx prisma generate` (12 model murni)
  - [x] Buat file `.env.example`
  - [x] Perbarui `package.json` build script: `"prisma generate && next build"`
  - [x] Ganti `README.md` dengan dokumentasi resmi proyek dalam bahasa Indonesia
- [x] **Fase 2: Autentikasi Nyata & Otorisasi Role (RBAC)**
  - [x] `lib/session.ts`: Session cookie HMAC-SHA256 (WebCrypto `crypto.subtle`, httpOnly, sameSite lax, 8 jam)
  - [x] `lib/auth.ts`: Helper `getSession()` dan `requireRole(...roles)`
  - [x] `app/api/auth/login/route.ts`: Login bcryptjs dengan verifikasi role database
  - [x] `app/api/auth/register/route.ts`: Registrasi khusus pelanggan dengan `prisma.$transaction`
  - [x] `app/api/auth/me/route.ts` & `app/api/auth/logout/route.ts`
  - [x] `proxy.ts`: Proteksi rute per role (`/pelanggan`, `/kasir`, `/kitchen`, `/owner`)
  - [x] Hubungkan `app/login/page.tsx` & `app/register/page.tsx` ke API, tambah tombol logout di semua dashboard
- [x] **Fase 3: UC1 Pelanggan (Pemesanan, Pembayaran, Status, Ulasan)**
  - [x] `GET /api/menu`: Daftar menu + status ketersediaan stok
  - [x] `POST /api/pesanan`: Checkout pesanan, detail_pesanan, transaksi, dan riwayat dalam satu `prisma.$transaction`
  - [x] `GET /api/pesanan`: Riwayat pesanan milik pelanggan sendiri
  - [x] `POST /api/ulasan`: Form feedback ulasan setelah pesanan selesai
  - [x] Hubungkan `app/pelanggan/page.tsx` ke API dengan state loading & error
- [x] **Fase 4: UC2 Kasir (Validasi Pembayaran, Serahkan Pesanan, Cetak Struk, Rekap)**
  - [x] `GET /api/kasir/pesanan`: Mengambil semua pesanan masuk (dengan filter status)
  - [x] `PATCH /api/transaksi/[id]`: Aksi validasi bayar (`valid` / `tidak_valid`) & teruskan ke kitchen
  - [x] `PATCH /api/pesanan/[id]/serahkan`: Kasir menyerahkan donat yang berstatus siap diambil
  - [x] `GET /api/transaksi/[id]/struk`: Data struk transaksi untuk cetak fisik
  - [x] `GET /api/kasir/rekap`: Rekapitulasi transaksi shift kasir
  - [x] Hubungkan `app/kasir/page.tsx` ke API
- [x] **Fase 5: UC3 Kitchen (Antrean Masak, Estimasi Waktu, Update Status, Kelola Stok)**
  - [x] `GET /api/kitchen/antrean`: Pesanan berstatus pembayaran valid yang belum selesai
  - [x] `PATCH /api/pesanan/[id]/estimasi`: Input estimasi waktu selesai pengerjaan
  - [x] `PATCH /api/pesanan/[id]/status`: Update ke 'Diproses Kitchen' dan 'Siap Diambil' + pemotongan stok otomatis dalam transaksi
  - [x] `GET` & `PATCH /api/kitchen/persediaan`: Memantau dan mengubah jumlah stok donat
  - [x] Hubungkan `app/kitchen/page.tsx` ke API
- [x] **Fase 6: Fitur Pendukung Owner (Laporan & Pemantauan Omzet)**
  - [x] `GET /api/owner/laporan`: Agregasi omzet, total pesanan, transaksi, ulasan pelanggan (WIB / Asia/Jakarta)
  - [x] Hubungkan `app/owner/page.tsx` ke API
- [x] **Fase 7: Verifikasi Hak Akses & Black Box Testing**
  - [x] Skrip `scripts/verify-access.mjs` menguji kepatuhan Permission Matrix
  - [x] Dokumen Black Box Testing `docs/test-case.md` (minimal 25 test case)
  - [x] Uji fungsional end-to-end (Pelanggan -> Kasir -> Kitchen -> Kasir -> Ulasan -> Owner)
- [x] **Fase 8: Pembaruan Dokumentasi AGENTS.md**
  - [x] Catat prompt CFC untuk semua fase
  - [x] Struktur API & Business Rules
- [x] **Fase 9: Persiapan Deployment Neon & Vercel**
  - [x] `db/seed.sql` khusus seeding database cloud Neon
  - [x] Pastikan `lib/prisma.ts` kompatibel SSL Neon
  - [x] Verifikasi `npm run build` bersih
  - [x] `docs/deployment.md` & `docs/RINGKASAN-IMPLEMENTASI.md`

---

## 2. Pemetaan Alur Status Berdasarkan CHECK Constraint `db/schema.sql`

Nilai yang diizinkan pada CHECK constraint:
- `status_pesanan`: `'Menunggu Pembayaran'`, `'Menunggu Validasi'`, `'Pembayaran Tidak Valid'`, `'Diproses Kitchen'`, `'Siap Diambil'`, `'Selesai'`, `'Dibatalkan'`
- `status_pembayaran`: `'Menunggu Validasi'`, `'Berhasil'`, `'Tidak Valid'`

### Tabel Transisi Status:
| Peristiwa / Aksi | Status Pesanan Awal | Status Pesanan Baru | Status Bayar Baru | Aktor & Endpoint |
|---|---|---|---|---|
| Pelanggan Checkout Pesanan | *(Baru)* | `Menunggu Validasi` | `Menunggu Validasi` | Pelanggan (`POST /api/pesanan`) |
| Kasir Validasi Pembayaran: VALID | `Menunggu Validasi` | `Diproses Kitchen` | `Berhasil` | Kasir (`PATCH /api/transaksi/[id]`) |
| Kasir Validasi Pembayaran: TOLAK | `Menunggu Validasi` | `Pembayaran Tidak Valid` | `Tidak Valid` | Kasir (`PATCH /api/transaksi/[id]`) |
| Kitchen Mengirim Estimasi Waktu | `Diproses Kitchen` | `Diproses Kitchen` | `Berhasil` | Kitchen (`PATCH /api/pesanan/[id]/estimasi`) |
| Kitchen Selesai Memasak Donat | `Diproses Kitchen` | `Siap Diambil` | `Berhasil` *(Stok berkurang)* | Kitchen (`PATCH /api/pesanan/[id]/status`) |
| Kasir Menyerahkan Pesanan | `Siap Diambil` | `Selesai` | `Berhasil` | Kasir (`PATCH /api/pesanan/[id]/serahkan`) |
| Pelanggan Memberi Ulasan | `Selesai` | `Selesai` | `Berhasil` | Pelanggan (`POST /api/ulasan`) |

---

## 3. Daftar Endpoint API Rencana

| Method | Path | Role Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publik | Autentikasi akun via bcrypt & terbitkan cookie session |
| `POST` | `/api/auth/register` | Publik | Registrasi akun pelanggan baru |
| `GET` | `/api/auth/me` | Semua Role | Cek profil pengguna yang sedang login |
| `POST` | `/api/auth/logout` | Semua Role | Menghapus session cookie |
| `GET` | `/api/menu` | Publik/Pelanggan | Mengambil daftar donat dan ketersediaan stok |
| `POST` | `/api/pesanan` | Pelanggan | Membuat pesanan, detail, dan transaksi |
| `GET` | `/api/pesanan` | Pelanggan | Melihat riwayat pesanan milik sendiri |
| `POST` | `/api/ulasan` | Pelanggan | Mengirim ulasan untuk pesanan selesai |
| `GET` | `/api/kasir/pesanan` | Kasir | Menampilkan pesanan masuk |
| `PATCH`| `/api/transaksi/[id]` | Kasir | Menetapkan validasi bayar (Valid / Tidak Valid) |
| `PATCH`| `/api/pesanan/[id]/serahkan` | Kasir | Menyerahkan donat yang telah siap diambil |
| `GET` | `/api/transaksi/[id]/struk` | Kasir | Mengambil format data cetak struk |
| `GET` | `/api/kasir/rekap` | Kasir | Rekapitulasi transaksi shift kasir |
| `GET` | `/api/kitchen/antrean` | Kitchen | Antrean pengerjaan donat yang valid bayar |
| `PATCH`| `/api/pesanan/[id]/estimasi` | Kitchen | Menginput waktu estimasi penyelesaian |
| `PATCH`| `/api/pesanan/[id]/status` | Kitchen | Update status proses/selesai & potong persediaan |
| `GET` | `/api/kitchen/persediaan`| Kitchen | Daftar stok bahan/donat |
| `PATCH`| `/api/kitchen/persediaan/[id]`| Kitchen | Update jumlah ketersediaan donat |
| `GET` | `/api/owner/laporan` | Owner | Laporan transaksi dan omzet per periode |

---

## 4. Daftar Risiko & Mitigasi

1. **Risiko Penurunan Konsistensi Stok**:
   - *Mitigasi*: Pengurangan stok persediaan dilakukan dalam `prisma.$transaction` saat status pesanan diubah menjadi `Siap Diambil` (atau `Selesai`). Jika stok tidak mencukupi, transaksi digagalkan dan server mengembalikan status 400.
2. **Risiko Pemalsuan Harga dari Client**:
   - *Mitigasi*: Server selalu mengambil harga resmi dari tabel `menu` di database dan menghitung subtotal/total di server. Input harga dari client diabaikan total.
3. **Risiko Manipulasi Hak Akses (Privilege Escalation)**:
   - *Mitigasi*: Middleware dan helper `requireRole()` memverifikasi tanda tangan digital HMAC-SHA256 pada session cookie di server. ID pelanggan/kasir/kitchen diambil dari session, bukan dari payload request body.
4. **Penyimpanan Bukti Bayar di Vercel Tanpa Serverless File Storage**:
   - *Mitigasi*: Bukti transfer disimpan sebagai Base64 Data URL (maks. 500 KB) pada kolom `bukti_pembayaran` (`TEXT`), divalidasi MIME type dan ukurannya di server.
