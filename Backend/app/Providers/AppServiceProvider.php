<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\ChatRoom;
use App\Models\InspectionJob;
use App\Models\InspectionReport;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Policies\ChatRoomPolicy;
use App\Policies\InspectionJobPolicy;
use App\Policies\InspectionReportPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\OrderPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\ProductPolicy;
use App\Policies\ReturnPolicy;
use App\Policies\WalletPolicy;
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
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(ProductReturn::class, ReturnPolicy::class);
        Gate::policy(Wallet::class, WalletPolicy::class);
        Gate::policy(ChatRoom::class, ChatRoomPolicy::class);
    }
}
