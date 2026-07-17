<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspection_report_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_report_id')
                ->constrained('inspection_reports')
                ->cascadeOnDelete();
            $table->string('path');          // storage path, e.g. inspections/photos/xxx.jpg
            $table->string('caption')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('inspection_report_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspection_report_photos');
    }
};
