<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('brand_id')->constrained('brands')->onDelete('restrict');
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->string('model');
            $table->string('slug')->unique();
            $table->string('cpu');
            $table->integer('ram');
            $table->integer('storage');
            $table->enum('storage_type', ['SSD', 'HDD', 'NVMe']);
            $table->string('gpu')->nullable();
            $table->string('screen_size');
            $table->decimal('price', 15, 2);
            $table->enum('condition', ['very_good', 'good', 'needs_repair']);
            $table->string('location');
            $table->text('description');
            $table->enum('status', ['draft', 'pending', 'active', 'booked', 'paid', 'sold', 'archived'])->default('draft');
            $table->boolean('is_spec_verified')->default(false);
            $table->decimal('avg_rating', 3, 2)->nullable();
            $table->string('resi_number')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('price');
            $table->index(['status', 'brand_id', 'price'], 'idx_products_filter_brand');
            $table->index(['status', 'category_id', 'price'], 'idx_products_filter_category');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('image_url');
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
    }
};
