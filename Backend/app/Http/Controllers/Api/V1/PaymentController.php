<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\InspectionPaymentService;
use App\Services\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(protected PaymentService $service) {}

    public function pay(Request $request, string $orderId): JsonResponse
    {
        $order = Order::with('buyer')->findOrFail($orderId);

        Gate::authorize('pay', $order);

        try {
            $payment = $this->service->createPayment($order);

            return $this->successResponse($payment, 'Payment berhasil dibuat.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Request $request, string $paymentId): JsonResponse
    {
        $payment = Payment::with('order')->findOrFail($paymentId);

        Gate::authorize('view', $payment);

        return $this->successResponse($payment);
    }

    public function webhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->all();

            // Route to inspection payment service if inspection webhook
            if (str_starts_with((string) ($payload['order_id'] ?? ''), 'INSPECTION-')) {
                app(InspectionPaymentService::class)->handleWebhook($payload);
            } else {
                $this->service->handleWebhook($payload);
            }

            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('Webhook error: '.$e->getMessage(), ['payload' => $request->all()]);

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
    }
}
