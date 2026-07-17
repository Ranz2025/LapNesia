<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\InspectionPayment;
use App\Services\InspectionPaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\CreatesTestData;
use Tests\TestCase;

class InspectionPaymentServiceTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    protected InspectionPaymentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(InspectionPaymentService::class);
    }

    public function test_create_payment_fails_if_job_not_accepted(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'pending');

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Inspeksi baru bisa dibayar setelah teknisi menerima permintaan.');

        $this->service->create($job);
    }

    public function test_create_payment_returns_existing_pending_payment(): void
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

        $result = $this->service->create($job);

        $this->assertEquals($payment->id, $result->id);
    }
}
