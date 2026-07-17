<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_user_can_view_own_profile(): void
    {
        $user = $this->createBuyer();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/profile');

        $response->assertStatus(200);
    }

    public function test_user_can_update_profile(): void
    {
        $user = $this->createBuyer();

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/profile', [
                'name' => 'Updated Name',
                'phone' => '089876543210',
            ]);

        $response->assertStatus(200);
    }

    public function test_user_can_change_password(): void
    {
        $user = $this->createBuyer(['password' => bcrypt('OldPass123!')]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/profile/password', [
                'current_password' => 'OldPass123!',
                'password' => 'NewPass456!',
                'password_confirmation' => 'NewPass456!',
            ]);

        $response->assertStatus(200);
    }

    public function test_change_password_fails_with_wrong_current(): void
    {
        $user = $this->createBuyer(['password' => bcrypt('OldPass123!')]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/profile/password', [
                'current_password' => 'WrongPassword',
                'password' => 'NewPass456!',
                'password_confirmation' => 'NewPass456!',
            ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_cannot_view_profile(): void
    {
        $this->getJson('/api/v1/profile')->assertUnauthorized();
    }

    public function test_unauthenticated_cannot_update_profile(): void
    {
        $this->putJson('/api/v1/profile', ['name' => 'Hacker'])->assertUnauthorized();
    }
}
