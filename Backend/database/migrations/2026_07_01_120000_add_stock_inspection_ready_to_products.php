<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Jumlah stok produk; default 1 (produk bekas umumnya 1 unit)
            $table->unsignedInteger('stock')->default(1)->after('description');
            // Apakah seller bersedia produk diinspeksi teknisi
            $table->boolean('inspection_ready')->default(false)->after('stock');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['stock', 'inspection_ready']);
        });
    }
};
