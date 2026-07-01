<?php

namespace Tests\Feature;

use App\Events\OrderCreatedEvent;
use App\Events\PaymentSuccessEvent;
use App\Events\WithdrawalApprovedEvent;
use App\Events\WithdrawalRejectedEvent;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        $user = User::create([
            'name'     => ucfirst($role),
            'email'    => $role . '@notif-test.com',
            'phone'    => '08' . rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role'     => $role,
            'status'   => 'active',
        ]);
        Wallet::create(['user_id' => $user->id, 'available_balance' => 0, 'held_balance' => 0]);
        return $user;
    }

    // ========== Get Notifications ==========

    public function test_user_can_get_notifications(): void
    {
        $user = $this->createUser('buyer');

        DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('data.data', fn ($data) => count($data) > 0)
            ->assertJsonPath('data.unread_count', 1);
    }

    public function test_user_can_get_unread_notifications(): void
    {
        $user = $this->createUser('buyer');

        DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/notifications/unread');

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data.data')));
    }

    public function test_user_gets_unread_count(): void
    {
        $user = $this->createUser('buyer');

        DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('data.unread_count', 2);
    }

    // ========== Mark as Read ==========

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = $this->createUser('buyer');

        $notification = DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        $response = $this->actingAs($user)->putJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_read', true);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_can_mark_all_as_read(): void
    {
        $user = $this->createUser('buyer');

        DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/notifications/read-all');

        $response->assertStatus(200)
            ->assertJsonPath('data.marked', 2);

        $this->assertEquals(0, $user->notifications()->whereNull('read_at')->count());
    }

    // ========== Authorization ==========

    public function test_user_cannot_see_other_users_notifications(): void
    {
        $user1 = $this->createUser('buyer');
        $user2 = $this->createUser('seller');

        $notification = DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user1->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        $this->actingAs($user2)->putJson("/api/v1/notifications/{$notification->id}/read")
            ->assertStatus(404); // Returns 404 because notification doesn't belong to user2
    }

    public function test_unauthenticated_cannot_access_notifications(): void
    {
        $this->getJson('/api/v1/notifications')->assertStatus(401);
        $this->getJson('/api/v1/notifications/unread')->assertStatus(401);
        $this->putJson('/api/v1/notifications/read-all')->assertStatus(401);
    }

    // ========== Event Dispatching ==========

    public function test_withdrawal_approved_event_sends_notification(): void
    {
        $seller = $this->createUser('seller');
        $wallet = Wallet::where('user_id', $seller->id)->first();

        $withdrawal = Withdrawal::create([
            'wallet_id'      => $wallet->id,
            'amount'         => 1000000,
            'bank_name'      => 'BCA',
            'account_name'   => 'Test',
            'account_number' => '123',
            'status'         => 'approved',
        ]);

        WithdrawalApprovedEvent::dispatch($withdrawal);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id'   => $seller->id,
            'notifiable_type' => User::class,
        ]);
    }

    public function test_withdrawal_rejected_event_sends_notification(): void
    {
        $seller = $this->createUser('seller');
        $wallet = Wallet::where('user_id', $seller->id)->first();

        $withdrawal = Withdrawal::create([
            'wallet_id'      => $wallet->id,
            'amount'         => 1000000,
            'bank_name'      => 'BCA',
            'account_name'   => 'Test',
            'account_number' => '123',
            'status'         => 'rejected',
            'rejection_reason' => 'Data tidak sesuai',
        ]);

        WithdrawalRejectedEvent::dispatch($withdrawal);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id'   => $seller->id,
            'notifiable_type' => User::class,
        ]);
    }

    // ========== Pagination ==========

    public function test_notifications_are_paginated(): void
    {
        $user = $this->createUser('buyer');

        for ($i = 0; $i < 20; $i++) {
            DatabaseNotification::create([
                'id'                => \Illuminate\Support\Str::uuid(),
                'type'              => 'order_created',
                'notifiable_type'   => User::class,
                'notifiable_id'     => $user->id,
                'data'              => json_encode(['message' => "Test $i"]),
                'read_at'           => null,
            ]);
        }

        $response = $this->actingAs($user)->getJson('/api/v1/notifications');

        $response->assertStatus(200);
        $this->assertEquals(15, count($response->json('data.data')));
    }

    // ========== Not Found ==========

    public function test_marking_nonexistent_notification_as_read_returns_404(): void
    {
        $user = $this->createUser('buyer');

        $this->actingAs($user)->putJson('/api/v1/notifications/invalid-id/read')
            ->assertStatus(404);
    }

    // ========== Response Format ==========

    public function test_notification_resource_contains_required_fields(): void
    {
        $user = $this->createUser('buyer');

        $notification = DatabaseNotification::create([
            'id'                => \Illuminate\Support\Str::uuid(),
            'type'              => 'order_created',
            'notifiable_type'   => User::class,
            'notifiable_id'     => $user->id,
            'data'              => json_encode(['message' => 'Test']),
            'read_at'           => null,
        ]);

        $response = $this->actingAs($user)->putJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJsonPath('data.type', 'order_created')
            ->assertJsonPath('data.is_read', true)
            ->assertJsonPath('data.read_at', fn ($val) => $val !== null);
    }
}
