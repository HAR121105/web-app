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