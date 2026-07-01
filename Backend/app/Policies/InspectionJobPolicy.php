<?php

namespace App\Policies;

use App\Models\InspectionJob;
use App\Models\User;

class InspectionJobPolicy
{
    public function view(User $user, InspectionJob $job): bool
    {
        // Buyer yang memesan
        if ((int) $user->id === (int) $job->requested_by) return true;

        // Teknisi yang ditugaskan
        if ((int) $user->id === (int) $job->technician_id) return true;

        // Seller pemilik produk yang diinspeksi
        $sellerId = $job->product?->user_id ?? $job->product?->seller_id;
        if ($sellerId && (int) $user->id === (int) $sellerId) return true;

        // Admin / Owner
        return in_array($user->role, ['admin', 'owner']);
    }

    public function accept(User $user, InspectionJob $job): bool
    {
        return $user->role === 'technician' && (int) $user->id === (int) $job->technician_id;
    }

    public function complete(User $user, InspectionJob $job): bool
    {
        return $user->role === 'technician' && (int) $user->id === (int) $job->technician_id;
    }

    public function reject(User $user, InspectionJob $job): bool
    {
        return $user->role === 'technician' && (int) $user->id === (int) $job->technician_id;
    }
}
