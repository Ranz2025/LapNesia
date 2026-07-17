<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class WalletController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['available_balance' => 0, 'held_balance' => 0, 'frozen_balance' => 0]
        );

        Gate::authorize('view', $wallet);

        return $this->successResponse($wallet);
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->first();

        if (! $wallet) {
            return $this->successResponse(['data' => [], 'total' => 0]);
        }

        Gate::authorize('view', $wallet);

        $transactions = WalletTransaction::where('wallet_id', $wallet->id)
            ->latest()
            ->paginate(20);

        return $this->successResponse($transactions);
    }

    public function withdraw(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->firstOrFail();

        Gate::authorize('withdraw', $wallet);

        // Redirect to WithdrawalController@store logic
        return app(WithdrawalController::class)->store($request);
    }
}
