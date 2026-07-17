<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Tech E2E',
            'email' => 'tech@e2e.test',
            'phone' => '081234567892',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'technician',
        ]);
        $techId = $response->json('data.user.id');
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $admin->createToken('admin-token')->plainTextToken;
        $this->withToken($adminToken)->putJson("/api/v1/admin/technicians/{$techId}/approve")->assertStatus(200);
        $this->withHeaders(['Authorization' => '']); // REMOVE AUTHORIZATION

        $loginRes = $this->postJson('/api/v1/auth/login', [
            'email' => 'tech@e2e.test', 'password' => 'password123',
        ]);
        $techToken = $loginRes->json('data.access_token');
        dump('Tech Token user id: '.$loginRes->json('data.user.id'));
        dump('Admin user id: '.$admin->id);

        $res = $this->postJson('/api/v1/technician/availability', [
            'available_date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ], ['Authorization' => 'Bearer '.$techToken]);
        dump($res->json());
    }
}
