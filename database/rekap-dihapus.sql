-- =============================================================================
-- Skrip DDL Tabel rekap_dihapus untuk Neon Cloud Database (SQL Editor)
-- Jalankan skrip ini secara manual di SQL Editor Neon saat siap rilis.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rekap_dihapus (
    id_transaksi VARCHAR(10) PRIMARY KEY REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
    dihapus_pada TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dihapus_oleh VARCHAR(50)
);
