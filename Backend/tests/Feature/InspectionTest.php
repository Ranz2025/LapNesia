<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\InspectionJob;
use App\Models\InspectionReport;
use App\Models\Product;
use App\Models\TechnicianAvailability;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InspectionTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        $user = User::create([
            'name' => ucfirst($role).' User',
            'email' => $role.'@test.com',
            'phone' => '08'.rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role' => $role,
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $user->id, 'available_balance' => 0, 'held_balance' => 0]);

        return $user;
    }

    private function createProduct(User $seller): Product
    {
        $brand = Brand::create(['name' => 'Test Brand', 'slug' => 'test-brand']);
        $cat = Category::create(['name' => 'Test Cat', 'slug' => 'test-cat']);

        return Product::create([
            'seller_id' => $seller->id,
            'brand_id' => $brand->id,
            'category_id' => $cat->id,
            'model' => 'Test Laptop',
            'slug' => 'test-laptop',
            'cpu' => 'i5',
            'ram' => 8,
            'storage' => 256,
            'storage_type' => 'SSD',
            'screen_size' => '14"',
            'price' => 5000000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'description' => 'Test product',
            'status' => 'active',
        ]);
    }

    private function createSlot(User $tech): TechnicianAvailability
    {
        return TechnicianAvailability::create([
            'user_id' => $tech->id,
            'available_date' => now()->addDay()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'is_booked' => false,
        ]);
    }

    // ========== Technician Availability ==========

    public function test_technician_can_add_availability(): void
    {
        $tech = $this->createUser('technician');

        $response = $this->actingAs($tech)->postJson('/api/v1/technician/availability', [
            'available_date' => now()->addDay()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true);
        $this->assertDatabaseHas('technician_availabilities', ['user_id' => $tech->id]);
    }

    public function test_non_technician_cannot_add_availability(): void
    {
        $buyer = $this->createUser('buyer');

        $this->actingAs($buyer)->postJson('/api/v1/technician/availability', [
            'available_date' => now()->addDay()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
        ])->assertStatus(403);
    }

    public function test_technician_cannot_delete_booked_slot(): void
    {
        $tech = $this->createUser('technician');
        $slot = $this->createSlot($tech);
        $slot->update(['is_booked' => true]);

        $this->actingAs($tech)
            ->deleteJson("/api/v1/technician/availability/{$slot->id}")
            ->assertStatus(422);
    }

    // ========== Inspection Job ==========

    public function test_buyer_can_create_inspection_job(): void
    {
        $buyer = $this->createUser('buyer');
        $tech = $this->createUser('technician');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);
        $slot = $this->createSlot($tech);

        $response = $this->actingAs($buyer)->postJson('/api/v1/inspection-jobs', [
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'availability_id' => $slot->id,
            'laptop_address' => 'Test Address',
            'fee' => 150000,
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true);
        $this->assertDatabaseHas('technician_availabilities', ['id' => $slot->id, 'is_booked' => 1]);
    }

    public function test_double_booking_is_prevented(): void
    {
        $buyer1 = $this->createUser('buyer');
        $buyer2 = User::create([
            'name' => 'Buyer 2', 'email' => 'buyer2@test.com',
            'phone' => '081'.rand(10000000, 99999999),
            'password' => bcrypt('password'), 'role' => 'buyer', 'status' => 'active',
        ]);
        $tech = $this->createUser('technician');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);
        $slot = $this->createSlot($tech);

        $this->actingAs($buyer1)->postJson('/api/v1/inspection-jobs', [
            'product_id' => $product->id, 'technician_id' => $tech->id, 'availability_id' => $slot->id, 'fee' => 150000, 'laptop_address' => 'Test Address',
        ])->assertStatus(201);

        // Second booking on same slot should fail
        $this->actingAs($buyer2)->postJson('/api/v1/inspection-jobs', [
            'product_id' => $product->id, 'technician_id' => $tech->id, 'availability_id' => $slot->id, 'fee' => 150000, 'laptop_address' => 'Test Address',
        ])->assertStatus(422);
    }

    public function test_technician_can_accept_job(): void
    {
        $tech = $this->createUser('technician');
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'requested_by' => $buyer->id,
            'schedule_date' => now()->addDay(),
            'fee' => 150000,
            'status' => 'assigned', // Status awal
        ]);

        // Accept logic should check if status is pending in policy, but assigned in service.
        // Let's modify the policy to accept both 'pending' and 'assigned'

        $this->actingAs($tech)->putJson("/api/v1/inspection-jobs/{$job->id}/accept")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'accepted');
    }

    public function test_other_technician_cannot_accept_job(): void
    {
        $tech1 = $this->createUser('technician');
        $tech2 = User::create([
            'name' => 'Tech 2', 'email' => 'tech2@test.com',
            'phone' => '082'.rand(10000000, 99999999),
            'password' => bcrypt('password'), 'role' => 'technician', 'status' => 'active',
        ]);
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech1->id,
            'requested_by' => $buyer->id,
            'schedule_date' => now()->addDay(),
            'fee' => 150000,
            'status' => 'assigned',
        ]);

        $this->actingAs($tech2)->putJson("/api/v1/inspection-jobs/{$job->id}/accept")
            ->assertStatus(403);
    }

    public function test_technician_can_complete_job(): void
    {
        $tech = $this->createUser('technician');
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'requested_by' => $buyer->id,
            'schedule_date' => now()->addDay(),
            'fee' => 150000,
            'status' => 'in_progress',
        ]);

        $this->actingAs($tech)->putJson("/api/v1/inspection-jobs/{$job->id}/complete")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
    }

    // ========== Inspection Report ==========

    public function test_technician_can_create_report(): void
    {
        $tech = $this->createUser('technician');
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'requested_by' => $buyer->id,
            'schedule_date' => now()->addDay(),
            'fee' => 150000,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($tech)->postJson('/api/v1/inspection-reports', [
            'job_id' => $job->id,
            'battery_status' => 'good',
            'screen_status' => 'good',
            'keyboard_status' => 'needs_attention',
            'touchpad_status' => 'good',
            'port_status' => 'good',
            'storage_status' => 'good',
            'ram_status' => 'good',
            'cpu_status' => 'good',
            'physical_status' => 'needs_attention',
            'overall_score' => 85,
            'notes' => 'Kondisi baik.',
            'recommendation' => 'recommended',
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true);

        // Business rule: expires_at = published_at + 14 days
        $report = InspectionReport::where('job_id', $job->id)->first();
        $this->assertNotNull($report->published_at);
        $this->assertNotNull($report->expires_at);
        $this->assertEquals(14, $report->published_at->diffInDays($report->expires_at));

        // Business rule: product.is_spec_verified = true
        $this->assertTrue((bool) $product->fresh()->is_spec_verified);
    }

    public function test_duplicate_report_is_rejected(): void
    {
        $tech = $this->createUser('technician');
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'requested_by' => $buyer->id,
            'schedule_date' => now()->addDay(),
            'fee' => 150000,
            'status' => 'completed',
        ]);

        $reportData = [
            'job_id' => $job->id, 'battery_status' => 'good', 'screen_status' => 'good',
            'keyboard_status' => 'good', 'touchpad_status' => 'good', 'port_status' => 'good',
            'storage_status' => 'good', 'ram_status' => 'good', 'cpu_status' => 'good',
            'physical_status' => 'good', 'overall_score' => 90, 'recommendation' => 'recommended',
        ];

        $this->actingAs($tech)->postJson('/api/v1/inspection-reports', $reportData)->assertStatus(201);
        $this->actingAs($tech)->postJson('/api/v1/inspection-reports', $reportData)->assertStatus(422);
    }

    public function test_report_requires_completed_job(): void
    {
        $tech = $this->createUser('technician');
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'requested_by' => $buyer->id,
            'schedule_date' => now()->addDay(),
            'fee' => 150000,
            'status' => 'assigned', // Not completed
        ]);

        $this->actingAs($tech)->postJson('/api/v1/inspection-reports', [
            'job_id' => $job->id, 'battery_status' => 'good', 'screen_status' => 'good',
            'keyboard_status' => 'good', 'touchpad_status' => 'good', 'port_status' => 'good',
            'storage_status' => 'good', 'ram_status' => 'good', 'cpu_status' => 'good',
            'physical_status' => 'good', 'overall_score' => 90, 'recommendation' => 'recommended',
        ])->assertStatus(422);
    }
}
