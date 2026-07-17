<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_user_can_register_as_buyer(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Buyer',
            'email' => 'buyer@test.com',
            'phone' => '081234567890',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'buyer',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'buyer@test.com', 'role' => 'buyer', 'status' => 'active']);
        $this->assertDatabaseHas('wallets', ['user_id' => User::where('email', 'buyer@test.com')->first()->id]);
    }

    public function test_user_can_register_as_seller(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Seller',
            'email' => 'seller@test.com',
            'phone' => '081234567891',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'seller',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'seller@test.com', 'role' => 'seller', 'status' => 'active']);
    }

    public function test_technician_registers_with_pending_status(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Tech',
            'email' => 'tech@test.com',
            'phone' => '081234567892',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'technician',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'tech@test.com', 'role' => 'technician', 'status' => 'pending']);
        $this->assertDatabaseHas('technician_profiles', ['user_id' => User::where('email', 'tech@test.com')->first()->id]);
    }

    public function test_registration_requires_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'email', 'phone', 'password', 'role']);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        $this->createUser('buyer', 'active', ['email' => 'dup@test.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Dup User',
            'email' => 'dup@test.com',
            'phone' => '081234567893',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'buyer',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_registration_rejects_invalid_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Bad Role',
            'email' => 'badrole@test.com',
            'phone' => '081234567894',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    public function test_user_can_login(): void
    {
        $this->createUser('buyer', 'active', [
            'email' => 'login@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => ['user', 'access_token', 'token_type']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->createUser('buyer', 'active', [
            'email' => 'wrong@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'wrong@test.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_suspended_user_cannot_login(): void
    {
        $this->createUser('buyer', 'suspended', [
            'email' => 'suspended@test.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'suspended@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = $this->createBuyer(['email' => 'me@test.com']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = $this->createBuyer();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_me(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_logout(): void
    {
        $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
    }
}
