<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductReturn;
use App\Services\ReturnService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReturnController extends Controller
{
    use ApiResponse;

    public function __construct(protected ReturnService $service) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', ProductReturn::class);

        $user = $request->user();
        $query = ProductReturn::with(['order.product', 'buyer:id,name', 'seller:id,name']);

        if ($user->role === 'buyer') {
            $query->where('buyer_id', $user->id);
        } elseif ($user->role === 'seller') {
            $query->where('seller_id', $user->id);
        }

        return $this->successResponse($query->latest()->paginate(15));
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $return = ProductReturn::with(['order.product', 'buyer:id,name', 'seller:id,name'])->findOrFail($id);

        Gate::authorize('view', $return);

        return $this->successResponse($return);
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', ProductReturn::class);

        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'reason' => 'required|string|max:1000',
        ]);

        try {
            $order = Order::findOrFail($request->order_id);
            $return = $this->service->request($order, $request->user()->id, $request->reason);

            return $this->successResponse($return->load(['order', 'buyer', 'seller']), 'Pengembalian berhasil diajukan.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $return = ProductReturn::findOrFail($id);

        Gate::authorize('updateStatus', $return);

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'seller_notes' => 'nullable|string|max:500',
        ]);

        try {
            $return = $this->service->updateStatus($return, $request->status, $request->seller_notes);

            return $this->successResponse($return, 'Status pengembalian berhasil diperbarui.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function submitResi(Request $request, string $id): JsonResponse
    {
        $return = ProductReturn::findOrFail($id);

        Gate::authorize('submitResi', $return);

        $request->validate(['return_resi' => 'required|string|max:100']);

        try {
            $return = $this->service->submitResi($return, $request->user()->id, $request->return_resi);

            return $this->successResponse($return, 'Resi pengembalian berhasil disubmit.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /** Admin: list all returns */
    public function adminIndex(Request $request): JsonResponse
    {
        Gate::authorize('complete', ProductReturn::class);

        $returns = $this->service->getAllReturns($request->get('per_page', 15));

        return $this->successResponse($returns);
    }

    /** Admin: complete return */
    public function adminComplete(Request $request, string $id): JsonResponse
    {
        $return = ProductReturn::findOrFail($id);

        Gate::authorize('complete', ProductReturn::class);

        $request->validate(['admin_notes' => 'nullable|string|max:500']);

        try {
            $return = $this->service->completeReturn($return, $request->admin_notes);

            return $this->successResponse($return, 'Pengembalian berhasil diselesaikan.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
