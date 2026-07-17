<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inspection_jobs', function (Blueprint $table) {
            $table->boolean('scheduled_by_technician')->default(false)->after('status');
            $table->text('inspection_notes')->nullable()->after('scheduled_by_technician');
            $table->date('technician_schedule_date')->nullable()->after('inspection_notes');
            $table->time('technician_schedule_time')->nullable()->after('technician_schedule_date');
            $table->text('technician_schedule_notes')->nullable()->after('technician_schedule_time');
        });
    }

    public function down(): void
    {
        Schema::table('inspection_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'scheduled_by_technician',
                'inspection_notes',
                'technician_schedule_date',
                'technician_schedule_time',
                'technician_schedule_notes',
            ]);
        });
    }
};
