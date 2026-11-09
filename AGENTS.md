<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Konteks Project

Sistem Informasi Penjualan Toko Donat Habil (tugas Modul 4 APSI).
Role: Pelanggan, Kasir, Kitchen, Owner.

### Use case yang diimplementasikan
1. **Pelanggan**: Melakukan pemesanan donat mandiri/online, memilih metode pembayaran (QRIS/Tunai), mengunggah bukti bayar, dan memantau status pesanan.
2. **Kasir**: Menerima pesanan, memvalidasi bukti pembayaran pelanggan (Valid / Tidak Valid), dan meneruskan pesanan ke antrean dapur (*Kitchen*) serta mencetak struk.
3. **Kitchen**: Menerima pesanan yang telah valid bayar, menginput estimasi waktu pengerjaan, memproses pembuatan donat, dan mengonfirmasi pesanan selesai (siap diserahkan kasir).
*(Fitur pendukung: Autentikasi login multi-role dengan RBAC & pemantauan laporan transaksi oleh Owner).*

### Tech stack
- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL 18 (Docker lokal, Neon untuk production)
- Prisma (client di `generated/prisma`, diakses lewat `lib/prisma.ts`)
- Deployment: Vercel

### Aturan
- Sumber kebenaran database adalah `db/schema.sql`. Jangan ubah `schema.prisma` manual; gunakan `npx prisma db pull` lalu `npx prisma generate`.
- Jangan membuat tabel/kolom di luar ERD tanpa konfirmasi.
- Semua akses database lewat `lib/prisma.ts`. Jangan membuat PrismaClient baru.
- API ditulis di `app/api/<nama>/route.ts`. Setiap endpoint wajib cek login dan role.
- Password disimpan sebagai hash (bcrypt), bukan teks asli.
- Jangan membaca atau menulis `.env`; jangan commit rahasia.
- Tampilan mengikuti desain Figma (lewat Figma MCP), jangan mengarang layout.

### Struktur
- `app/` halaman dan API, `lib/` utilitas, `prisma/` schema, `db/` file SQL.

### Catatan prompt (wajib diisi tiap tahap)
| Tahap | Prompt (Context–Feature–Constraint) | Hasil / revisi |
|---|---|---|
| Inisialisasi Proyek | **C**: Modul 4 APSI Donat Habil.<br>**F**: Setup Next.js App Router, Prisma ORM, Docker Compose PostgreSQL, dan repositori Git.<br>**C**: Gunakan adapter pg, client di `generated/prisma`, patuhi aturan AGENTS.md. | Berhasil inisialisasi project, Prisma client, dan commit awal `99e6e58`. |
| Implementasi Database (Backend) | **C**: Sistem Informasi Penjualan Donat Habil, PostgreSQL 18 & Prisma ORM.<br>**F**: Lengkapi DDL 12 tabel (akun, pelanggan, kasir, kitchen, owner, menu, persediaan, pesanan, detail_pesanan, transaksi, riwayat_status_pesanan, ulasan) beserta seed data awal.<br>**C**: Sesuai Final ERD dan normalisasi 3NF, sumber kebenaran `db/schema.sql`, password disimpan sebagai hash bcrypt (salt 10), relasi & integrity constraint ketat. | Skema DDL lengkap 12 tabel dan data awal dengan hash bcrypt siap di `db/schema.sql`. |
| Implementasi Prototype Figma (Frontend) | **C**: Sistem Informasi Penjualan Donat Habil, desain Figma UI Design 5C (`caQFfrAJEQnq4kpMGPWs3Y`, node `182:4854`).<br>**F**: Implementasi halaman frontend Next.js App Router untuk seluruh role (`/login`, `/register`, `/pelanggan`, `/kasir`, `/kitchen`, `/owner`, dan `/`).<br>**C**: Mengikuti layout, tipografi, dan palet warna Figma (Warm Amber `#F8A106`, Chocolate Brown `#3C2923`, Vanilla Cream `#FAF7F2`), interaktif mendukung 3 use case utama, build bersih tanpa error. | Seluruh 7 route halaman frontend berhasil dibangun dan lulus kompilasi Turbopack Next.js (10/10 static pages). |
| Fase 0: Rencana Eksekusi | **C**: Toko Donat Habil Modul 4 APSI.<br>**F**: Buat `docs/EXECUTION_PLAN.md` audit status dan rincian fase 0–9.<br>**C**: Format markdown terstruktur, checklist per fase, mitigasi risiko. | Dokumen `docs/EXECUTION_PLAN.md` siap dan dijadikan panduan eksekusi. |
| Fase 1: Pembersihan Scaffold & Setup Build | **C**: Scaffold create-next-app menyisakan tabel User dan migrasi yang tidak sesuai.<br>**F**: Drop User, drop prisma/migrations, introspeksi ulang 12 model, buat `.env.example`, README, dan script build `prisma generate && next build`.<br>**C**: Jangan ubah skema manual; build harus bersih. | Database bersih tepat 12 tabel, build script diperbarui, dokumentasi README lengkap. |
| Fase 2: Autentikasi Nyata & RBAC | **C**: Sistem login sebelumnya hanya simulasi localStorage.<br>**F**: Implementasi session cookie HMAC-SHA256 (`lib/session.ts`), otorisasi role (`lib/auth.ts`), endpoint `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`, dan Next.js 16 `proxy.ts`.<br>**C**: Sandi dihash bcrypt salt 10, cookie httpOnly, proteksi rute per role ketat. | Otentikasi nyata aktif, rute terproteksi proxy, form login & register terhubung ke API. |
| Fase 3: UC1 Pelanggan | **C**: Pelanggan memesan donat secara online/mandiri.<br>**F**: Buat `GET /api/menu`, `POST & GET /api/pesanan`, `POST /api/ulasan`, serta hubungkan `app/pelanggan/page.tsx`.<br>**C**: Perhitungan harga di server dari `menu`, transaksi mutasi dalam `prisma.$transaction`, validasi stok. | Katalog donat, pembuatan pesanan QRIS/Tunai, upload bukti transfer, dan ulasan berhasil diuji. |
| Fase 4: UC2 Kasir | **C**: Kasir memvalidasi pembayaran dan mencetak struk transaksi.<br>**F**: Buat `GET /api/kasir/pesanan`, `PATCH /api/transaksi/[id]`, `PATCH /api/pesanan/[id]/serahkan`, `GET /api/transaksi/[id]/struk`, `GET /api/kasir/rekap`, serta hubungkan `app/kasir/page.tsx`.<br>**C**: Validasi pembayaran memicu update transaksi & pesanan dalam `$transaction`, cetak struk sesuai Figma. | Validasi pembayaran QRIS/Tunai, penerusan antrean dapur, penyerahan donat, dan cetak struk aktif. |
| Fase 5: UC3 Kitchen | **C**: Dapur menerima pesanan valid, mengestimasi waktu, dan memasak donat.<br>**F**: Buat `GET /api/kitchen/antrean`, `PATCH /api/pesanan/[id]/estimasi`, `PATCH /api/pesanan/[id]/status`, `GET & PATCH /api/kitchen/persediaan`, serta hubungkan `app/kitchen/page.tsx`.<br>**C**: Status 'Siap Diambil' otomatis memotong persediaan donat dalam `$transaction` atomik; tolak jika stok kurang. | Antrean masak FIFO, input estimasi waktu, update status Siap Diambil dengan pemotongan stok otomatis aktif. |
| Fase 6: Fitur Pendukung Owner | **C**: Pemilik memantau omzet toko donat dan kepuasan pelanggan.<br>**F**: Buat `GET /api/owner/laporan` dengan agregasi pendapatan, donat terlaris, dan ulasan, serta hubungkan `app/owner/page.tsx`.<br>**C**: Filter periode (hari ini, minggu ini, bulan ini), data terverifikasi konsisten. | Dashboard eksekutif Owner menampilkan grafik omzet, donat terlaris, dan umpan balik pembeli secara realtime. |
| Fase 7: Pengujian & Verifikasi Akses | **C**: Memastikan integritas keamanan sistem informasi penjualan.<br>**F**: Tulis skrip `scripts/verify-access.mjs` dan dokumen `docs/test-case.md` (29 skenario black box testing).<br>**C**: Uji kriptografi token HMAC-SHA256, permission matrix multi-role, 100% PASS. | Seluruh 22 assert skrip verifikasi lulus dan 29 test case black box terdokumentasi rapi. |
| Fase 8: Dokumentasi AGENTS.md | **C**: Menjaga integritas repositori dan transparansi pengembangan AI.<br>**F**: Perbarui `AGENTS.md` dengan tabel prompt lengkap, struktur API, dan business rules.<br>**C**: Dokumentasi akurat dan representatif terhadap kode sumber. | `AGENTS.md` diperbarui dengan seluruh catatan prompt dan arsitektur endpoint. |
| Fase 9: Persiapan Deployment | **C**: Rencana rilis ke cloud database Neon dan hosting Vercel.<br>**F**: Buat `db/seed.sql` khusus cloud, `docs/deployment.md`, `docs/RINGKASAN-IMPLEMENTASI.md`, dan verifikasi `npm run build`.<br>**C**: Tanpa mengekspos credential .env, build lolos tanpa error. | Skrip seed mandiri dan panduan deployment lengkap siap untuk dieksekusi pengguna. |
| Perbaikan Code Review (FIX 1–7) | **C**: Temuan audit commit 2ba8a7a..c4cb775 (keamanan kredensial, SESSION_SECRET, race condition kasir, .env.example, bukti QRIS, verify-access HTTP nyata, dan dokumen jujur).<br>**F**: Hapus demo password dari UI & repo, bangkitkan hash acak kuat di `db/seed.sql`, wajibkan SESSION_SECRET min 32 char, tolak validasi ulang transaksi (409) secara atomik, sertakan `.env.example`, wajib bukti QRIS & hardening input, tulis ulang skrip uji HTTP nyata, buat `db/checks.sql`, dan rapikan tautan.<br>**C**: 1 commit per fix, tanpa `git push`, tanpa merusak skema atau dependensi baru. | Berhasil diselesaikan dalam 7 commit lokal terpisah (FIX-1 s.d. FIX-7) dan lulus lint, typecheck, dan build. |

### Struktur Endpoint API Lengkap
- `POST /api/auth/login`: Autentikasi bcrypt akun & penerbitan cookie session HMAC-SHA256 (Publik).
- `POST /api/auth/register`: Registrasi pelanggan baru (membuat `akun` + `pelanggan` dalam `$transaction`) (Publik).
- `GET /api/auth/me`: Cek profil akun yang sedang login (Semua Role).
- `POST /api/auth/logout`: Menghapus session cookie (Semua Role).
- `GET /api/menu`: Mengambil daftar donat aktif dan jumlah ketersediaan persediaan (Publik/Pelanggan).
- `POST /api/pesanan`: Checkout donat (perhitungan harga server-side, validasi stok, insert pesanan, detail, transaksi, riwayat) (Pelanggan).
- `GET /api/pesanan`: Riwayat pesanan milik pelanggan sendiri (Pelanggan).
- `POST /api/ulasan`: Mengirim kritik dan saran untuk pesanan berstatus 'Selesai' (Pelanggan).
- `GET /api/kasir/pesanan`: Menampilkan pesanan masuk dengan filter status (Kasir).
- `PATCH /api/transaksi/[id]`: Validasi pembayaran kasir (`valid` -> status 'Diproses Kitchen', `tidak_valid` -> status 'Pembayaran Tidak Valid') (Kasir).
- `PATCH /api/pesanan/[id]/serahkan`: Menyerahkan donat berstatus 'Siap Diambil' ke pelanggan (`status_pesanan` -> 'Selesai') (Kasir).
- `GET /api/transaksi/[id]/struk`: Data struk transaksi fisik lengkap untuk dicetak (Kasir, Pelanggan, Owner).
- `GET /api/kasir/rekap`: Rekapitulasi transaksi shift kasir (Kasir, Owner).
- `GET /api/kitchen/antrean`: Antrean donat yang telah valid bayar (FIFO) (Kitchen).
- `PATCH /api/pesanan/[id]/estimasi`: Input estimasi waktu penyelesaian donat (Kitchen).
- `PATCH /api/pesanan/[id]/status`: Update ke 'Siap Diambil' dengan pemotongan stok otomatis pada tabel `persediaan` (Kitchen).
- `GET /api/kitchen/persediaan`: Memantau stok seluruh varian donat (Kitchen).
- `PATCH /api/kitchen/persediaan/[id]`: Mengubah manual jumlah persediaan donat (Kitchen).
- `GET /api/owner/laporan`: Laporan agregasi omzet, donat terlaris, dan ulasan pelanggan per periode (Owner).

### Aturan Bisnis & Integritas Data
1. **Perhitungan Harga Server-Side**: Harga satuan dan total tagihan selalu dihitung dari tabel `menu` pada database. Payload harga dari klien diabaikan untuk mencegah manipulasi.
2. **Pengurangan Stok Otomatis**: Saat Kitchen menandai pesanan selesai (`Siap Diambil`), sistem secara atomik memotong `jumlah_persediaan` di tabel `persediaan` menggunakan `prisma.$transaction`. Jika stok tidak mencukupi, operasi dibatalkan total.
3. **Penyimpanan Bukti Bayar**: Bukti transfer QRIS disimpan sebagai Base64 Data URL (maks. 500 KB) pada kolom `bukti_pembayaran` (`TEXT`), kompatibel dengan hosting serverless Vercel tanpa dependensi file storage eksternal.
4. **Proteksi Akses RBAC**: Seluruh endpoint API memverifikasi tanda tangan digital token HMAC-SHA256 via helper `requireAuth()`. Akses navigasi halaman frontend diproteksi oleh file convention Next.js 16 `proxy.ts`.
