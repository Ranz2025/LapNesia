<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TechnicianProfile;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user and create a wallet
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // Teknisi baru wajib menunggu verifikasi admin sebelum bisa beroperasi
            $status = $data['role'] === 'technician' ? 'pending' : 'active';

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'address' => $data['address'] ?? null,
                'status' => $status,
            ]);

            // Create Wallet automatically
            Wallet::create([
                'user_id' => $user->id,
                'available_balance' => 0,
                'held_balance' => 0,
                'frozen_balance' => 0,
            ]);

            // Buat TechnicianProfile dengan biaya inspeksi default
            if ($user->role === 'technician') {
                TechnicianProfile::create([
                    'user_id' => $user->id,
                    'inspection_fee' => 150000,
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return [$user, $token];
        });
    }

    /**
     * Login user and generate token
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->status === 'suspended' || $user->status === 'banned') {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda telah ditangguhkan atau diblokir.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [$user, $token];
    }
}
