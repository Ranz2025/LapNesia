<?php

namespace App\Providers;

use App\Models\InspectionJob;
use App\Models\InspectionReport;
use App\Models\Order;
use App\Models\Product;
use App\Models\Withdrawal;
use App\Policies\InspectionJobPolicy;
use App\Policies\InspectionReportPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\WithdrawalPolicy;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Withdrawal::class, WithdrawalPolicy::class);
        Gate::policy(DatabaseNotification::class, NotificationPolicy::class);
        Gate::policy(InspectionJob::class, InspectionJobPolicy::class);
        Gate::policy(InspectionReport::class, InspectionReportPolicy::class);
        Gate::policy(Product::class, ProductPolicy::class);
    }
}
