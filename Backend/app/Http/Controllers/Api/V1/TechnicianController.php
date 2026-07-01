<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAvailabilityRequest;
use App\Http\Resources\TechnicianResource;
use App\Models\TechnicianAvailability;
use App\Services\TechnicianService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TechnicianController extends Controller
{
    use ApiResponse;

    public function __construct(protected TechnicianService $service) {}

    public function index(): JsonResponse
    {
        return $this->successResponse(TechnicianResource::collection($this->service->getAll()));
    }

    public function show(string $id): JsonResponse
    {
        $profile = $this->service->findWithUser($id);
        if (!$profile) return $this->errorResponse('Teknisi tidak ditemukan.', 404);
        return $this->successResponse(new TechnicianResource($profile));
    }

    public function availability(string $id): JsonResponse
    {
        $profile = $this->service->findWithUser($id);
        if (!$profile) return $this->errorResponse('Teknisi tidak ditemukan.', 404);
        return $this->successResponse($this->service->getAvailability($profile->id));
    }

    public function storeAvailability(StoreAvailabilityRequest $request): JsonResponse
    {
        $slot = $this->service->storeAvailability($request->user()->id, $request->validated());
        return $this->successResponse($slot, 'Slot tersedia berhasil ditambahkan.', 201);
    }

    public function updateAvailability(StoreAvailabilityRequest $request, string $id): JsonResponse
    {
        $slot = TechnicianAvailability::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($slot->is_booked) {
            return $this->errorResponse('Slot sudah dipesan, tidak dapat diubah.', 422);
        }

        return $this->successResponse(
            $this->service->updateAvailability($slot, $request->validated()),
            'Slot berhasil diperbarui.'
        );
    }

    public function destroyAvailability(Request $request, string $id): JsonResponse
    {
        $slot = TechnicianAvailability::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($slot->is_booked) {
            return $this->errorResponse('Slot sudah dipesan, tidak dapat dihapus.', 422);
        }

        $this->service->deleteAvailability($slot);
        return $this->successResponse(null, 'Slot berhasil dihapus.');
    }
}
