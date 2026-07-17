<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Withdrawal;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminDashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Order::class); // Admin-only check via role middleware

        $totalUsers = User::count();
        $totalSellers = User::where('role', 'seller')->count();
        $totalBuyers = User::where('role', 'buyer')->count();
        $totalTechnicians = User::where('role', 'technician')->count();
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', 'active')->count();

        $totalOrders = Order::count();
        $completedOrders = Order::where('status', 'completed')->count();
        $pendingOrders = Order::whereIn('status', ['waiting_payment', 'paid', 'shipped'])->count();

        $totalRevenue = (float) Order::where('status', 'completed')->sum('platform_fee');

        $totalWithdrawals = Withdrawal::count();
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->count();
        $pendingWithdrawalsAmount = (float) Withdrawal::where('status', 'pending')->sum('amount');

        $recentWithdrawals = Withdrawal::with('wallet.user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'user_name' => $w->wallet?->user?->name ?? 'Unknown',
                'bank_name' => $w->bank_name,
                'account_number' => $w->account_number,
                'account_name' => $w->account_name,
                'amount' => (float) $w->amount,
                'status' => $w->status,
                'created_at' => $w->created_at,
            ]);

        $pendingTechnicians = User::where('role', 'technician')
            ->where('status', 'pending')
            ->count();

        return $this->successResponse([
            'stats' => [
                'total_users' => $totalUsers,
                'total_sellers' => $totalSellers,
                'total_buyers' => $totalBuyers,
                'total_technicians' => $totalTechnicians,
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'pending_orders' => $pendingOrders,
                'total_revenue' => $totalRevenue,
                'total_withdrawals' => $totalWithdrawals,
                'pending_withdrawals' => $pendingWithdrawals,
                'pending_withdrawals_amount' => $pendingWithdrawalsAmount,
                'pending_technicians' => $pendingTechnicians,
            ],
            'recent_withdrawals' => $recentWithdrawals,
        ]);
    }
}
