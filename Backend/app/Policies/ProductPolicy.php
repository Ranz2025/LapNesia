<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // Public listing
    }

    public function view(?User $user, Product $product): bool
    {
        return true; // Public detail
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['seller', 'admin']);
    }

    public function update(User $user, Product $product): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return true;
        }

        return $user->role === 'seller' && (int) $user->id === (int) $product->seller_id;
    }

    public function delete(User $user, Product $product): bool
    {
        if (in_array($user->role, ['admin', 'owner'])) {
            return true;
        }

        if ($product->status === 'sold') {
            return false;
        }

        return $user->role === 'seller' && (int) $user->id === (int) $product->seller_id;
    }

    public function archive(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }
}
