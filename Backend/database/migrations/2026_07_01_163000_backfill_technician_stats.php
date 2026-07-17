<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite update join syntax
            DB::statement("
                UPDATE technician_profiles
                SET total_inspections = COALESCE((
                    SELECT COUNT(*)
                    FROM inspection_jobs
                    WHERE inspection_jobs.technician_id = technician_profiles.user_id
                      AND inspection_jobs.status = 'completed'
                ), 0)
            ");

            DB::statement('
                UPDATE technician_profiles
                SET rating_avg = COALESCE((
                    SELECT ROUND(AVG(rating), 2)
                    FROM inspection_ratings
                    WHERE inspection_ratings.technician_id = technician_profiles.user_id
                ), 0.00)
            ');

            return;
        }

        // Update total_inspections dari inspection_jobs yang completed
        DB::statement("
            UPDATE technician_profiles tp
            JOIN (
                SELECT technician_id, COUNT(*) as total
                FROM inspection_jobs
                WHERE status = 'completed'
                GROUP BY technician_id
            ) j ON j.technician_id = tp.user_id
            SET tp.total_inspections = j.total
        ");

        // Update rating_avg dari inspection_ratings
        DB::statement('
            UPDATE technician_profiles tp
            JOIN (
                SELECT technician_id, ROUND(AVG(rating), 2) as avg_rating
                FROM inspection_ratings
                GROUP BY technician_id
            ) r ON r.technician_id = tp.user_id
            SET tp.rating_avg = r.avg_rating
        ');
    }

    public function down(): void
    {
        // Reset ke 0
        DB::table('technician_profiles')->update([
            'total_inspections' => 0,
            'rating_avg' => 0.00,
        ]);
    }
};
