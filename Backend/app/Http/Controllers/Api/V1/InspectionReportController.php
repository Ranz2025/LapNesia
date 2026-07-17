<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInspectionReportRequest;
use App\Http\Resources\InspectionReportResource;
use App\Models\InspectionReport;
use App\Services\InspectionReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class InspectionReportController extends Controller
{
    use ApiResponse;

    public function __construct(protected InspectionReportService $service) {}

    public function store(StoreInspectionReportRequest $request): JsonResponse
    {
        Gate::authorize('create', InspectionReport::class);

        try {
            $report = $this->service->create($request->validated(), $request->user()->id);

            return $this->successResponse(
                new InspectionReportResource($report->load(['job.product', 'job.technician', 'job.requester', 'photos'])),
                'Laporan inspeksi berhasil dibuat.',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $report = InspectionReport::with(['job.product', 'job.technician', 'job.requester', 'photos'])->findOrFail($id);

        Gate::authorize('view', $report);

        return $this->successResponse(new InspectionReportResource($report));
    }

    public function downloadPdf(Request $request, string $id): mixed
    {
        $report = InspectionReport::with('job')->findOrFail($id);

        Gate::authorize('downloadPdf', $report);

        try {
            return $this->service->downloadPdf($report);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
