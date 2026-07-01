<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use App\Notifications\ResetPasswordNotification;
use Tests\TestCase;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'user@lapnesia.com',
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'user@lapnesia.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        Notification::assertSentTo(
            $user,
            ResetPasswordNotification::class
        );
    }

    public function test_reset_password_succeeds_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'user@lapnesia.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'user@lapnesia.com',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
    }
}
