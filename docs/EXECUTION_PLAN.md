# Rencana Eksekusi Sisa Progres Modul 4 APSI (Toko Donat Habil)

Dokumen ini memetakan seluruh tahapan pengerjaan Fase 0 hingga Fase 9 untuk penyelesaian tugas Modul 4 Sistem Informasi Penjualan Toko Donat Habil.

---

## 1. Checklist Fase Pengerjaan

- [x] **Fase 0: Audit Repo & Penyusunan Dokumen Rencana Eksekusi**
- [ ] **Fase 1: Pembersihan Repo & Scaffold**
  - [ ] Hapus tabel/model `User` scaffold bawaan create-next-app
  - [ ] Hapus folder `prisma/migrations`
  - [ ] Introspeksi ulang `npx prisma db pull` dan `npx prisma generate` (12 model murni)
  - [ ] Buat file `.env.example`
  - [ ] Perbarui `package.json` build script: `"prisma generate && next build"`
  - [ ] Ganti `README.md` dengan dokumentasi resmi proyek dalam bahasa Indonesia
- [ ] **Fase 2: Autentikasi Nyata & Otorisasi Role (RBAC)**
  - [ ] `lib/session.ts`: Session cookie HMAC-SHA256 (node:crypto, httpOnly, sameSite lax, 8 jam)
  - [ ] `lib/auth.ts`: Helper `getSession()` dan `requireRole(...roles)`
  - [ ] `app/api/auth/login/route.ts`: Login bcryptjs dengan verifikasi role database
  - [ ] `app/api/auth/register/route.ts`: Registrasi khusus pelanggan dengan `prisma.$transaction`
  - [ ] `app/api/auth/me/route.ts` & `app/api/auth/logout/route.ts`
  - [ ] `middleware.ts`: Proteksi rute per role (`/pelanggan`, `/kasir`, `/kitchen`, `/owner`)
  - [ ] Hubungkan `app/login/page.tsx` & `app/register/page.tsx` ke API, tambah tombol logout di semua dashboard
- [ ] **Fase 3: UC1 Pelanggan (Pemesanan, Pembayaran, Status, Ulasan)**
  - [ ] `GET /api/menu`: Daftar menu + status ketersediaan stok
  - [ ] `POST /api/pesanan`: Checkout pesanan, detail_pesanan, transaksi, dan riwayat dalam satu `prisma.$transaction`
  - [ ] `GET /api/pesanan`: Riwayat pesanan milik pelanggan sendiri
  - [ ] `POST /api/ulasan`: Form feedback ulasan setelah pesanan selesai
  - [ ] Hubungkan `app/pelanggan/page.tsx` ke API dengan state loading & error
- [ ] **Fase 4: UC2 Kasir (Validasi Pembayaran, Serahkan Pesanan, Cetak Struk, Rekap)**
  - [ ] `GET /api/kasir/pesanan`: Mengambil semua pesanan masuk (dengan filter status)
  - [ ] `PATCH /api/transaksi/[id]`: Aksi validasi bayar (`valid` / `tidak_valid`) & teruskan ke kitchen
  - [ ] `PATCH /api/pesanan/[id]/serahkan`: Kasir menyerahkan donat yang berstatus siap diambil
  - [ ] `GET /api/transaksi/[id]/struk`: Data struk transaksi untuk cetak fisik
  - [ ] `GET /api/kasir/rekap`: Rekapitulasi transaksi shift kasir
  - [ ] Hubungkan `app/kasir/page.tsx` ke API
- [ ] **Fase 5: UC3 Kitchen (Antrean Masak, Estimasi Waktu, Update Status, Kelola Stok)**
  - [ ] `GET /api/kitchen/antrean`: Pesanan berstatus pembayaran valid yang belum selesai
  - [ ] `PATCH /api/pesanan/[id]/estimasi`: Input estimasi waktu selesai pengerjaan
  - [ ] `PATCH /api/pesanan/[id]/status`: Update ke 'Diproses Kitchen' dan 'Siap Diambil' + pemotongan stok otomatis dalam transaksi
  - [ ] `GET` & `PATCH /api/kitchen/persediaan`: Memantau dan mengubah jumlah stok donat
  - [ ] Hubungkan `app/kitchen/page.tsx` ke API
- [ ] **Fase 6: Fitur Pendukung Owner (Laporan & Pemantauan Omzet)**
  - [ ] `GET /api/owner/laporan`: Agregasi omzet, total pesanan, transaksi, ulasan pelanggan (WIB / Asia/Jakarta)
  - [ ] Hubungkan `app/owner/page.tsx` ke API
- [ ] **Fase 7: Verifikasi Hak Akses & Black Box Testing**
  - [ ] Skrip `scripts/verify-access.mjs` menguji kepatuhan Permission Matrix
  - [ ] Dokumen Black Box Testing `docs/test-case.md` (minimal 25 test case)
  - [ ] Uji fungsional end-to-end (Pelanggan -> Kasir -> Kitchen -> Kasir -> Ulasan -> Owner)
- [ ] **Fase 8: Pembaruan Dokumentasi AGENTS.md**
  - [ ] Catat prompt CFC untuk semua fase
  - [ ] Struktur API & Business Rules
- [ ] **Fase 9: Persiapan Deployment Neon & Vercel**
  - [ ] `db/seed.sql` khusus seeding database cloud Neon
  - [ ] Pastikan `lib/prisma.ts` kompatibel SSL Neon
  - [ ] Verifikasi `npm run build` bersih
  - [ ] `docs/deployment.md` & `docs/RINGKASAN-IMPLEMENTASI.md`

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
