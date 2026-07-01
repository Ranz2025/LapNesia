<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\InspectionJob;
use App\Models\InspectionReport;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use App\Services\InspectionPdfService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InspectionPdfTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        $user = User::create([
            'name' => ucfirst($role),
            'email' => $role . '@lapnesia.com',
            'phone' => '08' . rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role' => $role,
            'status' => 'active',
        ]);

        Wallet::create([
            'user_id' => $user->id,
            'available_balance' => 0,
            'held_balance' => 0,
            'frozen_balance' => 0,
        ]);

        return $user;
    }

    private function createCompletedReport(User $technician, User $buyer): InspectionReport
    {
        $brand = Brand::firstOrCreate(['name' => 'Brand PDF'], ['slug' => 'brand-pdf']);
        $cat = Category::firstOrCreate(['name' => 'Cat PDF'], ['slug' => 'cat-pdf']);

        $product = Product::create([
            'seller_id' => $buyer->id,
            'brand_id' => $brand->id,
            'category_id' => $cat->id,
            'model' => 'PDF Laptop',
            'slug' => 'pdf-laptop-' . uniqid(),
            'cpu' => 'i5',
            'ram' => 8,
            'storage' => 256,
            'storage_type' => 'SSD',
            'gpu' => 'Intel',
            'screen_size' => '14"',
            'price' => 5000000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'description' => 'Desc',
            'status' => 'active',
        ]);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $technician->id,
            'requested_by' => $buyer->id,
            'schedule_date' => now(),
            'fee' => 100000,
            'status' => 'completed',
        ]);

        return InspectionReport::create([
            'job_id' => $job->id,
            'technician_id' => $technician->id,
            'battery_status' => 'good',
            'screen_status' => 'good',
            'keyboard_status' => 'good',
            'touchpad_status' => 'good',
            'port_status' => 'good',
            'storage_status' => 'good',
            'ram_status' => 'good',
            'cpu_status' => 'good',
            'physical_status' => 'good',
            'overall_score' => 95,
            'notes' => 'Semua bagus',
            'recommendation' => 'recommended',
            'published_at' => now(),
            'expires_at' => now()->addDays(14),
        ]);
    }

    public function test_download_pdf_generates_and_returns_url(): void
    {
        Storage::fake('public');

        $buyer = $this->createUser('buyer');
        $technician = $this->createUser('technician');
        $report = $this->createCompletedReport($technician, $buyer);

        $url = app(InspectionPdfService::class)->generate($report);

        $report->refresh();
        $this->assertNotNull($report->pdf_url);
        $this->assertSame($url, $report->pdf_url);

        Storage::disk('public')->assertExists('inspections/' . $report->id . '.pdf');
    }
}
