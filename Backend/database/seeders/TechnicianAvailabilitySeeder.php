<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\TechnicianAvailability;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TechnicianAvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        $technicians = User::where('role', 'technician')
            ->whereIn('status', ['active', 'verified'])
            ->get();

        if ($technicians->isEmpty()) {
            $this->command->warn('Tidak ada teknisi aktif ditemukan.');

            return;
        }

        $slots = [
            ['start_time' => '09:00', 'end_time' => '11:00'],
            ['start_time' => '13:00', 'end_time' => '15:00'],
            ['start_time' => '15:00', 'end_time' => '17:00'],
        ];

        foreach ($technicians as $technician) {
            // Tambah slot untuk 7 hari ke depan
            for ($day = 1; $day <= 7; $day++) {
                $date = Carbon::today()->addDays($day);
                // Skip weekend jika mau, atau biarkan semua hari
                foreach ($slots as $slot) {
                    TechnicianAvailability::firstOrCreate([
                        'user_id' => $technician->id,
                        'available_date' => $date->toDateString(),
                        'start_time' => $slot['start_time'],
                    ], [
                        'end_time' => $slot['end_time'],
                        'is_booked' => false,
                    ]);
                }
            }
            $this->command->info("Slot ditambahkan untuk: {$technician->name}");
        }
    }
}
