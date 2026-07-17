<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Services\OrderService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(protected OrderService $service) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Order::class);

        $user = $request->user();
        $query = Order::with(['product.images', 'buyer:id,name', 'seller:id,name', 'payments']);

        if ($user->role === 'buyer') {
            $query->where('buyer_id', $user->id);
        } elseif ($user->role === 'seller') {
            $query->where('seller_id', $user->id);
        }
        // admin/owner see all

        $orders = $query->latest()->paginate(15);

        return $this->successResponse($orders);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = Order::with(['product.images', 'buyer:id,name,email,phone', 'seller:id,name,email,phone', 'payments'])->findOrFail($id);

        Gate::authorize('view', $order);

        return $this->successResponse($order);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        Gate::authorize('create', Order::class);

        try {
            $order = $this->service->create($request->validated(), $request->user()->id);

            return $this->successResponse($order->load(['product', 'payments']), 'Order berhasil dibuat.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        Gate::authorize('cancel', $order);

        try {
            $order = $this->service->cancel($order);

            return $this->successResponse($order, 'Order berhasil dibatalkan.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function ship(Request $request, string $id): JsonResponse
    {
        $request->validate(['resi_number' => 'required|string|max:100']);

        $order = Order::findOrFail($id);

        Gate::authorize('ship', $order);

        try {
            $order = $this->service->ship($order, $request->resi_number);

            return $this->successResponse($order, 'Order berhasil dikirim.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function confirmReceived(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        Gate::authorize('confirmReceived', $order);

        try {
            $order = $this->service->confirmReceived($order);

            return $this->successResponse($order, 'Pesanan dikonfirmasi telah diterima.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateShippingAddress(Request $request, string $id): JsonResponse
    {
        $request->validate(['shipping_address' => 'required|string|max:500']);

        $order = Order::findOrFail($id);

        Gate::authorize('updateShippingAddress', $order);

        $order->update(['shipping_address' => $request->shipping_address]);

        return $this->successResponse($order->fresh(), 'Alamat pengiriman berhasil diperbarui.');
    }
}
