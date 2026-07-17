<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technician_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->text('skills')->nullable();
            $table->string('certification_url')->nullable();
            $table->decimal('inspection_fee', 15, 2)->default(150000.00);
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->integer('total_inspections')->default(0);
            $table->timestamps();
        });

        Schema::create('technician_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('available_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_booked')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'available_date', 'is_booked'], 'idx_tech_availability');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technician_availabilities');
        Schema::dropIfExists('technician_profiles');
    }
};
