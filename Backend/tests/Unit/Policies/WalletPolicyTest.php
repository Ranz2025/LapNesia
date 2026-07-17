<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class WalletPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_user_can_view_own_wallet(): void
    {
        $buyer = $this->createBuyer();
        $this->assertTrue($buyer->can('view', $buyer->wallet));
    }

    public function test_user_cannot_view_other_wallet(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();

        $this->assertFalse($buyer1->can('view', $buyer2->wallet));
    }

    public function test_seller_can_withdraw_from_own_wallet(): void
    {
        $seller = $this->createSeller();
        $this->assertTrue($seller->can('withdraw', $seller->wallet));
    }

    public function test_buyer_cannot_withdraw(): void
    {
        $buyer = $this->createBuyer();
        $this->assertFalse($buyer->can('withdraw', $buyer->wallet));
    }

    public function test_technician_can_withdraw_from_own_wallet(): void
    {
        $tech = $this->createTechnician();
        $this->assertTrue($tech->can('withdraw', $tech->wallet));
    }
}
