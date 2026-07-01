<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->tinyInteger('product_rating')->unsigned()->nullable()->after('seller_review');
            $table->text('product_review')->nullable()->after('product_rating');
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropColumn(['product_rating', 'product_review']);
        });
    }
};
