<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\TechnicianAvailability;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class TechnicianTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_public_can_list_technicians(): void
    {
        $this->createTechnician();

        $response = $this->getJson('/api/v1/technicians');
        $response->assertStatus(200);
    }

    public function test_public_can_view_technician(): void
    {
        $tech = $this->createTechnician();

        $response = $this->getJson("/api/v1/technicians/{$tech->id}");
        $response->assertStatus(200);
    }

    public function test_public_can_view_technician_availability(): void
    {
        $tech = $this->createTechnician();

        $response = $this->getJson("/api/v1/technicians/{$tech->id}/availability");
        $response->assertStatus(200);
    }

    public function test_technician_can_add_availability(): void
    {
        $tech = $this->createTechnician();

        $response = $this->actingAs($tech, 'sanctum')
            ->postJson('/api/v1/technician/availability', [
                'date' => now()->addDays(3)->format('Y-m-d'),
                'available_date' => now()->addDay()->format('Y-m-d'),
                'start_time' => '09:00',
                'end_time' => '17:00',
            ]);

        $response->assertStatus(201);
    }

    public function test_buyer_cannot_add_availability(): void
    {
        $buyer = $this->createBuyer();

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson('/api/v1/technician/availability', [
                'date' => now()->addDays(3)->format('Y-m-d'),
                'available_date' => now()->addDay()->format('Y-m-d'),
                'start_time' => '09:00',
                'end_time' => '17:00',
            ]);

        $response->assertStatus(403);
    }

    public function test_technician_can_update_availability(): void
    {
        $tech = $this->createTechnician();

        $slot = TechnicianAvailability::create([
            'user_id' => $tech->id,
            'date' => now()->addDays(3)->format('Y-m-d'),
            'available_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $response = $this->actingAs($tech, 'sanctum')
            ->putJson("/api/v1/technician/availability/{$slot->id}", [
                'available_date' => now()->addDays(4)->format('Y-m-d'),
                'start_time' => '10:00',
                'end_time' => '18:00',
            ]);

        $response->assertStatus(200);
    }

    public function test_technician_can_delete_availability(): void
    {
        $tech = $this->createTechnician();

        $slot = TechnicianAvailability::create([
            'user_id' => $tech->id,
            'date' => now()->addDays(3)->format('Y-m-d'),
            'available_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);

        $response = $this->actingAs($tech, 'sanctum')
            ->deleteJson("/api/v1/technician/availability/{$slot->id}");

        $response->assertStatus(200);
    }

    public function test_unauthenticated_cannot_add_availability(): void
    {
        $this->postJson('/api/v1/technician/availability', [])
            ->assertUnauthorized();
    }
}
