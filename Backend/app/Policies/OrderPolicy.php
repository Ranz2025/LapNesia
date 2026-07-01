<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['owner', 'admin', 'seller', 'buyer']);
    }

    public function view(User $user, Order $order): bool
    {
        if (in_array($user->role, ['owner', 'admin'])) {
            return true;
        }

        return (int) $order->buyer_id === (int) $user->id || (int) $order->seller_id === (int) $user->id;
    }

    public function cancel(User $user, Order $order): bool
    {
        return (int) $order->buyer_id === (int) $user->id && $order->status === 'waiting_payment';
    }

    public function confirmReceived(User $user, Order $order): bool
    {
        return (int) $order->buyer_id === (int) $user->id && $order->status === 'shipped';
    }
}
