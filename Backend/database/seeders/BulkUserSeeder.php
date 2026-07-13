<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Wallet;
use App\Models\TechnicianProfile;
use Illuminate\Support\Facades\Hash;

class BulkUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        // ── 20 Seller ──────────────────────────────────────────
        for ($i = 1; $i <= 20; $i++) {
            $user = User::updateOrCreate(
                ['email' => "seller{$i}@example.com"],
                [
                    'name'     => "Seller $i",
                    'phone'    => '0812' . str_pad($i, 8, '0', STR_PAD_LEFT),
                    'password' => $password,
                    'role'     => 'seller',
                    'status'   => 'active',
                ]
            );

            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['available_balance' => 0, 'held_balance' => 0]
            );
        }

        // ── 10 Teknisi ─────────────────────────────────────────
        for ($i = 1; $i <= 10; $i++) {
            $user = User::updateOrCreate(
                ['email' => "tech{$i}@example.com"],
                [
                    'name'     => "Technician $i",
                    'phone'    => '0813' . str_pad($i, 8, '0', STR_PAD_LEFT),
                    'password' => $password,
                    'role'     => 'technician',
                    'status'   => 'pending',
                ]
            );

            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['available_balance' => 0, 'held_balance' => 0]
            );

            TechnicianProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'bio'            => "Teknisi profesional $i berpengalaman di bidang hardware laptop.",
                    'skills'         => 'Diagnosa hardware, cek baterai, layar, keyboard, storage',
                    'inspection_fee' => 150000,
                ]
            );
        }

        // ── 70 Buyer ───────────────────────────────────────────
        for ($i = 1; $i <= 70; $i++) {
            $user = User::updateOrCreate(
                ['email' => "buyer{$i}@example.com"],
                [
                    'name'     => "Buyer $i",
                    'phone'    => '0814' . str_pad($i, 8, '0', STR_PAD_LEFT),
                    'password' => $password,
                    'role'     => 'buyer',
                    'status'   => 'active',
                ]
            );

            Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['available_balance' => 0, 'held_balance' => 0]
            );
        }

        $this->command->info('✅ Berhasil: 20 seller, 10 teknisi, 70 buyer ditambahkan.');
    }
}
