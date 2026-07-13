<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInspectionReportRequest;
use App\Http\Resources\InspectionReportResource;
use App\Models\InspectionReport;
use App\Services\InspectionPdfService;
use App\Services\InspectionReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class InspectionReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected InspectionReportService $service,
        protected InspectionPdfService $pdfService,
    ) {}

    public function store(StoreInspectionReportRequest $request): JsonResponse
    {
        $report = $this->service->create($request->validated(), $request->user()->id);

        // Auto-generate PDF after report is created
        try {
            $this->pdfService->generate($report);
        } catch (\Throwable $e) {
            \Log::warning('PDF generation failed: ' . $e->getMessage());
        }

        return $this->successResponse(new InspectionReportResource($report), 'Laporan inspeksi berhasil dibuat.', 201);
    }

    public function show(string $id): JsonResponse
    {
        $report = $this->service->find($id);
        if (!$report) return $this->errorResponse('Laporan tidak ditemukan.', 404);

        if (Gate::denies('view', $report)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse(new InspectionReportResource($report->load('technician')));
    }

    public function downloadPdf(Request $request, string $id)
    {
        $report = InspectionReport::with(['job', 'technician'])->findOrFail($id);

        // Hanya pembeli yang memesan, teknisi yang mengerjakan, atau admin/owner
        if (Gate::denies('downloadPdf', $report)) {
            return $this->errorResponse('Anda tidak memiliki akses untuk mengunduh laporan ini.', 403);
        }

        $path = $report->pdf_url;

        if (!$path || !Storage::disk('public')->exists($path)) {
            try {
                $path = $this->pdfService->generate($report);
            } catch (\Throwable $e) {
                return $this->errorResponse('Gagal membuat PDF: ' . $e->getMessage(), 500);
            }
        }

        return response(Storage::disk('public')->get($path), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="laporan-inspeksi-' . $id . '.pdf"',
        ]);
    }
}
