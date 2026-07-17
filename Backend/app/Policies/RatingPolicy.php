<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class RatingPolicy
{
    public function create(User $user): bool
    {
        return $user->role === 'buyer';
    }
}
