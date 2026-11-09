# Dokumen Pengujian Black Box Testing (Toko Donat Habil)

Dokumen ini berisi rancangan dan hasil pengujian *Black Box Testing* untuk Sistem Informasi Penjualan Toko Donat Habil (Modul 4 APSI).

---

## 1. Matriks Pengujian Fungsional

| No | Modul / Use Case | Skenario Uji | Langkah Pengujian | Data Uji | Hasil yang Diharapkan | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| **TC-01** | Autentikasi | Login dengan kredensial benar (Pelanggan) | POST `/api/auth/login` | `adzra` / *(password akun demo)* | Login berhasil, cookie session diterbitkan, HTTP 200 | HTTP 200, Set-Cookie `donat_session_token` terisi | PASS |
| **TC-02** | Autentikasi | Login dengan kredensial benar (Kasir) | POST `/api/auth/login` | `aidil` / *(password akun demo)* | Login berhasil, HTTP 200 | HTTP 200, Set-Cookie `donat_session_token` terisi | PASS |
| **TC-03** | Autentikasi | Login dengan kredensial benar (Kitchen) | POST `/api/auth/login` | `daniel` / *(password akun demo)* | Login berhasil, HTTP 200 | HTTP 200, Set-Cookie `donat_session_token` terisi | PASS |
| **TC-04** | Autentikasi | Login dengan kredensial benar (Owner) | POST `/api/auth/login` | `owner` / *(password akun demo)* | Login berhasil, HTTP 200 | HTTP 200, Set-Cookie `donat_session_token` terisi | PASS |
| **TC-05** | Autentikasi | Login dengan password salah | POST `/api/auth/login` dengan password acak | `adzra` / *(password keliru)* | Muncul pesan error HTTP 401 | HTTP 401: `Username atau password salah.` | PASS |
| **TC-06** | Autentikasi | Login dengan role yang tidak cocok | Form UI `/login` pilih tab Pelanggan tetapi akun Kasir | `aidil` / *(password kasir)* | Ditolak dengan pesan error mismatch role di UI | Menunggu pengujian interaktif manual di browser | [UJI MANUAL] |
| **TC-07** | Autentikasi | Registrasi akun pelanggan baru | Form pendaftaran `/register` | Data pelanggan baru | Akun dan pelanggan tersimpan dalam `$transaction`, otomatis login | Menunggu pengujian interaktif manual di browser | [UJI MANUAL] |
| **TC-08** | Autentikasi | Registrasi dengan username duplikat | Form `/register` dengan username yang sudah ada | Username: `adzra` | Ditolak dengan validasi HTTP 400 | Menunggu pengujian interaktif manual di browser | [UJI MANUAL] |
| **TC-09** | Otorisasi / Proxy | Akses rute kasir tanpa login | Buka URL `/kasir` di browser tanpa cookie | *(Tanpa cookie)* | Dialihkan proxy ke `/login?redirect=%2Fkasir` | Menunggu pengujian interaktif manual di browser | [UJI MANUAL] |
| **TC-10** | Otorisasi / Proxy | Akses rute kasir oleh role Pelanggan | Buka URL `/kasir` dengan cookie session pelanggan | Cookie role `pelanggan` | Dialihkan kembali ke `/pelanggan` | Menunggu pengujian interaktif manual di browser | [UJI MANUAL] |
| **TC-11** | UC1 Pelanggan | Mengambil daftar pesanan pelanggan | Akses `GET /api/pesanan` oleh Pelanggan | Cookie `pelanggan` | Menampilkan pesanan milik pelanggan sendiri | HTTP 200, objek `{ pesanan: [...] }` | PASS |
| **TC-12** | UC1 Pelanggan | Akses pesanan tanpa autentikasi | Akses `GET /api/pesanan` tanpa cookie | *(Tanpa cookie)* | Ditolak dengan kode otorisasi HTTP 401 | HTTP 401: `Autentikasi dibutuhkan.` | PASS |
| **TC-13** | UC1 Pelanggan | Akses pesanan oleh role Kasir | Akses `GET /api/pesanan` dengan cookie kasir | Cookie `kasir` | Ditolak dengan kode HTTP 403 Forbidden | HTTP 403: `Akses ditolak.` | PASS |
| **TC-14** | UC1 Pelanggan | Checkout QRIS tanpa bukti bayar | POST `/api/pesanan` dengan metode QRIS tanpa bukti | Payload QRIS tanpa bukti | Ditolak server dengan validasi HTTP 400 | HTTP 400: `Bukti pembayaran QRIS wajib diunggah.` | PASS |
| **TC-15** | UC1 Pelanggan | Checkout pesanan donat metode Tunai | POST `/api/pesanan` dengan metode Tunai | 1x Donat `MN001`, Tunai | Pesanan terbuat di DB status 'Menunggu Validasi', HTTP 201 | HTTP 201, objek pesanan & transaksi terbit | PASS |
| **TC-16** | UC1 Pelanggan | Ulasan silang antar pelanggan | Pelanggan B submit ulasan untuk pesanan Pelanggan A | ID Pesanan Pelanggan A, cookie Pelanggan B | Ditolak HTTP 403 karena bukan pemilik pesanan | HTTP 403: `Anda tidak berhak memberikan ulasan.` | PASS |
| **TC-17** | UC2 Kasir | Memantau daftar pesanan masuk | Akses `GET /api/kasir/pesanan` oleh Kasir | Cookie `kasir` | Menampilkan seluruh pesanan masuk, HTTP 200 | HTTP 200, list pesanan berhasil dimuat | PASS |
| **TC-18** | UC2 Kasir | Akses panel kasir oleh role Pelanggan | Akses `GET /api/kasir/pesanan` oleh Pelanggan | Cookie `pelanggan` | Ditolak HTTP 403 Forbidden | HTTP 403: `Akses ditolak.` | PASS |
| **TC-19** | UC2 Kasir | Validasi pembayaran pertama kali | PATCH `/api/transaksi/[id]` status `valid` | ID Transaksi valid status 'Menunggu Validasi' | Transaksi terverifikasi, status berubah, HTTP 200 | HTTP 200: `Status transaksi berhasil diperbarui.` | PASS |
| **TC-20** | UC2 Kasir | Validasi ulang pembayaran yang telah diproses | PATCH `/api/transaksi/[id]` status `valid` kedua kali | ID Transaksi yang sama | Ditolak HTTP 409 Conflict | HTTP 409: `Transaksi sudah diproses sebelumnya.` | PASS |
| **TC-21** | UC2 Kasir | Penyerahan pesanan non-existent | PATCH `/api/pesanan/NONEXISTENT/serahkan` | ID Pesanan palsu, cookie kasir | Mengembalikan not found HTTP 404 tanpa crash | HTTP 404: `Pesanan tidak ditemukan.` | PASS |
| **TC-22** | UC2 Kasir | Mencetak struk transaksi fisik | Klik 'Cetak Struk' di UI kasir | ID Transaksi lunas | Dialog print browser terbuka dengan template struk | Menunggu pengujian interaktif manual di browser | [UJI MANUAL] |
| **TC-23** | UC2 Kasir | Mengambil data rekap kasir | Akses `GET /api/kasir/rekap` oleh Kasir | Cookie `kasir` | Menampilkan rekap shift omzet kasir, HTTP 200 | HTTP 200, data rekap shift diterima | PASS |
| **TC-24** | UC3 Kitchen | Mengambil antrean masak dapur | Akses `GET /api/kitchen/antrean` oleh Kitchen | Cookie `kitchen` | Menampilkan antrean masak FIFO, HTTP 200 | HTTP 200, antrean dapur diterima | PASS |
| **TC-25** | UC3 Kitchen | Akses antrean dapur oleh Pelanggan | Akses `GET /api/kitchen/antrean` oleh Pelanggan | Cookie `pelanggan` | Ditolak HTTP 403 Forbidden | HTTP 403: `Akses ditolak.` | PASS |
| **TC-26** | UC3 Kitchen | Input estimasi waktu non-existent | PATCH `/api/pesanan/NONEXISTENT/estimasi` | ID Pesanan palsu, cookie kitchen | Mengembalikan not found HTTP 404 tanpa crash | HTTP 404: `Pesanan tidak ditemukan.` | PASS |
| **TC-27** | UC3 Kitchen | Update status non-existent | PATCH `/api/pesanan/NONEXISTENT/status` | ID Pesanan palsu, cookie kitchen | Mengembalikan not found HTTP 404 tanpa crash | HTTP 404: `Pesanan tidak ditemukan.` | PASS |
| **TC-28** | UC3 Kitchen | Mengambil daftar persediaan | Akses `GET /api/kitchen/persediaan` oleh Kitchen | Cookie `kitchen` | Menampilkan stok seluruh donat, HTTP 200 | HTTP 200, daftar persediaan diterima | PASS |
| **TC-29** | Owner | Memantau laporan omzet dan donat | Akses `GET /api/owner/laporan` oleh Owner | Cookie `owner` | Menampilkan agregasi pendapatan dan donat terlaris | HTTP 200, data omzet dan metrik diterima | PASS |
| **TC-30** | Autentikasi | Manipulasi token cookie (tampering) | Request dengan signature HMAC-SHA256 yang diubah | Cookie dimodifikasi | Token invalid, server menolak dengan HTTP 401 | HTTP 401: `Sesi login tidak valid atau kedaluwarsa.` | PASS |

---

## 2. Metodologi dan Kesimpulan Pengujian

Pengujian sistem dibagi menjadi dua lapisan:

1. **Pengujian Terotomatisasi (API & RBAC)**: Dijalankan melalui skrip [`scripts/verify-access.mjs`](../scripts/verify-access.mjs) terhadap endpoint HTTP nyata pada server Next.js. Menguji otorisasi multi-role (401 unauthenticated, 403 unauthorized), token kriptografi WebCrypto HMAC-SHA256, serta aturan validasi konflik bisnis (409) dan penolakan QRIS tanpa bukti (400).
2. **Pengujian Manual (UI/UX & Hardware)**: Seluruh pengujian yang melibatkan antarmuka visual (seperti render formulir, interaksi tombol keranjang, preview unggah gambar, dialog pencetakan struk termal peramban, dan transisi halaman) ditandai sebagai `[UJI MANUAL]` dan diverifikasi secara langsung oleh penguji di peramban web.
