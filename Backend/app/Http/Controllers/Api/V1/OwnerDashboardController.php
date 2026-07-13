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

class OwnerDashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $period = $request->get('period', 'monthly');
        $now    = Carbon::now();

        [$from, $to] = match ($period) {
            'weekly' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'yearly' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            default  => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };

        $paidStatuses = ['paid', 'shipped', 'completed'];

        /* ── USERS ─────────────────────────────────────────────── */
        $totalUsers       = User::count();
        $totalSellers     = User::where('role', 'seller')->count();
        $totalBuyers      = User::where('role', 'buyer')->count();
        $totalTechnicians = User::where('role', 'technician')->count();
        $newUsers         = User::whereBetween('created_at', [$from, $to])->count();

        /* ── ORDERS ────────────────────────────────────────────── */
        $totalOrders     = Order::count();
        $completedOrders = Order::whereIn('status', $paidStatuses)->count();
        $periodOrders    = Order::whereIn('status', $paidStatuses)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$from, $to])
            ->count();

        /* ── REVENUE ───────────────────────────────────────────── */
        $totalRevenue  = Order::whereIn('status', $paidStatuses)->sum('platform_fee');
        $periodRevenue = Order::whereIn('status', $paidStatuses)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$from, $to])
            ->sum('platform_fee');

        /* ── WALLET & WITHDRAWAL ───────────────────────────────── */
        $totalWalletBalance = Wallet::sum('available_balance');
        $totalHeldBalance   = Wallet::sum('held_balance');
        $totalWithdrawals   = Withdrawal::where('status', 'processed')->sum('amount');
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->sum('amount');

        /* ── CHARTS ────────────────────────────────────────────── */
        $revenueChart    = $this->buildRevenueChart($period, $from, $to, $paidStatuses);
        $userGrowthChart = $this->buildUserGrowthChart($period, $from, $to);

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
                'user_growth' => $userGrowthChart,
            ],
            'period' => $period,
        ]);
    }

    /* ────────────────────────────────────────────────────────────
     | REVENUE CHART
     | weekly  → 7 titik per hari (Sen–Min)
     | monthly → 4–5 titik per minggu dalam bulan ini
     | yearly  → 12 titik per bulan
     ─────────────────────────────────────────────────────────── */
    private function buildRevenueChart(string $period, Carbon $from, Carbon $to, array $paidStatuses): array
    {
        if ($period === 'weekly') {
            $rows = Order::whereIn('status', $paidStatuses)
                ->whereNotNull('paid_at')
                ->whereBetween('paid_at', [$from, $to])
                ->selectRaw('DATE(paid_at) as grp, SUM(platform_fee) as revenue, COUNT(*) as orders')
                ->groupBy('grp')->orderBy('grp')->get()->keyBy('grp');

            $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            $result = [];
            $cursor = $from->copy();
            while ($cursor->lte($to)) {
                $key = $cursor->toDateString();
                $result[] = [
                    'label'   => $dayNames[$cursor->dayOfWeek],
                    'date'    => $cursor->isoFormat('D MMMM YYYY') . ' (' . $dayNames[$cursor->dayOfWeek] . ')',
                    'revenue' => (float) ($rows[$key]->revenue ?? 0),
                    'orders'  => (int)   ($rows[$key]->orders  ?? 0),
                ];
                $cursor->addDay();
            }
            return $result;
        }

        if ($period === 'yearly') {
            $rows = Order::whereIn('status', $paidStatuses)
                ->whereNotNull('paid_at')
                ->whereBetween('paid_at', [$from, $to])
                ->selectRaw('DATE_FORMAT(paid_at, "%Y-%m") as grp, SUM(platform_fee) as revenue, COUNT(*) as orders')
                ->groupBy('grp')->orderBy('grp')->get()->keyBy('grp');

            $result = [];
            $cursor = $from->copy()->startOfMonth();
            while ($cursor->lte($to)) {
                $key = $cursor->format('Y-m');
                $result[] = [
                    'label'   => $cursor->locale('id')->isoFormat('MMM'),
                    'date'    => $cursor->locale('id')->isoFormat('MMMM YYYY'),
                    'revenue' => (float) ($rows[$key]->revenue ?? 0),
                    'orders'  => (int)   ($rows[$key]->orders  ?? 0),
                ];
                $cursor->addMonth();
            }
            return $result;
        }

        // monthly → per minggu
        $rows = Order::whereIn('status', $paidStatuses)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$from, $to])
            ->selectRaw('YEARWEEK(paid_at, 1) as grp, SUM(platform_fee) as revenue, COUNT(*) as orders')
            ->groupBy('grp')->orderBy('grp')->get()->keyBy('grp');

        $result  = [];
        $cursor  = $from->copy()->startOfWeek(Carbon::MONDAY);
        $weekNum = 1;
        while ($cursor->lte($to)) {
            $weekEnd = $cursor->copy()->endOfWeek(Carbon::SUNDAY);
            $key     = $cursor->format('oW');
            $result[] = [
                'label'   => "Mg {$weekNum}",
                'date'    => $cursor->isoFormat('D MMM') . ' – ' . $weekEnd->isoFormat('D MMM YYYY'),
                'revenue' => (float) ($rows[$key]->revenue ?? 0),
                'orders'  => (int)   ($rows[$key]->orders  ?? 0),
            ];
            $cursor->addWeek();
            $weekNum++;
            if ($cursor->gt($to)) break;
        }
        return $result;
    }

    /* ────────────────────────────────────────────────────────────
     | USER GROWTH CHART
     | weekly  → 7 titik per hari (Sen–Min)
     | monthly → 4–5 titik per minggu dalam bulan ini
     | yearly  → 12 titik per bulan
     ─────────────────────────────────────────────────────────── */
    private function buildUserGrowthChart(string $period, Carbon $from, Carbon $to): array
    {
        if ($period === 'weekly') {
            $rows = User::whereBetween('created_at', [$from, $to])
                ->selectRaw('DATE(created_at) as grp, COUNT(*) as count')
                ->groupBy('grp')->orderBy('grp')->get()->keyBy('grp');

            $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            $result = [];
            $cursor = $from->copy();
            while ($cursor->lte($to)) {
                $key = $cursor->toDateString();
                $result[] = [
                    'label' => $dayNames[$cursor->dayOfWeek],
                    'date'  => $cursor->isoFormat('D MMMM YYYY') . ' (' . $dayNames[$cursor->dayOfWeek] . ')',
                    'users' => (int) ($rows[$key]->count ?? 0),
                ];
                $cursor->addDay();
            }
            return $result;
        }

        if ($period === 'yearly') {
            $rows = User::whereBetween('created_at', [$from, $to])
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as grp, COUNT(*) as count')
                ->groupBy('grp')->orderBy('grp')->get()->keyBy('grp');

            $result = [];
            $cursor = $from->copy()->startOfMonth();
            while ($cursor->lte($to)) {
                $key = $cursor->format('Y-m');
                $result[] = [
                    'label' => $cursor->locale('id')->isoFormat('MMM'),
                    'date'  => $cursor->locale('id')->isoFormat('MMMM YYYY'),
                    'users' => (int) ($rows[$key]->count ?? 0),
                ];
                $cursor->addMonth();
            }
            return $result;
        }

        // monthly → per minggu
        $rows = User::whereBetween('created_at', [$from, $to])
            ->selectRaw('YEARWEEK(created_at, 1) as grp, COUNT(*) as count')
            ->groupBy('grp')->orderBy('grp')->get()->keyBy('grp');

        $result  = [];
        $cursor  = $from->copy()->startOfWeek(Carbon::MONDAY);
        $weekNum = 1;
        while ($cursor->lte($to)) {
            $weekEnd = $cursor->copy()->endOfWeek(Carbon::SUNDAY);
            $key     = $cursor->format('oW');
            $result[] = [
                'label' => "Mg {$weekNum}",
                'date'  => $cursor->isoFormat('D MMM') . ' – ' . $weekEnd->isoFormat('D MMM YYYY'),
                'users' => (int) ($rows[$key]->count ?? 0),
            ];
            $cursor->addWeek();
            $weekNum++;
            if ($cursor->gt($to)) break;
        }
        return $result;
    }
}
