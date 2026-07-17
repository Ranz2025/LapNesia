# LapNesia - Platform E-Commerce dan Inspeksi Laptop

**Links:** [Repository](#)

## Deskripsi Proyek
LapNesia adalah aplikasi web e-commerce yang memfasilitasi transaksi jual-beli laptop bekas. Masalah utama yang ingin diselesaikan proyek ini adalah kurangnya kepercayaan pembeli terhadap kondisi hardware laptop bekas secara online. Solusi yang ditawarkan adalah fitur inspeksi oleh teknisi independen sebelum barang dijual atau diretur. Aplikasi ini memisahkan antarmuka pengguna (React) dan layanan data (Laravel REST API).

## Penggunaan AI dalam Pengembangan
AI digunakan selama proses pengembangan untuk mempercepat penulisan *boilerplate code*, membantu *debugging*, serta *refactoring* komponen UI. Seluruh keputusan arsitektur sistem, desain database, penentuan RBAC, pengaturan CI/CD, dan validasi fungsionalitas dilakukan serta diaudit langsung oleh pengembang.

## Peran & Tanggung Jawab
- Membangun REST API menggunakan Laravel.
- Mendesain skema database relasional di MariaDB.
- Mengimplementasikan autentikasi dan otorisasi menggunakan Laravel Sanctum.
- Membangun antarmuka pengguna (UI) menggunakan React dan Tailwind CSS.
- Menyiapkan konfigurasi Docker (`docker-compose.yml`) untuk memastikan konsistensi lingkungan pengembangan dan produksi.

## Teknologi Utama
- **Frontend:** React.js (Vite), Tailwind CSS, React Router v6.
- **Backend:** Laravel 11, PHP 8.3, MariaDB.
- **Integrasi Pihak Ketiga:** Midtrans (Core API & Webhooks).

## Fitur Sistem
- **Role-Based Access Control (RBAC):** Memisahkan akses UI dan endpoint API untuk 5 peran (Admin, Owner, Penjual, Pelanggan, Teknisi).
- **Modul Inspeksi Teknisi:** Halaman khusus bagi teknisi untuk menerima tugas verifikasi laptop dan menginput hasil laporan kondisi barang.
- **Dompet Digital (Wallet):** Pencatatan mutasi saldo pengguna untuk transaksi masuk, penarikan dana (withdrawal), dan pengembalian (refund).
- **Manajemen Retur:** Alur pengajuan pengembalian barang yang terintegrasi dengan validasi admin dan inspeksi teknisi.
- **Integrasi Pembayaran:** Proses *checkout* menggunakan Midtrans.

## Implementasi Keamanan & DevOps
- **Autentikasi & Keamanan API:** Menggunakan Laravel Sanctum untuk *token-based authentication*. Akses endpoint dibatasi menggunakan *middleware* berdasarkan peran pengguna.
- **Containerization:** Menggunakan Docker dan Docker Compose.
- **CI/CD Pipeline:** Menggunakan GitHub Actions untuk menjalankan proses *build* secara otomatis.
- **Static Code Analysis:** Mengintegrasikan SonarQube ke dalam *pipeline* untuk mendeteksi *code smell* dan potensi *bug* pada source code.