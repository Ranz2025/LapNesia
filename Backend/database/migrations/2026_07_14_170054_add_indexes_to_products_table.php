<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (config('database.default') !== 'sqlite') {
            $hasStatusIndex = collect(\Illuminate\Support\Facades\DB::select("SHOW INDEX FROM products WHERE Key_name = 'products_status_index'"))->isNotEmpty();
            $hasPriceIndex = collect(\Illuminate\Support\Facades\DB::select("SHOW INDEX FROM products WHERE Key_name = 'products_price_index'"))->isNotEmpty();
            $hasCreatedIndex = collect(\Illuminate\Support\Facades\DB::select("SHOW INDEX FROM products WHERE Key_name = 'products_created_at_index'"))->isNotEmpty();
            
            Schema::table('products', function (Blueprint $table) use ($hasStatusIndex, $hasPriceIndex, $hasCreatedIndex) {
                if (!$hasStatusIndex) $table->index('status');
                if (!$hasPriceIndex) $table->index('price');
                if (!$hasCreatedIndex) $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['price']);
            $table->dropIndex(['created_at']);
        });
    }
};
