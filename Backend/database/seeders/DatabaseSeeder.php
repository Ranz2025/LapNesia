<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Wallet;
use App\Models\TechnicianProfile;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Master Data
        $this->call([
            BrandSeeder::class,
            CategorySeeder::class,
        ]);

        // 2. Initial Users
        $users = [
            [
                'name' => 'Admin Lapnesia',
                'email' => 'admin@lapnesia.com',
                'phone' => '081234567890',
                'role' => 'admin',
                'status' => 'active',
            ],
            [
                'name' => 'Seller Laptop',
                'email' => 'seller@example.com',
                'phone' => '081234567891',
                'role' => 'seller',
                'status' => 'active',
            ],
            [
                'name' => 'Buyer User',
                'email' => 'buyer@example.com',
                'phone' => '081234567892',
                'role' => 'buyer',
                'status' => 'active',
            ],
            [
                'name' => 'Technician Pro',
                'email' => 'tech@example.com',
                'phone' => '081234567893',
                'role' => 'technician',
                'status' => 'verified',
            ],
            [
                'name' => 'Owner Lapnesia',
                'email' => 'owner@lapnesia.com',
                'phone' => '081234567894',
                'role' => 'owner',
                'status' => 'active',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'phone' => $userData['phone'],
                'password' => Hash::make('password'),
                'role' => $userData['role'],
                'status' => $userData['status'],
            ]);

            // Setiap user memiliki wallet
            Wallet::create([
                'user_id' => $user->id,
                'available_balance' => 0,
                'held_balance' => 0,
            ]);

            // Teknisi mendapat TechnicianProfile dengan biaya default
            if ($user->role === 'technician') {
                TechnicianProfile::create([
                    'user_id'        => $user->id,
                    'bio'            => 'Teknisi berpengalaman siap membantu inspeksi laptop Anda.',
                    'skills'         => 'Diagnosa hardware, cek baterai, layar, keyboard, storage',
                    'inspection_fee' => 150000,
                ]);
            }
        }

        // 3. Products
        $this->call([
            ProductSeeder::class, // Tambahkan ini
            ProductImageSeeder::class]);
    }
}
