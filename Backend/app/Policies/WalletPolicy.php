<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Wallet;

class WalletPolicy
{
    public function view(User $user, Wallet $wallet): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return true;
        }

        return (int) $wallet->user_id === (int) $user->id;
    }

    public function withdraw(User $user, Wallet $wallet): bool
    {
        return in_array($user->role, ['seller', 'technician']) && (int) $wallet->user_id === (int) $user->id;
    }
}
