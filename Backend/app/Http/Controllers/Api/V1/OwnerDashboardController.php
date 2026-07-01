<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerDashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $period = $request->get('period', 'monthly');
        $now    = Carbon::now();

        // Date ranges
        $ranges = match($period) {
            'weekly'  => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'yearly'  => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            default   => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };
        [$from, $to] = $ranges;

        // Users
        $totalUsers    = User::count();
        $totalSellers  = User::where('role', 'seller')->count();
        $totalBuyers   = User::where('role', 'buyer')->count();
        $totalTechnicians = User::where('role', 'technician')->count();
        $newUsers      = User::whereBetween('created_at', [$from, $to])->count();

        // Orders
        $totalOrders     = Order::count();
        $completedOrders = Order::where('status', 'completed')->count();
        $periodOrders    = Order::whereBetween('created_at', [$from, $to])->count();

        // Revenue (platform fees from completed orders)
        $totalRevenue  = Order::where('status', 'completed')->sum('platform_fee');
        $periodRevenue = Order::where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->sum('platform_fee');

        // Wallet total balance
        $totalWalletBalance = Wallet::sum('available_balance');
        $totalHeldBalance   = Wallet::sum('held_balance');

        // Withdrawals
        $totalWithdrawals  = Withdrawal::where('status', 'processed')->sum('amount');
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->sum('amount');

        // Revenue chart (last 12 months)
        $revenueChart = Order::where('status', 'completed')
            ->where('completed_at', '>=', now()->subMonths(12))
            ->selectRaw('SUBSTR(completed_at, 1, 7) as month, SUM(platform_fee) as revenue, COUNT(*) as orders')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // User growth chart (last 12 months)
        $userGrowth = User::where('created_at', '>=', now()->subMonths(12))
            ->selectRaw('SUBSTR(created_at, 1, 7) as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $this->successResponse([
            'stats' => [
                'total_users'          => $totalUsers,
                'total_sellers'        => $totalSellers,
                'total_buyers'         => $totalBuyers,
                'total_technicians'    => $totalTechnicians,
                'new_users_period'     => $newUsers,
                'total_orders'         => $totalOrders,
                'completed_orders'     => $completedOrders,
                'period_orders'        => $periodOrders,
                'total_revenue'        => (float) $totalRevenue,
                'period_revenue'       => (float) $periodRevenue,
                'total_wallet_balance' => (float) $totalWalletBalance,
                'total_held_balance'   => (float) $totalHeldBalance,
                'total_withdrawals'    => (float) $totalWithdrawals,
                'pending_withdrawals'  => (float) $pendingWithdrawals,
            ],
            'charts' => [
                'revenue'     => $revenueChart,
                'user_growth' => $userGrowth,
            ],
            'period' => $period,
        ]);
    }
}
