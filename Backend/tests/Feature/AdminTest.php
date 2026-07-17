<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_admin_can_access_dashboard(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200);
    }

    public function test_owner_can_access_admin_dashboard(): void
    {
        $owner = $this->createOwner();

        $response = $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200);
    }

    public function test_seller_cannot_access_admin_dashboard(): void
    {
        $seller = $this->createSeller();

        $response = $this->actingAs($seller, 'sanctum')
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_can_list_technicians(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/technicians');

        $response->assertStatus(200);
    }

    public function test_admin_can_approve_technician(): void
    {
        $admin = $this->createAdmin();
        $tech = $this->createUser('technician', 'pending');

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/technicians/{$tech->id}/approve");

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $tech->id, 'status' => 'active']);
    }

    public function test_admin_can_reject_technician(): void
    {
        $admin = $this->createAdmin();
        $tech = $this->createUser('technician', '2', ['status' => 'pending']);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/technicians/{$tech->id}/reject", [
                'reason' => 'Berkas tidak lengkap',
            ]);

        $response->assertStatus(200);
    }

    public function test_admin_can_list_users(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(200);
    }

    public function test_admin_can_suspend_user(): void
    {
        $admin = $this->createAdmin();
        $user = $this->createBuyer();

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$user->id}/suspend");

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'status' => 'suspended']);
    }

    public function test_admin_can_activate_user(): void
    {
        $admin = $this->createAdmin();
        $user = $this->createUser('buyer', 'suspended');

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$user->id}/activate");

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'status' => 'active']);
    }

    public function test_seller_cannot_suspend_users(): void
    {
        $seller = $this->createSeller();
        $user = $this->createBuyer();

        $response = $this->actingAs($seller, 'sanctum')
            ->putJson("/api/v1/admin/users/{$user->id}/suspend");

        $response->assertStatus(403);
    }

    public function test_owner_can_access_owner_dashboard(): void
    {
        $owner = $this->createOwner();

        $response = $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/owner/dashboard');

        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_owner_dashboard(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/owner/dashboard');

        $response->assertStatus(403);
    }

    public function test_buyer_cannot_access_admin_features(): void
    {
        $buyer = $this->createBuyer();

        $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/admin/technicians')
            ->assertStatus(403);

        $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/admin/users')
            ->assertStatus(403);

        $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/admin/withdrawals')
            ->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_admin(): void
    {
        $this->getJson('/api/v1/admin/dashboard')->assertUnauthorized();
        $this->getJson('/api/v1/admin/technicians')->assertUnauthorized();
        $this->getJson('/api/v1/admin/users')->assertUnauthorized();
    }
}
