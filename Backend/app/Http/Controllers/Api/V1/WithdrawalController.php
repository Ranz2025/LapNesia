<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWithdrawalRequest;
use App\Http\Resources\WithdrawalCollection;
use App\Http\Resources\WithdrawalResource;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class WithdrawalController extends Controller
{
    use ApiResponse;

    public function __construct(protected WithdrawalService $service) {}

    public function index(Request $request): JsonResponse
    {
        if (Gate::denies('viewAny', Withdrawal::class)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        $user = $request->user();
        $query = Withdrawal::with(['wallet', 'approver']);

        // Filter hanya withdrawal milik user
        if (in_array($user->role, ['seller', 'technician'])) {
            $query->whereHas('wallet', fn ($q) => $q->where('user_id', $user->id));
        }

        $withdrawals = $query->latest()->paginate(15);

        return $this->successResponse(new WithdrawalCollection($withdrawals));
    }

    public function store(StoreWithdrawalRequest $request): JsonResponse
    {
        if (Gate::denies('create', Withdrawal::class)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        try {
            $wallet = Wallet::where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            $withdrawal = $this->service->create($wallet, $request->validated());

            return $this->successResponse(new WithdrawalResource($withdrawal->load(['wallet', 'approver'])), 'Penarikan dana berhasil diproses dan disetujui.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $withdrawal = Withdrawal::with(['wallet', 'approver'])->findOrFail($id);

        if (Gate::denies('view', $withdrawal)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse(new WithdrawalResource($withdrawal));
    }
}