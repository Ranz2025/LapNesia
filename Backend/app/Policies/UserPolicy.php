<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'owner']);
    }

    public function view(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'owner']) || $user->id === $model->id;
    }

    public function update(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'owner']) || $user->id === $model->id;
    }

    public function suspend(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'owner']);
    }

    public function activate(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'owner']);
    }

    public function approve(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'owner']);
    }

    public function reject(User $user, User $model): bool
    {
        return in_array($user->role, ['admin', 'owner']);
    }
}
