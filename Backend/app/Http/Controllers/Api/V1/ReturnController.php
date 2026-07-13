<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductReturn;
use App\Services\ReturnService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    use ApiResponse;

    public function __construct(protected ReturnService $service) {}

    /** GET /v1/returns - list returns milik user */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = ProductReturn::with(['order.product', 'buyer', 'seller'])->latest();

        if ($user->role === 'buyer') {
            $query->where('buyer_id', $user->id);
        } elseif ($user->role === 'seller') {
            $query->where('seller_id', $user->id);
        }

        return $this->successResponse($query->paginate(15));
    }

    /** GET /v1/returns/{id} */
    public function show(Request $request, string $id): JsonResponse
    {
        $return = ProductReturn::with(['order.product', 'buyer', 'seller'])->findOrFail($id);
        $user   = $request->user();

        if ((int) $return->buyer_id !== (int) $user->id && (int) $return->seller_id !== (int) $user->id && !in_array($user->role, ['admin', 'owner'])) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse($return);
    }

    /** POST /v1/returns - buyer ajukan return */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'reason'   => 'required|string|min:10|max:1000',
        ]);

        try {
            $order  = Order::findOrFail($request->order_id);
            $return = $this->service->request($order, $request->user()->id, $request->reason);
            return $this->successResponse($return->load('order.product', 'buyer', 'seller'), 'Pengembalian berhasil diajukan.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /** PUT /v1/returns/{id}/status - seller approve/reject */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status'       => 'required|in:approved,rejected',
            'seller_notes' => 'nullable|string|max:500',
        ]);

        $return = ProductReturn::findOrFail($id);
        $user   = $request->user();

        if ((int) $return->seller_id !== (int) $user->id && !in_array($user->role, ['admin'])) {
            return $this->errorResponse('Hanya penjual yang dapat memproses pengembalian.', 403);
        }

        try {
            $return = $this->service->updateStatus($return, $request->status, $request->seller_notes);
            return $this->successResponse($return, 'Status pengembalian berhasil diperbarui.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /** PUT /v1/returns/{id}/resi - buyer input resi pengiriman balik */
    public function submitResi(Request $request, string $id): JsonResponse
    {
        $request->validate(['return_resi' => 'required|string|max:100']);

        $return = ProductReturn::findOrFail($id);

        try {
            $return = $this->service->submitResi($return, $request->user()->id, $request->return_resi);
            return $this->successResponse($return, 'Resi pengembalian berhasil disimpan.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /** PUT /v1/admin/returns/{id}/complete - admin complete return */
    public function adminComplete(Request $request, string $id): JsonResponse
    {
        $request->validate(['admin_notes' => 'nullable|string|max:500']);

        $return = ProductReturn::findOrFail($id);

        try {
            $return = $this->service->completeReturn($return, $request->admin_notes);
            return $this->successResponse($return, 'Pengembalian berhasil diselesaikan.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /** GET /v1/admin/returns - admin lihat semua return */
    public function adminIndex(Request $request): JsonResponse
    {
        $returns = $this->service->getAllReturns();
        return $this->successResponse($returns);
    }
}
