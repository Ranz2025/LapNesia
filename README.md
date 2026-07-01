# LapNesia 🖥️

Platform jual beli laptop bekas dengan fitur inspeksi teknisi, escrow payment, dan manajemen multi-role.

**Role yang tersedia:** Buyer · Seller · Technician · Admin · Owner

---

## Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Frontend | React + Vite |
| Backend | Laravel 11 (REST API) |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL |
| Payment | Midtrans |

---

## Requirement

- PHP >= 8.2 + Composer
- Node.js >= 18 + npm
- MySQL

---

## Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/cyeRanz/LapNesia.git
cd LapNesia
```

### 2. Setup Backend

```bash
cd Backend
cp .env.example .env
composer install
php artisan key:generate
```

Edit file `.env` sesuaikan database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lapnesia
DB_USERNAME=root
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:5173

MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxx
MIDTRANS_IS_PRODUCTION=false
```

Buat database `lapnesia` di MySQL, lalu jalankan:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Backend berjalan di: `http://localhost:8000`

### 3. Setup Frontend

```bash
cd ../Frontend
cp .env.example .env
npm install
npm run dev
```

Pastikan `.env` berisi:

```env
VITE_API_URL=http://localhost:8000/api
```

Frontend berjalan di: `http://localhost:5173`

---

## Akun Default (Seeder)

Setelah `migrate --seed`, akun berikut tersedia:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lapnesia.com | |
| Owner | owner@lapnesia.com | |
| Seller | seller@lapnesia.com | |
| Buyer | buyer@lapnesia.com | |
| Technician | technician@lapnesia.com | |

---

## Konfigurasi Midtrans

Project ini menggunakan Midtrans **Sandbox** (mode testing). Daftar akun gratis di [dashboard.midtrans.com](https://dashboard.midtrans.com), lalu ambil Server Key dan Client Key dari menu **Settings → Access Keys**.

---

## Struktur Folder

```
LapNesia/
├── Frontend/       # React + Vite
│   ├── src/
│   │   ├── pages/      # Halaman per role
│   │   ├── components/ # Komponen reusable
│   │   ├── services/   # API calls
│   │   └── routes/     # Routing & ProtectedRoute
│   └── .env.example
└── Backend/        # Laravel REST API
    ├── app/
    │   ├── Http/Controllers/Api/V1/
    │   ├── Models/
    │   ├── Services/
    │   └── Notifications/
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    └── .env.example
```

---

## License

[MIT](https://opensource.org/licenses/MIT)
