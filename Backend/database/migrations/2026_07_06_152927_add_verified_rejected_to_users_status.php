<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return; // SQLite does not support MODIFY COLUMN enum natively and does not enforce it
        }
        // Tambahkan 'verified' dan 'rejected' ke enum status di tabel users
        DB::statement("ALTER TABLE `users` MODIFY COLUMN `status` ENUM('pending','active','suspended','banned','verified','rejected') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }
        // Kembalikan enum ke nilai semula (pastikan tidak ada data verified/rejected sebelum rollback)
        DB::statement("ALTER TABLE `users` MODIFY COLUMN `status` ENUM('pending','active','suspended','banned') NOT NULL DEFAULT 'pending'");
    }
};
