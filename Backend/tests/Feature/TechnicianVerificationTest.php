<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TechnicianVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@lapnesia.com',
            'phone'    => '08' . rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role'     => 'admin',
            'status'   => 'active',
        ]);
    }

    private function createTechnician(string $status = 'pending'): User
    {
        return User::create([
            'name'     => 'Tech User',
            'email'    => 'tech@lapnesia.com',
            'phone'    => '08' . rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role'     => 'technician',
            'status'   => $status,
        ]);
    }

    public function test_admin_can_approve_technician(): void
    {
        $admin = $this->createAdmin();
        $tech  = $this->createTechnician('pending');

        $response = $this->actingAs($admin)
            ->putJson("/api/v1/admin/technicians/{$tech->id}/approve");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertEquals('active', $tech->fresh()->status);
        $this->assertCount(1, $tech->notifications);
    }

    public function test_admin_can_reject_technician(): void
    {
        $admin = $this->createAdmin();
        $tech  = $this->createTechnician('pending');

        $response = $this->actingAs($admin)
            ->putJson("/api/v1/admin/technicians/{$tech->id}/reject", [
                'reason' => 'Dokumen sertifikasi tidak valid.',
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertEquals('suspended', $tech->fresh()->status);
        $this->assertCount(1, $tech->notifications);
    }
}
