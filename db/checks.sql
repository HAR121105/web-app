-- =============================================================================
-- SISTEM INFORMASI PENJUALAN TOKO DONAT HABIL
-- Constraint Tambahan (CHECK Constraint untuk Produksi / Neon)
--
-- Dijalankan di SQL Editor Neon setelah `npx prisma db push` dan `db/seed.sql`
-- karena Prisma db push tidak meng-generate CHECK constraint SQL secara native.
-- =============================================================================

-- 1. TABEL AKUN: Role pengguna valid
ALTER TABLE akun
  ADD CONSTRAINT chk_akun_role
  CHECK (role IN ('owner', 'pelanggan', 'kasir', 'kitchen'));

-- 2. TABEL MENU: Harga satuan harus bernilai positif
ALTER TABLE menu
  ADD CONSTRAINT chk_menu_harga_satuan
  CHECK (harga_satuan > 0);

-- 3. TABEL PERSEDIAAN: Jumlah stok tidak boleh negatif
ALTER TABLE persediaan
  ADD CONSTRAINT chk_persediaan_jumlah
  CHECK (jumlah_persediaan >= 0);

-- 4. TABEL PESANAN: Status alur siklus hidup pesanan
ALTER TABLE pesanan
  ADD CONSTRAINT chk_pesanan_status
  CHECK (status_pesanan IN (
    'Menunggu Pembayaran',
    'Menunggu Validasi',
    'Pembayaran Tidak Valid',
    'Diproses Kitchen',
    'Siap Diambil',
    'Selesai',
    'Dibatalkan'
  ));

-- 5. TABEL DETAIL PESANAN: Kuantitas, harga, dan subtotal positif
ALTER TABLE detail_pesanan
  ADD CONSTRAINT chk_detail_pesanan_jumlah
  CHECK (jumlah_pesanan > 0);

ALTER TABLE detail_pesanan
  ADD CONSTRAINT chk_detail_pesanan_harga
  CHECK (harga_satuan > 0);

ALTER TABLE detail_pesanan
  ADD CONSTRAINT chk_detail_pesanan_subtotal
  CHECK (subtotal > 0);

-- 6. TABEL TRANSAKSI: Total tagihan, metode bayar, dan status valid
ALTER TABLE transaksi
  ADD CONSTRAINT chk_transaksi_total
  CHECK (total_transaksi > 0);

ALTER TABLE transaksi
  ADD CONSTRAINT chk_transaksi_metode
  CHECK (metode_pembayaran IN ('QRIS', 'Tunai'));

ALTER TABLE transaksi
  ADD CONSTRAINT chk_transaksi_status
  CHECK (status_pembayaran IN ('Menunggu Validasi', 'Berhasil', 'Tidak Valid'));
