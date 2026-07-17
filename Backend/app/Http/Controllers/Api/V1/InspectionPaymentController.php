<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InspectionPaymentResource;
use App\Models\InspectionJob;
use App\Models\InspectionPayment;
use App\Services\InspectionPaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class InspectionPaymentController extends Controller
{
    use ApiResponse;

    public function __construct(protected InspectionPaymentService $service) {}

    public function pay(Request $request, string $jobId): JsonResponse
    {
        $job = InspectionJob::with(['requester', 'technician'])->findOrFail($jobId);

        Gate::authorize('pay', $job);

        try {
            $payment = $this->service->create($job);

            return $this->successResponse(
                new InspectionPaymentResource($payment->load('job.product', 'job.technician', 'job.requester')),
                'Payment inspeksi berhasil dibuat.',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $payment = InspectionPayment::with(['job.product', 'job.technician', 'job.requester'])->findOrFail($id);

        // Check ownership or admin
        if ((int) $payment->buyer_id !== (int) $request->user()->id
            && ! in_array($request->user()->role, ['admin', 'owner'])) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse(new InspectionPaymentResource($payment));
    }
}
