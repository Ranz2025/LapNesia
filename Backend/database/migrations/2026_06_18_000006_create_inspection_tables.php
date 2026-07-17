<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspection_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->foreignId('technician_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('requested_by')->constrained('users')->onDelete('restrict');
            $table->dateTime('schedule_date');
            $table->decimal('fee', 15, 2);
            $table->enum('status', [
                'assigned', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled',
            ])->default('assigned');
            $table->timestamps();

            $table->index('status');
            $table->index('schedule_date');
        });

        Schema::create('inspection_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->unique()->constrained('inspection_jobs')->onDelete('restrict');
            $table->foreignId('technician_id')->constrained('users')->onDelete('restrict');
            $table->enum('battery_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('screen_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('keyboard_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('touchpad_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('port_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('storage_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('ram_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('cpu_status', ['good', 'needs_attention', 'faulty']);
            $table->enum('physical_status', ['good', 'needs_attention', 'faulty']);
            $table->tinyInteger('overall_score')->unsigned();
            $table->text('notes')->nullable();
            $table->enum('recommendation', ['recommended', 'fix_required', 'not_recommended']);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('pdf_url')->nullable();
            $table->timestamps();

            $table->index('expires_at');
            $table->index('overall_score');
        });

        Schema::create('inspection_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_job_id')->constrained('inspection_jobs')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('technician_id')->constrained('users')->cascadeOnDelete();
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

            $table->index('inspection_job_id');
            $table->index('buyer_id');
            $table->index('technician_id');
            $table->index('status');
            $table->index('transaction_id');
        });

        Schema::create('inspection_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->unique()->constrained('inspection_jobs')->onDelete('cascade');
            $table->foreignId('technician_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->unsignedTinyInteger('rating');
            $table->text('review')->nullable();
            $table->timestamps();

            $table->index(['technician_id', 'buyer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspection_ratings');
        Schema::dropIfExists('inspection_payments');
        Schema::dropIfExists('inspection_reports');
        Schema::dropIfExists('inspection_jobs');
    }
};
