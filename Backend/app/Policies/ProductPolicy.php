<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function update(User $user, Product $product): bool
    {
        return $user->id === $product->seller_id || in_array($user->role, ['admin', 'owner']);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->id === $product->seller_id || in_array($user->role, ['admin', 'owner']);
    }
}
