<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\InspectionJob;
use App\Models\User;

class InspectionJobPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['buyer', 'technician', 'seller', 'admin', 'owner']);
    }

    public function view(User $user, InspectionJob $job): bool
    {
        // Buyer yang memesan
        if ((int) $user->id === (int) $job->requested_by) {
            return true;
        }

        // Teknisi yang ditugaskan
        if ((int) $user->id === (int) $job->technician_id) {
            return true;
        }

        // Seller pemilik produk yang diinspeksi
        $sellerId = $job->product?->user_id ?? $job->product?->seller_id;
        if ($sellerId && (int) $user->id === (int) $sellerId) {
            return true;
        }

        // Admin / Owner
        return in_array($user->role, ['admin', 'owner']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['buyer', 'admin']);
    }

    public function accept(User $user, InspectionJob $job): bool
    {
        return $user->role === 'technician'
            && (int) $user->id === (int) $job->technician_id
            && in_array($job->status, ['pending', 'assigned']);
    }

    public function reject(User $user, InspectionJob $job): bool
    {
        return $user->role === 'technician'
            && (int) $user->id === (int) $job->technician_id
            && in_array($job->status, ['pending', 'assigned']);
    }

    public function complete(User $user, InspectionJob $job): bool
    {
        return $user->role === 'technician'
            && (int) $user->id === (int) $job->technician_id
            && $job->status === 'in_progress';
    }

    public function setSchedule(User $user, InspectionJob $job): bool
    {
        return $user->role === 'technician'
            && (int) $user->id === (int) $job->technician_id;
    }

    public function cancel(User $user, InspectionJob $job): bool
    {
        // Buyer atau technician terkait bisa cancel
        if ((int) $user->id === (int) $job->requested_by) {
            return true;
        }
        if ((int) $user->id === (int) $job->technician_id) {
            return true;
        }

        return in_array($user->role, ['admin', 'owner']);
    }

    public function pay(User $user, InspectionJob $job): bool
    {
        return (int) $user->id === (int) $job->requested_by
            && $job->status === 'accepted';
    }

    public function rate(User $user, InspectionJob $job): bool
    {
        return (int) $user->id === (int) $job->requested_by
            && $job->status === 'completed';
    }
}
