-- =============================================================================
-- SEED DATA AWAL TOKO DONAT HABIL (Untuk Cloud Database Neon)
-- Modul 4 APSI - LSIK Universitas Andalas
-- Password hash menggunakan bcrypt dengan salt rounds 10
-- Akun demo:
-- - Pelanggan : adzra / Adzra_123
-- - Kasir     : aidil / Aidil@Kasa1
-- - Kitchen   : daniel / Danil1_Kitchen
-- - Owner     : owner / Owner_123
-- =============================================================================

-- 1. Akun
INSERT INTO akun (id_akun, username, password_hash, role) VALUES
 (1, 'adzra',  '$2b$10$w7Rbqac/g0DJbENWveO.ruKiWUSotw72n3DUpK6k9i..ZUyvasAEW', 'pelanggan'),
 (2, 'asqa',   '$2b$10$ucD0Lo880XzXnQ5e.8E6rOD00q6rzuO1VuC29z35PVSUoJWscB/Em', 'pelanggan'),
 (3, 'habiib', '$2b$10$G7S1Jhp39.11hFF8ba38Ge5bs6V7M/xj8ohXtyJsf1feaYtwFi66C', 'pelanggan'),
 (4, 'arya',   '$2b$10$DAvMSmLh5vhqpqe4V1o5hehFIIExfSrSiSlAmP9EI0WCpm4uJoGTS', 'pelanggan'),
 (5, 'aidil',  '$2b$10$PiWEpbzEMCN.YFTj/gUfIeqHNWCt1OizYRTu/g.VDuOnCmTt35rL.', 'kasir'),
 (6, 'aini',   '$2b$10$jwy5/U58LCCGkGR82ldOPeeKjl90V86QwB54Wa0x20UObmEAveXxi', 'kasir'),
 (7, 'daniel', '$2b$10$GVFGxhUIb4G9mIwcw9EfkeeK2zf4oPVkfhC6m7lQRflGa1le3dzoW', 'kitchen'),
 (8, 'mia',    '$2b$10$8rH6miA5OmXaUyEu43fWM.FIbHOE84N.d7a38QLAGryw1uLux8HeS', 'kitchen'),
 (9, 'owner',  '$2b$10$rLORQzFB.I0P5.pMB2Ort.x71083lWPPXXbFWYGMZB2cSKN0QDklW', 'owner')
ON CONFLICT (id_akun) DO NOTHING;

SELECT setval('akun_id_akun_seq', (SELECT COALESCE(MAX(id_akun), 1) FROM akun));

-- 2. Pelanggan
INSERT INTO pelanggan (id_pelanggan, id_akun, nama, tanggal_lahir, no_telepon, email, alamat, kode_pos) VALUES
 ('PLG001', 1, 'Adzra',  '2005-04-12', '081234561231', 'zhafira@gmail.com', 'Jl. Melati No. 10',  '2112'),
 ('PLG002', 2, 'Asqa',   '2004-08-22', '08123454378',  'asqa@gmail.com',    'Jl. Mawar No. 12',   '2113'),
 ('PLG003', 3, 'Habiib', '2005-01-18', '081234567803', 'habiib@gmail.com',  'Jl. Kenanga No. 8',  '2114'),
 ('PLG004', 4, 'Arya',   '2005-10-10', '081234561212', 'arya1@gmail.com',   'Jl. Melati No. 30',  '2112')
ON CONFLICT (id_pelanggan) DO NOTHING;

-- 3. Kasir
INSERT INTO kasir (id_kasir, id_akun, nama_kasir, tanggal_lahir, alamat, no_telepon, email) VALUES
 ('KSR001', 5, 'Aidil', '2003-10-15', 'Jl. Anggrek No.14', '089653784320', 'aidilll@gmail.com'),
 ('KSR002', 6, 'Aini',  '2003-05-23', 'Jl. Anggrek No.34', '089653908765', 'aini12@gmail.com')
ON CONFLICT (id_kasir) DO NOTHING;

-- 4. Kitchen
INSERT INTO kitchen (id_kitchen, id_akun, nama_kitchen, tanggal_lahir, alamat, no_telepon, email) VALUES
 ('KTN001', 7, 'Daniel', '2004-01-15', 'Jl. Sudirman No.21', '081234561231', 'daniel123@gmail.com'),
 ('KTN002', 8, 'Mia',    '2003-01-02', 'Jl. Kusuma No.22',   '081234124300', 'miaa@gmail.com')
ON CONFLICT (id_kitchen) DO NOTHING;

-- 5. Owner
INSERT INTO owner (id_owner, id_akun, nama_owner) VALUES
 ('OWN001', 9, 'Habil')
ON CONFLICT (id_owner) DO NOTHING;

-- 6. Menu Donat
INSERT INTO menu (id_menu, nama_menu, kategori_menu, harga_satuan) VALUES
 ('MNU001', 'Donat Gula Halus',    'Donat Klasik',  4000),
 ('MNU002', 'Donat Cokelat Meses', 'Donat Topping', 4000),
 ('MNU003', 'Donat Keju',          'Donat Topping', 5000)
ON CONFLICT (id_menu) DO NOTHING;

-- 7. Persediaan Donat
INSERT INTO persediaan (id_persediaan, id_menu, jumlah_persediaan) VALUES
 ('PRSD01', 'MNU001', 60),
 ('PRSD02', 'MNU002', 55),
 ('PRSD03', 'MNU003', 48)
ON CONFLICT (id_persediaan) DO NOTHING;

-- 8. Pesanan Awal
INSERT INTO pesanan (id_pesanan, id_pelanggan, id_kasir, id_kitchen, tanggal_pesanan, waktu_pesanan, status_pesanan, estimasi_selesai, waktu_selesai) VALUES
 ('PSN001', 'PLG001', 'KSR001', 'KTN001', '2026-11-01', '09:15:00', 'Selesai', '09:35:00', '09:35:00'),
 ('PSN002', 'PLG002', 'KSR001', 'KTN001', '2026-11-02', '10:30:00', 'Selesai', '10:50:00', '10:46:00'),
 ('PSN003', 'PLG003', 'KSR002', 'KTN001', '2026-11-02', '11:15:00', 'Selesai', '11:35:00', '11:35:00'),
 ('PSN004', 'PLG004', 'KSR001', 'KTN002', '2026-11-03', '10:15:00', 'Selesai', '10:30:00', '10:27:00')
ON CONFLICT (id_pesanan) DO NOTHING;

-- 9. Detail Pesanan
INSERT INTO detail_pesanan (id_pesanan, id_menu, jumlah_pesanan, harga_satuan, subtotal) VALUES
 ('PSN001', 'MNU001', 2, 4000, 8000),
 ('PSN002', 'MNU002', 1, 4000, 4000),
 ('PSN003', 'MNU003', 2, 5000, 10000),
 ('PSN004', 'MNU001', 4, 4000, 16000)
ON CONFLICT (id_pesanan, id_menu) DO NOTHING;

-- 10. Transaksi
INSERT INTO transaksi (id_transaksi, id_pesanan, id_kasir, waktu_transaksi, total_transaksi, metode_pembayaran, status_pembayaran, bukti_pembayaran) VALUES
 ('TRX001', 'PSN001', 'KSR001', '2026-11-01 09:20:00', 8000,  'QRIS',  'Berhasil', '/uploads/qris_psn001.png'),
 ('TRX002', 'PSN002', 'KSR001', '2026-11-02 10:35:00', 4000,  'Tunai', 'Berhasil', NULL),
 ('TRX003', 'PSN003', 'KSR002', '2026-11-02 11:20:00', 10000, 'QRIS',  'Berhasil', '/uploads/qris_psn003.png'),
 ('TRX004', 'PSN004', 'KSR001', '2026-11-03 10:18:00', 16000, 'Tunai', 'Berhasil', NULL)
ON CONFLICT (id_transaksi) DO NOTHING;

-- 11. Riwayat Status Pesanan
INSERT INTO riwayat_status_pesanan (id_pesanan, status_pesanan, waktu_update) VALUES
 ('PSN001', 'Menunggu Validasi', '2026-11-01 09:15:00'),
 ('PSN001', 'Diproses Kitchen',  '2026-11-01 09:20:00'),
 ('PSN001', 'Siap Diambil',      '2026-11-01 09:33:00'),
 ('PSN001', 'Selesai',           '2026-11-01 09:35:00'),
 ('PSN002', 'Selesai',           '2026-11-02 10:46:00'),
 ('PSN003', 'Selesai',           '2026-11-02 11:35:00'),
 ('PSN004', 'Selesai',           '2026-11-03 10:27:00');

-- 12. Ulasan
INSERT INTO ulasan (id_ulasan, id_pesanan, kritik_pelanggan, saran_pelanggan) VALUES
 ('ULS001', 'PSN001', 'Rasa donat sangat enak dan empuk.', 'Perbanyak varian topping matcha.'),
 ('ULS002', 'PSN002', 'Pelayanan kasir ramah dan cepat.',  'Pertahankan konsistensi rasa.')
ON CONFLICT (id_ulasan) DO NOTHING;
