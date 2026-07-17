<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\InspectionPayment;
use App\Models\User;
use App\Services\InspectionPaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\CreatesTestData;
use Tests\TestCase;

class InspectionPaymentTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_buyer_can_pay_accepted_inspection_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();

        $job = $this->createJob($buyer, $tech, 'accepted');

        $this->mock(InspectionPaymentService::class, function ($mock) use ($job, $buyer, $tech) {
            $payment = new InspectionPayment([
                'id' => (string) Str::uuid(),
                'inspection_job_id' => $job->id,
                'buyer_id' => $buyer->id,
                'technician_id' => $tech->id,
                'payment_gateway' => 'midtrans',
                'snap_token' => 'dummy-snap-token',
                'snap_redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/dummy-token',
                'gross_amount' => 150000,
                'status' => 'pending',
            ]);
            $mock->shouldReceive('create')->once()->andReturn($payment);
        });

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/inspection-jobs/{$job->id}/pay");

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'inspection_job_id',
                    'snap_token',
                    'snap_redirect_url',
                    'status',
                ],
            ]);
    }

    public function test_unauthorized_user_cannot_pay(): void
    {
        $buyer = $this->createBuyer();
        $otherBuyer = User::factory()->create(['role' => 'buyer']);
        $tech = $this->createTechnician();

        $job = $this->createJob($buyer, $tech, 'accepted');

        $response = $this->actingAs($otherBuyer, 'sanctum')
            ->postJson("/api/v1/inspection-jobs/{$job->id}/pay");

        $response->assertStatus(403);
    }

    public function test_buyer_can_view_own_payment(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'accepted');

        $payment = InspectionPayment::create([
            'id' => (string) Str::uuid(),
            'inspection_job_id' => $job->id,
            'buyer_id' => $buyer->id,
            'technician_id' => $tech->id,
            'payment_gateway' => 'midtrans',
            'snap_token' => 'token123',
            'snap_redirect_url' => 'url',
            'gross_amount' => 150000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($buyer, 'sanctum')
            ->getJson("/api/v1/inspection-payments/{$payment->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $payment->id);
    }

    public function test_admin_can_view_payment(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'accepted');

        $payment = InspectionPayment::create([
            'id' => (string) Str::uuid(),
            'inspection_job_id' => $job->id,
            'buyer_id' => $buyer->id,
            'technician_id' => $tech->id,
            'payment_gateway' => 'midtrans',
            'snap_token' => 'token123',
            'snap_redirect_url' => 'url',
            'gross_amount' => 150000,
            'status' => 'pending',
        ]);

        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/inspection-payments/{$payment->id}");

        $response->assertStatus(200);
    }

    public function test_other_user_cannot_view_payment(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'accepted');

        $payment = InspectionPayment::create([
            'id' => (string) Str::uuid(),
            'inspection_job_id' => $job->id,
            'buyer_id' => $buyer->id,
            'technician_id' => $tech->id,
            'payment_gateway' => 'midtrans',
            'snap_token' => 'token123',
            'snap_redirect_url' => 'url',
            'gross_amount' => 150000,
            'status' => 'pending',
        ]);

        $otherUser = $this->createBuyer();

        $response = $this->actingAs($otherUser, 'sanctum')
            ->getJson("/api/v1/inspection-payments/{$payment->id}");

        $response->assertStatus(403);
    }
}
