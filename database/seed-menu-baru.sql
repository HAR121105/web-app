-- =============================================================================
-- SEED 6 MENU BARU TOKO DONAT HABIL (Untuk Cloud Database Neon & Lokal)
-- Modul 4 APSI - LSIK Universitas Andalas
-- Idempotent: Menggunakan ON CONFLICT DO NOTHING agar aman dijalankan berkali-kali
-- =============================================================================

-- 1. Tambah 6 Varian Menu Donat Baru
INSERT INTO menu (id_menu, nama_menu, kategori_menu, harga_satuan, aktif) VALUES
  ('MNU004', 'Donat Tiramisu',   'Donat Topping',        5000, true),
  ('MNU005', 'Donat Matcha',     'Donat Topping',        5000, true),
  ('MNU006', 'Donat Red Velvet', 'Donat Topping',        5000, true),
  ('MNU007', 'Choco Oreo',       'Donat Topping Double', 6000, true),
  ('MNU008', 'Cokelat Keju',     'Donat Topping Double', 6000, true),
  ('MNU009', 'Nut and Choco',    'Donat Topping Double', 6000, true)
ON CONFLICT (id_menu) DO NOTHING;

-- 2. Tambah Baris Persediaan Terkait (Stok Awal = 20 pcs)
INSERT INTO persediaan (id_persediaan, id_menu, jumlah_persediaan) VALUES
  ('PRSD04', 'MNU004', 20),
  ('PRSD05', 'MNU005', 20),
  ('PRSD06', 'MNU006', 20),
  ('PRSD07', 'MNU007', 20),
  ('PRSD08', 'MNU008', 20),
  ('PRSD09', 'MNU009', 20)
ON CONFLICT (id_persediaan) DO NOTHING;
