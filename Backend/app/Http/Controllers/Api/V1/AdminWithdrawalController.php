<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WithdrawalCollection;
use App\Http\Resources\WithdrawalResource;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminWithdrawalController extends Controller
{
    use ApiResponse;

    public function __construct(protected WithdrawalService $service) {}

    public function index(Request $request): JsonResponse
    {
        if (Gate::denies('approve', Withdrawal::class)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        $withdrawals = Withdrawal::with(['wallet.user', 'approver'])
            ->latest()
            ->paginate(20);

        return $this->successResponse(new WithdrawalCollection($withdrawals));
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        if (Gate::denies('approve', Withdrawal::class)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        try {
            $withdrawal = Withdrawal::with('wallet')->findOrFail($id);
            $withdrawal = $this->service->approve($withdrawal, $request->user());

            return $this->successResponse(new WithdrawalResource($withdrawal->load(['wallet', 'approver'])), 'Withdrawal berhasil disetujui.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        if (Gate::denies('reject', Withdrawal::class)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        try {
            $withdrawal = Withdrawal::with('wallet')->findOrFail($id);
            $withdrawal = $this->service->reject($withdrawal, $request->user(), $request->rejection_reason);

            return $this->successResponse(new WithdrawalResource($withdrawal->load(['wallet', 'approver'])), 'Withdrawal berhasil ditolak.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}