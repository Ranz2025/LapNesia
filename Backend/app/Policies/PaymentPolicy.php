<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function view(User $user, Payment $payment): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return true;
        }

        $order = $payment->order;
        if (! $order) {
            return false;
        }

        return (int) $order->buyer_id === (int) $user->id
            || (int) $order->seller_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['buyer', 'admin']);
    }
}
