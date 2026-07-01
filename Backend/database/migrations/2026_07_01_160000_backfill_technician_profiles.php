<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Buat TechnicianProfile untuk setiap teknisi yang belum punya,
        // dengan inspection_fee default 150.000
        $techniciansWithoutProfile = DB::table('users')
            ->where('role', 'technician')
            ->whereNotIn('id', DB::table('technician_profiles')->pluck('user_id'))
            ->pluck('id');

        foreach ($techniciansWithoutProfile as $userId) {
            DB::table('technician_profiles')->insert([
                'user_id'           => $userId,
                'inspection_fee'    => 150000.00,
                'rating_avg'        => 0.00,
                'total_inspections' => 0,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // Update teknisi yang sudah punya profil tapi fee-nya null atau 0
        DB::table('technician_profiles')
            ->where(function ($q) {
                $q->whereNull('inspection_fee')->orWhere('inspection_fee', 0);
            })
            ->update(['inspection_fee' => 150000.00]);
    }

    public function down(): void
    {
        // Tidak di-rollback karena ini data fix, bukan structural change
    }
};
