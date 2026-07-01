<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderCollection;
use App\Http\Resources\OrderResource;
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

    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->service->create($request->validated(), $request->user()->id);
            return $this->successResponse(new OrderResource($order->load(['product', 'buyer', 'seller'])), 'Order berhasil dibuat.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function index(Request $request): JsonResponse
    {
        if (Gate::denies('viewAny', Order::class)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        $user = $request->user();
        $query = Order::with(['product', 'buyer', 'seller']);

        // Authorization filter
        if (in_array($user->role, ['buyer'])) {
            $query->where('buyer_id', $user->id);
        } elseif (in_array($user->role, ['seller'])) {
            $query->where('seller_id', $user->id);
        }

        $orders = $query->latest()->paginate(15);

        return $this->successResponse(new OrderCollection($orders));
    }

    public function show(string $id): JsonResponse
    {
        $order = Order::with(['product', 'buyer', 'seller'])->findOrFail($id);

        if (Gate::denies('view', $order)) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse(new OrderResource($order));
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        if (Gate::denies('cancel', $order)) {
            return $this->errorResponse('Anda tidak dapat membatalkan order ini.', 403);
        }

        $order = $this->service->cancel($order);
        return $this->successResponse(new OrderResource($order->load(['product', 'buyer', 'seller'])), 'Order berhasil dibatalkan.');
    }

    public function confirmReceived(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        if (Gate::denies('confirmReceived', $order)) {
            return $this->errorResponse('Anda tidak dapat mengkonfirmasi order ini.', 403);
        }

        $order = $this->service->confirmReceived($order);
        return $this->successResponse(new OrderResource($order->load(['product', 'buyer', 'seller'])), 'Penerimaan produk berhasil dikonfirmasi.');
    }

    public function updateShippingAddress(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'shipping_address' => 'required|string|min:10|max:500',
        ]);

        $order = Order::findOrFail($id);

        // Hanya buyer pemilik order yang boleh edit
        if ((int) $order->buyer_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        // Tidak bisa edit jika sudah bayar (status bukan waiting_payment)
        if ($order->status !== 'waiting_payment') {
            return $this->errorResponse('Alamat tidak dapat diubah setelah pembayaran dilakukan.', 422);
        }

        $order->update(['shipping_address' => $request->shipping_address]);

        return $this->successResponse(
            new OrderResource($order->load(['product', 'buyer', 'seller'])),
            'Alamat penerima berhasil diperbarui.'
        );
    }

    public function ship(Request $request, string $id): JsonResponse
    {
        $request->validate(['resi_number' => 'required|string|max:100']);

        $order = Order::findOrFail($id);

        if ((int) $order->seller_id !== (int) $request->user()->id && $request->user()->role !== 'admin') {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        if ($order->status !== 'paid') {
            return $this->errorResponse('Order harus berstatus paid untuk dapat dikirim.', 422);
        }

        $order = $this->service->ship($order, $request->resi_number);

        return $this->successResponse(
            new OrderResource($order->load(['product', 'buyer', 'seller'])),
            'Order berhasil ditandai sebagai dikirim.'
        );
    }
}
