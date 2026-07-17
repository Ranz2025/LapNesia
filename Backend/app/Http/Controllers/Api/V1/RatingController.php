<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Rating;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class RatingController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Rating::class);

        $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'seller_rating' => 'required|integer|min:1|max:5',
            'seller_review' => 'nullable|string|max:500',
            'product_rating' => 'nullable|integer|min:1|max:5',
            'product_review' => 'nullable|string|max:500',
        ]);

        $order = Order::with(['product.seller', 'buyer'])->findOrFail($request->order_id);

        if ((int) $order->buyer_id !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak dapat memberikan rating untuk order ini.', 403);
        }

        if ($order->status !== 'completed') {
            return $this->errorResponse('Rating hanya dapat diberikan setelah transaksi selesai.', 422);
        }

        if ($order->completed_at && $order->completed_at->diffInDays(now()) > 7) {
            return $this->errorResponse('Periode pemberian rating (7 hari) telah berakhir.', 422);
        }

        if ($order->rating()->exists()) {
            return $this->errorResponse('Rating untuk order ini sudah pernah diberikan.', 409);
        }

        $rating = DB::transaction(function () use ($request, $order) {
            $rating = Rating::create([
                'order_id' => $order->id,
                'seller_rating' => $request->seller_rating,
                'seller_review' => $request->seller_review,
                'product_rating' => $request->product_rating,
                'product_review' => $request->product_review,
            ]);

            $this->updateSellerAvgRating($order->seller_id);
            $this->updateProductAvgRating($order->product_id);

            return $rating;
        });

        return $this->successResponse($rating, 'Rating berhasil diberikan.', 201);
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate(['product_id' => 'nullable|integer|exists:products,id']);

        $query = Rating::with(['order.product', 'order.buyer:id,name,profile_photo_url'])
            ->when($request->product_id, function ($q) use ($request) {
                $q->whereHas('order', fn ($q2) => $q2->where('product_id', $request->product_id));
            })
            ->whereNotNull('product_rating')
            ->latest()
            ->paginate(10);

        return $this->successResponse($query);
    }

    public function show(string $orderId): JsonResponse
    {
        $rating = Rating::with('order')->where('order_id', $orderId)->first();

        if (! $rating) {
            return $this->errorResponse('Rating tidak ditemukan.', 404);
        }

        return $this->successResponse($rating);
    }

    private function updateSellerAvgRating(int $sellerId): void
    {
        $avg = Rating::whereHas('order', fn ($q) => $q->where('seller_id', $sellerId))
            ->avg('seller_rating');

        User::where('id', $sellerId)->update(['avg_rating' => round($avg, 2)]);
    }

    private function updateProductAvgRating(int $productId): void
    {
        $avg = Rating::whereHas('order', fn ($q) => $q->where('product_id', $productId))
            ->whereNotNull('product_rating')
            ->avg('product_rating');

        Product::where('id', $productId)->update(['avg_rating' => round($avg ?? 0, 2)]);
    }
}
