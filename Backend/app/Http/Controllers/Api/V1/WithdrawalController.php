<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
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
        Gate::authorize('viewAny', Withdrawal::class);

        $user = $request->user();
        $query = Withdrawal::with(['wallet', 'approver']);

        // Filter hanya withdrawal milik user
        if (in_array($user->role, ['seller', 'technician'])) {
            $query->whereHas('wallet', fn ($q) => $q->where('user_id', $user->id));
        }

        $withdrawals = $query->latest()->paginate(15);

        return $this->successResponse(new WithdrawalCollection($withdrawals));
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Withdrawal::class);

        // Manual validation based on StoreWithdrawalRequest rules
        $request->validate([
            'amount' => 'required|numeric|min:10000',
            'bank_name' => 'required|string|max:255',
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
        ]);

        try {
            $wallet = Wallet::where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            $withdrawal = $this->service->create($wallet, $request->only(['amount', 'bank_name', 'account_name', 'account_number']));

            return $this->successResponse(new WithdrawalResource($withdrawal->load(['wallet', 'approver'])), 'Permintaan penarikan dana berhasil dibuat dan menunggu persetujuan.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $withdrawal = Withdrawal::with(['wallet', 'approver'])->findOrFail($id);

        Gate::authorize('view', $withdrawal);

        return $this->successResponse(new WithdrawalResource($withdrawal));
    }
}
