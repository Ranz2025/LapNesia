<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_access_dashboard_stats(): void
    {
        $owner = User::create([
            'name'     => 'Platform Owner',
            'email'    => 'owner@lapnesia.com',
            'phone'    => '081234567890',
            'password' => bcrypt('password'),
            'role'     => 'owner',
            'status'   => 'active',
        ]);

        $response = $this->actingAs($owner)
            ->getJson('/api/v1/owner/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'stats' => [
                        'total_users',
                        'total_sellers',
                        'total_buyers',
                        'total_technicians',
                        'new_users_period',
                        'total_orders',
                        'completed_orders',
                        'period_orders',
                        'total_revenue',
                        'period_revenue',
                        'total_wallet_balance',
                        'total_held_balance',
                        'total_withdrawals',
                        'pending_withdrawals',
                    ],
                    'charts' => [
                        'daily_income',
                        'cumulative_revenue',
                        'user_growth',
                    ],
                    'period',
                ],
            ]);
    }
}
