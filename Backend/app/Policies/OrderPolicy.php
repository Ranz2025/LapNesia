<?php

declare(strict_types=1);

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

        return (int) $order->buyer_id === (int) $user->id
            || (int) $order->seller_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'buyer';
    }

    public function cancel(User $user, Order $order): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return $order->status === 'waiting_payment';
        }

        return (int) $order->buyer_id === (int) $user->id
            && $order->status === 'waiting_payment';
    }

    public function ship(User $user, Order $order): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return $order->status === 'paid';
        }

        return (int) $order->seller_id === (int) $user->id
            && $order->status === 'paid';
    }

    public function confirmReceived(User $user, Order $order): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return $order->status === 'shipped';
        }

        return (int) $order->buyer_id === (int) $user->id
            && $order->status === 'shipped';
    }

    public function updateShippingAddress(User $user, Order $order): bool
    {
        return (int) $order->buyer_id === (int) $user->id
            && $order->status === 'waiting_payment';
    }

    public function pay(User $user, Order $order): bool
    {
        return (int) $order->buyer_id === (int) $user->id;
    }

    public function rate(User $user, Order $order): bool
    {
        return (int) $order->buyer_id === (int) $user->id && $order->status === 'completed';
    }
}
