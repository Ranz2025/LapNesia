<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('shipping_address')->nullable()->after('notes');
        });

        Schema::table('inspection_jobs', function (Blueprint $table) {
            $table->text('laptop_address')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('shipping_address');
        });

        Schema::table('inspection_jobs', function (Blueprint $table) {
            $table->dropColumn('laptop_address');
        });
    }
};
