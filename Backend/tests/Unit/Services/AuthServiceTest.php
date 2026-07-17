<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AuthService::class);
    }

    public function test_register_creates_user_with_wallet(): void
    {
        [$user, $token] = $this->service->register([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => 'Password123!',
            'role' => 'buyer',
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('buyer', $user->role);
        $this->assertEquals('active', $user->status);
        $this->assertNotNull($user->wallet);
        $this->assertNotEmpty($token);
    }

    public function test_register_technician_gets_pending_status(): void
    {
        [$user, $token] = $this->service->register([
            'name' => 'Test Tech',
            'email' => 'tech@example.com',
            'phone' => '081234567891',
            'password' => 'Password123!',
            'role' => 'technician',
        ]);

        $this->assertEquals('pending', $user->status);
        $this->assertNotNull($user->technicianProfile);
        $this->assertEquals(150000, $user->technicianProfile->inspection_fee);
    }

    public function test_login_returns_user_and_token(): void
    {
        $this->service->register([
            'name' => 'Test User',
            'email' => 'login@example.com',
            'phone' => '081234567892',
            'password' => 'Password123!',
            'role' => 'buyer',
        ]);

        [$user, $token] = $this->service->login([
            'email' => 'login@example.com',
            'password' => 'Password123!',
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertNotEmpty($token);
    }

    public function test_login_fails_with_wrong_credentials(): void
    {
        $this->service->register([
            'name' => 'Test User',
            'email' => 'wrong@example.com',
            'phone' => '081234567893',
            'password' => 'Password123!',
            'role' => 'buyer',
        ]);

        $this->expectException(ValidationException::class);
        $this->service->login([
            'email' => 'wrong@example.com',
            'password' => 'WrongPassword',
        ]);
    }

    public function test_login_fails_for_suspended_user(): void
    {
        $this->service->register([
            'name' => 'Suspended User',
            'email' => 'suspended@example.com',
            'phone' => '081234567894',
            'password' => 'Password123!',
            'role' => 'buyer',
        ]);

        User::where('email', 'suspended@example.com')->update(['status' => 'suspended']);

        $this->expectException(ValidationException::class);
        $this->service->login([
            'email' => 'suspended@example.com',
            'password' => 'Password123!',
        ]);
    }

    public function test_login_fails_for_banned_user(): void
    {
        $this->service->register([
            'name' => 'Banned User',
            'email' => 'banned@example.com',
            'phone' => '081234567895',
            'password' => 'Password123!',
            'role' => 'buyer',
        ]);

        User::where('email', 'banned@example.com')->update(['status' => 'banned']);

        $this->expectException(ValidationException::class);
        $this->service->login([
            'email' => 'banned@example.com',
            'password' => 'Password123!',
        ]);
    }

    public function test_login_updates_last_login_at(): void
    {
        $this->service->register([
            'name' => 'Login Track',
            'email' => 'track@example.com',
            'phone' => '081234567896',
            'password' => 'Password123!',
            'role' => 'buyer',
        ]);

        [$user] = $this->service->login([
            'email' => 'track@example.com',
            'password' => 'Password123!',
        ]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }
}
