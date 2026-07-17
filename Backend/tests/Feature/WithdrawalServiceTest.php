<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

/**
 * Feature tests for withdrawal endpoints.
 * Unit tests for WithdrawalService are in Tests\Unit\Services\WithdrawalServiceTest.
 */
class WithdrawalServiceTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_seller_can_view_own_withdrawals(): void
    {
        $seller = $this->createSeller();

        $response = $this->actingAs($seller, 'sanctum')
            ->getJson('/api/v1/withdrawals');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_cannot_access_withdrawals(): void
    {
        $this->getJson('/api/v1/withdrawals')->assertUnauthorized();
    }
}
