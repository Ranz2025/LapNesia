<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Http\Resources\WalletTransactionResource;
use App\Models\Wallet;
use App\Services\WalletService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    use ApiResponse;

    public function __construct(protected WalletService $service) {}

    public function show(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->firstOrFail();
        return $this->successResponse(new WalletResource($wallet));
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->firstOrFail();

        $txns = $wallet->transactions()->latest()->paginate(20);

        return $this->successResponse(
            WalletTransactionResource::collection($txns)->response()->getData(true)
        );
    }

    public function withdraw(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:50000',
        ]);

        try {
            $wallet = Wallet::where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            $withdrawalService = app(\App\Services\WithdrawalService::class);
            $withdrawal = $withdrawalService->create($wallet, [
                'amount'         => $request->amount,
                'bank_name'      => $request->input('bank_name', 'Dummy Bank'),
                'account_name'   => $request->input('account_name', $request->user()->name),
                'account_number' => $request->input('account_number', '0000000000'),
            ]);

            return $this->successResponse($withdrawal, 'Withdrawal berhasil dibuat.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
