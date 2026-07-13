# About Laravel

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

---

# LapNesia 🖥️

Platform jual beli laptop bekas dengan fitur inspeksi teknisi, escrow payment, dan manajemen multi-role.

---

## Requirement

Pastikan sudah terinstall:

- PHP >= 8.2 + Composer
- Node.js >= 18 + npm
- MySQL

---

## Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/Ranz2025/LapNesia.git
cd LapNesia
```

---

### 2. Setup Backend

```bash
cd Backend
copy .env.example .env
composer install
php artisan key:generate
```

Buka file `Backend/.env`, sesuaikan bagian database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=root
DB_PASSWORD=isi_password_mysql_kamu
```

Buat database bernama `lapnesia` di MySQL, lalu jalankan:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

✅ Backend berjalan di `http://localhost:8000`

---

### 3. Setup Frontend

Buka terminal baru, lalu:

```bash
cd Frontend
copy .env.example .env
npm install
npm run dev
```

✅ Frontend berjalan di `http://localhost:5173`

---

## Akun Default

| Role | Email |
|------|-------|
| Admin | admin@lapnesia.com |
| Owner | owner@lapnesia.com |
| Seller | seller@lapnesia.com |
| Buyer | buyer@lapnesia.com |
| Technician | technician@lapnesia.com |

---

## Midtrans (Payment)

Project ini pakai Midtrans **Sandbox** (mode testing, tidak perlu kartu asli).

1. Daftar gratis di [dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Masuk ke **Settings → Access Keys**
3. Salin **Server Key** dan **Client Key**, isi di `Backend/.env`:

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxx
MIDTRANS_IS_PRODUCTION=false
```

> Tanpa Midtrans, fitur pembayaran tidak akan berfungsi.

---

## Catatan

- Jalankan **Backend** dan **Frontend** di dua terminal berbeda secara bersamaan.
- Jika gambar produk tidak muncul, pastikan sudah menjalankan `php artisan storage:link`.
