<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->numericMorphs('reference'); // reference_id BIGINT, reference_type VARCHAR
            $table->enum('type', [
                'sale_income',
                'inspection_fee',
                'inspection_income',
                'inspection_income_release',
                'withdraw',
                'refund',
                'platform_fee_adjustment',
                'escrow_release',
                'freeze_for_withdrawal',
                'release_freeze',
            ]);
            $table->enum('status', ['escrow', 'released', 'refunded', 'completed'])->default('completed');
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['wallet_id', 'type']);
            $table->index('created_at');
            $table->index(['reference_id', 'reference_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
