<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inspection_reports', function (Blueprint $table) {
            $table->text('battery_notes')->nullable()->after('battery_status');
            $table->text('screen_notes')->nullable()->after('screen_status');
            $table->text('keyboard_notes')->nullable()->after('keyboard_status');
            $table->text('touchpad_notes')->nullable()->after('touchpad_status');
            $table->text('port_notes')->nullable()->after('port_status');
            $table->text('storage_notes')->nullable()->after('storage_status');
            $table->text('ram_notes')->nullable()->after('ram_status');
            $table->text('cpu_notes')->nullable()->after('cpu_status');
            $table->text('physical_notes')->nullable()->after('physical_status');
        });
    }

    public function down(): void
    {
        Schema::table('inspection_reports', function (Blueprint $table) {
            $table->dropColumn([
                'battery_notes',
                'screen_notes',
                'keyboard_notes',
                'touchpad_notes',
                'port_notes',
                'storage_notes',
                'ram_notes',
                'cpu_notes',
                'physical_notes',
            ]);
        });
    }
};
