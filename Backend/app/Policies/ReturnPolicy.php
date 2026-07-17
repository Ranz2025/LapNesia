<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ProductReturn;
use App\Models\User;

class ReturnPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['buyer', 'seller', 'admin', 'owner']);
    }

    public function view(User $user, ProductReturn $return): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return true;
        }

        return (int) $return->buyer_id === (int) $user->id
            || (int) $return->seller_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'buyer';
    }

    public function updateStatus(User $user, ProductReturn $return): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return true;
        }

        // Seller can approve/reject their own returns
        return (int) $return->seller_id === (int) $user->id
            && $return->status === 'pending';
    }

    public function submitResi(User $user, ProductReturn $return): bool
    {
        return (int) $return->buyer_id === (int) $user->id
            && $return->status === 'approved';
    }

    public function complete(User $user): bool
    {
        return in_array($user->role, ['admin', 'owner']);
    }
}
