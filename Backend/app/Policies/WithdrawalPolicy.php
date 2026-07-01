<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Withdrawal;

class WithdrawalPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['owner', 'admin', 'seller', 'technician']);
    }

    public function view(User $user, Withdrawal $withdrawal): bool
    {
        if (in_array($user->role, ['owner', 'admin'])) {
            return true;
        }

        return (int) $withdrawal->wallet->user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['seller', 'technician']);
    }

    public function approve(User $user): bool
    {
        return in_array($user->role, ['owner', 'admin']);
    }

    public function reject(User $user): bool
    {
        return in_array($user->role, ['owner', 'admin']);
    }
}