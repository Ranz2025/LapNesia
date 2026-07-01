<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInspectionJobRequest;
use App\Http\Resources\InspectionJobResource;
use App\Models\InspectionJob;
use App\Services\InspectionJobService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InspectionJobController extends Controller
{
    use ApiResponse;

    public function __construct(protected InspectionJobService $service) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $jobs = \App\Models\InspectionJob::with(['product.seller', 'technician', 'requester', 'report', 'payment'])
            ->when($user->role === 'buyer', fn($q) => $q->where('requested_by', $user->id))
            ->when($user->role === 'technician', fn($q) => $q->where('technician_id', $user->id))
            ->latest()
            ->paginate(15);

        return $this->successResponse([
            'data' => InspectionJobResource::collection($jobs),
            'meta' => [
                'total' => $jobs->total(),
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
            ],
        ]);
    }

    public function store(StoreInspectionJobRequest $request): JsonResponse
    {
        $job = $this->service->create($request->validated(), $request->user()->id);
        return $this->successResponse(new InspectionJobResource($job), 'Permintaan inspeksi berhasil dibuat.', 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $job = $this->service->find($id);
        if (!$job) return $this->errorResponse('Inspection job tidak ditemukan.', 404);

        $user     = $request->user();
        $sellerId = $job->product?->user_id ?? $job->product?->seller_id;

        $canView = (int) $user->id === (int) $job->requested_by
            || (int) $user->id === (int) $job->technician_id
            || ($sellerId && (int) $user->id === (int) $sellerId)
            || in_array($user->role, ['admin', 'owner']);

        if (!$canView) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse(new InspectionJobResource($job));
    }

    public function accept(Request $request, string $id): JsonResponse
    {
        $job = InspectionJob::findOrFail($id);

        if ((int) $job->technician_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki izin untuk menerima job ini.', 403);
        }

        $job = $this->service->accept($job, $request->user()->id);
        return $this->successResponse(new InspectionJobResource($job), 'Job berhasil diterima. Buyer diminta melakukan pembayaran.');
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        $job = InspectionJob::findOrFail($id);

        if ((int) $job->technician_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki izin untuk menolak job ini.', 403);
        }

        $job = $this->service->reject($job, $request->user()->id);
        return $this->successResponse(new InspectionJobResource($job), 'Job berhasil ditolak. Buyer telah diberi notifikasi.');
    }

    public function complete(Request $request, string $id): JsonResponse
    {
        $job = InspectionJob::findOrFail($id);

        if ((int) $job->technician_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki izin untuk menyelesaikan job ini.', 403);
        }

        $job = $this->service->complete($job);
        return $this->successResponse(new InspectionJobResource($job), 'Job berhasil diselesaikan.');
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $job = InspectionJob::findOrFail($id);
        try {
            $job = $this->service->cancel($job, (int) $request->user()->id);
            return $this->successResponse(new InspectionJobResource($job), 'Inspeksi berhasil dibatalkan.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse(collect($e->errors())->flatten()->first(), 422);
        }
    }

    public function setSchedule(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'technician_schedule_date'  => 'required|date|after_or_equal:today',
            'technician_schedule_time'  => 'required|date_format:H:i',
            'technician_schedule_notes' => 'nullable|string|max:500',
        ]);

        $job = InspectionJob::findOrFail($id);

        if ((int) $job->technician_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda bukan teknisi untuk job ini.', 403);
        }

        $job = $this->service->setSchedule(
            $job,
            $request->user()->id,
            $request->only(['technician_schedule_date', 'technician_schedule_time', 'technician_schedule_notes'])
        );

        return $this->successResponse(new InspectionJobResource($job), 'Jadwal berhasil diinput.');
    }
}
