<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(protected PaymentService $service) {}

    public function pay(Request $request, Order $order): JsonResponse
    {
        if ((int) $order->buyer_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke order ini.', 403);
        }

        try {
            // Reuse existing pending payment if snap_token already exists
            $existing = Payment::where('order_id', $order->id)
                ->where('status', 'pending')
                ->whereNotNull('snap_token')
                ->latest()
                ->first();

            if ($existing) {
                return $this->successResponse(new PaymentResource($existing), 'Payment sudah ada.', 200);
            }

            $payment = $this->service->createPayment($order->load('buyer'));
            return $this->successResponse(new PaymentResource($payment), 'Payment berhasil dibuat.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function webhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->all();
            Log::info("Webhook received", ['payload' => $payload]);

            $orderId = $payload['order_id'] ?? '';
            $signatureKey = $payload['signature_key'] ?? 'MISSING';
            $calculatedSignature = hash('sha512', $orderId . ($payload['status_code'] ?? '') . ($payload['gross_amount'] ?? '') . config('services.midtrans.server_key'));
            $signatureValid = hash_equals($calculatedSignature, $signatureKey);

            Log::info("Webhook check", [
                'order_id' => $orderId,
                'signature_present' => isset($payload['signature_key']),
                'signature_valid' => $signatureValid,
                'is_inspection' => str_starts_with((string) $orderId, 'INSPECTION-')
            ]);

            if (str_starts_with((string) $orderId, 'INSPECTION-')) {
                // Gunakan InspectionPaymentService untuk memproses
                app(\App\Services\InspectionPaymentService::class)->handleWebhook($payload);
            } else {
                // Gunakan PaymentService bawaan
                $this->service->handleWebhook($payload);
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $payment = Payment::with('order')->findOrFail($id);

        if (!in_array($request->user()->role, ['owner', 'admin'])
            && (int) $payment->order->buyer_id !== (int) $request->user()->id
            && (int) $payment->order->seller_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        return $this->successResponse(new PaymentResource($payment));
    }
}
