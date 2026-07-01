<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('seller_id')->constrained('users')->onDelete('restrict');
            $table->decimal('product_price', 15, 2);
            $table->decimal('platform_fee', 15, 2);
            $table->decimal('total_amount', 15, 2);
            $table->json('product_snapshot');
            $table->timestamp('booking_expires_at');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('resi_number')->nullable();
            $table->enum('status', [
                'waiting_payment', 'paid', 'shipped', 'completed',
                'expired', 'refunded', 'disputed', 'cancelled'
            ])->default('waiting_payment');
            $table->boolean('is_disputed')->default(false);
            $table->text('dispute_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('buyer_id');
            $table->index('seller_id');
            $table->index('created_at');
            $table->index('paid_at');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('payment_gateway')->default('midtrans');
            $table->string('payment_gateway_ref')->nullable();
            $table->string('transaction_id')->nullable()->unique();
            $table->string('snap_token')->nullable();
            $table->string('snap_redirect_url')->nullable();
            $table->decimal('gross_amount', 15, 2);
            $table->string('payment_type')->nullable();
            $table->string('signature_key')->nullable();
            $table->enum('status', ['pending', 'success', 'failed', 'expired', 'cancelled'])->default('pending');
            $table->json('webhook_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('transaction_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('restrict');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->enum('status', ['pending', 'approved', 'rejected', 'processed'])->default('pending');
            $table->timestamp('processed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index('wallet_id');
            $table->index('status');
        });

        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->tinyInteger('seller_rating')->unsigned();
            $table->text('seller_review')->nullable();
            $table->tinyInteger('technician_rating')->nullable()->unsigned();
            $table->text('technician_review')->nullable();
            $table->timestamps();

            $table->index('order_id');
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->text('reason');
            $table->string('status')->default('pending');
            $table->text('seller_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('return_resi')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('ratings');
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('orders');
    }
};
