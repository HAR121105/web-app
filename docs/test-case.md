# Dokumen Pengujian Black Box Testing (Toko Donat Habil)

Dokumen ini berisi rancangan dan hasil pengujian *Black Box Testing* untuk Sistem Informasi Penjualan Toko Donat Habil (Modul 4 APSI).

---

## 1. Matriks Pengujian Fungsional

| No | Modul / Use Case | Skenario Uji | Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Autentikasi | Login dengan kredensial benar (Pelanggan) | Input username dan password benar pada tab Pelanggan | `adzra` / `Adzra_123` | Login berhasil, cookie session diterbitkan, dialihkan ke `/pelanggan` | PASS |
| **TC-02** | Autentikasi | Login dengan kredensial benar (Kasir) | Input username dan password benar pada tab Kasir | `aidil` / `Aidil@Kasa1` | Login berhasil, dialihkan ke `/kasir` | PASS |
| **TC-03** | Autentikasi | Login dengan kredensial benar (Kitchen) | Input username dan password benar pada tab Kitchen | `daniel` / `Danil1_Kitchen` | Login berhasil, dialihkan ke `/kitchen` | PASS |
| **TC-04** | Autentikasi | Login dengan kredensial benar (Owner) | Input username dan password benar pada tab Owner | `owner` / `Owner_123` | Login berhasil, dialihkan ke `/owner` | PASS |
| **TC-05** | Autentikasi | Login dengan password salah | Input username terdaftar dengan password acak | `adzra` / `SalahPass123` | Muncul pesan error "Username atau password salah" (HTTP 401) | PASS |
| **TC-06** | Autentikasi | Login dengan role yang tidak cocok | Login akun kasir pada tab role Pelanggan | `aidil` / `Aidil@Kasa1` (tab pelanggan) | Ditolak dengan pesan error mismatch role (HTTP 403) | PASS |
| **TC-07** | Autentikasi | Registrasi akun pelanggan baru | Isi seluruh field pendaftaran pada form `/register` | Username: `budi`, Nama: `Budi`, Pass: `Budi1234` | Akun dan pelanggan tersimpan ke DB dalam `$transaction`, otomatis login | PASS |
| **TC-08** | Autentikasi | Registrasi dengan username duplikat | Daftar dengan username yang telah ada di database | Username: `adzra` | Muncul pesan validasi "Username sudah digunakan" (HTTP 400) | PASS |
| **TC-09** | Otorisasi / Proxy | Akses rute kasir tanpa login | Buka URL `http://localhost:3000/kasir` di browser baru | *(Tanpa cookie)* | Dialihkan ke halaman `/login?redirect=%2Fkasir` | PASS |
| **TC-10** | Otorisasi / Proxy | Akses rute kasir oleh role Pelanggan | Login sebagai Pelanggan, coba buka `/kasir` | Cookie role `pelanggan` | Dialihkan kembali ke dashboard role aslinya `/pelanggan` | PASS |
| **TC-11** | UC1 Pelanggan | Mengambil daftar katalog donat | Akses `GET /api/menu` | *(Publik / Pelanggan)* | Menampilkan daftar donat aktif beserta sisa stok dari tabel `persediaan` | PASS |
| **TC-12** | UC1 Pelanggan | Checkout pesanan donat metode QRIS | Tambahkan donat ke keranjang, unggah bukti bayar, klik Konfirmasi | 2x Donat Gula Halus, QRIS + Base64 screenshot | Pesanan tersimpan status 'Menunggu Validasi', transaksi QRIS tercatat | PASS |
| **TC-13** | UC1 Pelanggan | Checkout pesanan donat metode Tunai | Tambahkan donat ke keranjang, pilih Tunai, klik Konfirmasi | 1x Donat Keju, Tunai | Pesanan tersimpan status 'Menunggu Validasi' tanpa bukti bayar | PASS |
| **TC-14** | UC1 Pelanggan | Checkout melebihi persediaan donat | Memesan donat dengan jumlah melebihi stok yang ada | Qty: 999 Donat Keju | Ditolak oleh server dengan pesan "Stok tidak mencukupi" (HTTP 400) | PASS |
| **TC-15** | UC1 Pelanggan | Mengirimkan ulasan pesanan selesai | Mengisi kritik dan saran pada pesanan berstatus 'Selesai' | Kritik: "Rasa enak", Saran: "Topping baru" | Ulasan tersimpan di tabel `ulasan` dengan ID `ULS###` | PASS |
| **TC-16** | UC1 Pelanggan | Mengirimkan ulasan pada pesanan belum selesai | Mencoba submit ulasan untuk pesanan berstatus 'Diproses Kitchen' | ID Pesanan status belum selesai | Ditolak oleh server (HTTP 400: Ulasan hanya untuk status Selesai) | PASS |
| **TC-17** | UC2 Kasir | Memantau daftar pesanan masuk | Membuka tab 'Pesanan Masuk' pada dashboard Kasir | Role Kasir | Menampilkan seluruh pesanan lengkap dengan nama pelanggan dan status | PASS |
| **TC-18** | UC2 Kasir | Validasi pembayaran QRIS: VALID | Klik tombol 'Valid (Teruskan ke Dapur)' pada pesanan QRIS | ID Pesanan status 'Menunggu Validasi' | `status_pembayaran` -> `Berhasil`, `status_pesanan` -> `Diproses Kitchen` | PASS |
| **TC-19** | UC2 Kasir | Validasi pembayaran: TOLAK / TIDAK VALID | Klik tombol 'Tidak Valid (Tolak)' pada pembayaran bermasalah | ID Pesanan status 'Menunggu Validasi' | `status_pembayaran` -> `Tidak Valid`, `status_pesanan` -> `Pembayaran Tidak Valid` | PASS |
| **TC-20** | UC2 Kasir | Menyerahkan donat yang siap diambil | Klik 'Serahkan ke Pelanggan' pada pesanan berstatus 'Siap Diambil' | ID Pesanan status 'Siap Diambil' | Status pesanan diperbarui menjadi 'Selesai', `waktu_selesai` terisi | PASS |
| **TC-21** | UC2 Kasir | Mencetak struk transaksi resmi | Klik tombol 'Cetak Struk' lalu 'Cetak Fisik' | ID Pesanan berstatus lunas | Dialog print browser terbuka dengan tata letak struk termal Toko Donat Habil | PASS |
| **TC-22** | UC2 Kasir | Melihat rekapitulasi data shift | Membuka tab 'Rekap Data' pada dashboard Kasir | Role Kasir | Tampil ringkasan total omzet, total transaksi berhasil, dan pending | PASS |
| **TC-23** | UC3 Kitchen | Menerima antrean donat valid bayar | Membuka tab 'Antrian Masak' pada dashboard Kitchen | Role Kitchen | Menampilkan daftar pesanan dengan status 'Diproses Kitchen' / 'Siap Diambil' | PASS |
| **TC-24** | UC3 Kitchen | Menginput estimasi waktu pengerjaan | Memilih opsi waktu estimasi pada pesanan antrean | Estimasi: 15 Menit | Estimasi waktu tersimpan dan langsung terlihat di sisi Pelanggan & Kasir | PASS |
| **TC-25** | UC3 Kitchen | Konfirmasi donat selesai & potong persediaan | Klik 'Konfirmasi Pesanan Selesai (Siap Diambil)' | ID Pesanan 'Diproses Kitchen' | Status pesanan berubah menjadi 'Siap Diambil', stok donat berkurang otomatis | PASS |
| **TC-26** | UC3 Kitchen | Memperbarui stok persediaan donat manual | Klik tombol `+5` atau `-5` pada tabel Kelola Persediaan | ID Persediaan `PRSD01` | Nilai `jumlah_persediaan` pada tabel `persediaan` terupdate di database | PASS |
| **TC-27** | Owner | Memantau ringkasan omzet dan penjualan | Membuka dashboard Owner, memilih filter periode | Periode: `bulan_ini` | Menampilkan total omzet, rata-rata transaksi, dan donat terlaris | PASS |
| **TC-28** | Owner | Membaca kritik dan saran pelanggan | Membuka panel 'Ulasan & Kritik Saran' di `/owner` | Role Owner | Menampilkan feedback kritik dan saran aktual yang dikirimkan pelanggan | PASS |
| **TC-29** | Autentikasi | Logout keluar dari sistem | Klik tombol 'Keluar' pada navigasi dashboard manapun | Akun sedang login | Session cookie dihapus, localStorage dibersihkan, dialihkan ke `/login` | PASS |

---

## 2. Kesimpulan Pengujian

Seluruh **29 skenario uji fungsional** yang mencakup 3 Use Case Utama (UC1 Pelanggan, UC2 Kasir, UC3 Kitchen) serta modul Autentikasi RBAC dan Laporan Owner telah diuji dan dinyatakan **LULUS (PASS)** 100%.
Integritas basis data terjaga melalui penggunaan transaksi atomik (`prisma.$transaction`), enkripsi password bcrypt dengan salt 10, serta tanda tangan digital HMAC-SHA256 pada session cookie.
