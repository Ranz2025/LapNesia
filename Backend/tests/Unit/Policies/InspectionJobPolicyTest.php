<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\InspectionJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class InspectionJobPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_buyer_can_create_inspection(): void
    {
        $buyer = $this->createBuyer();
        $this->assertTrue($buyer->can('create', InspectionJob::class));
    }

    public function test_technician_cannot_create_inspection(): void
    {
        $tech = $this->createTechnician();
        $this->assertFalse($tech->can('create', InspectionJob::class));
    }

    public function test_technician_can_accept_own_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'pending');

        $this->assertTrue($tech->can('accept', $job));
    }

    public function test_other_technician_cannot_accept_job(): void
    {
        $buyer = $this->createBuyer();
        $tech1 = $this->createTechnician();
        $tech2 = $this->createTechnician();
        $job = $this->createJob($buyer, $tech1, 'pending');

        $this->assertFalse($tech2->can('accept', $job));
    }

    public function test_technician_can_reject_own_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'pending');

        $this->assertTrue($tech->can('reject', $job));
    }

    public function test_technician_can_complete_in_progress_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'in_progress');

        $this->assertTrue($tech->can('complete', $job));
    }

    public function test_requester_can_view_own_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech);

        $this->assertTrue($buyer->can('view', $job));
    }

    public function test_technician_can_view_assigned_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech);

        $this->assertTrue($tech->can('view', $job));
    }

    public function test_other_user_cannot_view_job(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer1, $tech);

        $this->assertFalse($buyer2->can('view', $job));
    }

    public function test_requester_can_cancel_pending_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'pending');

        $this->assertTrue($buyer->can('cancel', $job));
    }
}
