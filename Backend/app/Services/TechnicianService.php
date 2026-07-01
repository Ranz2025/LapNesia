<?php

namespace App\Services;

use App\Models\TechnicianAvailability;
use App\Models\TechnicianProfile;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TechnicianService
{
    public function getAll(): LengthAwarePaginator
    {
        return User::with('technicianProfile')
            ->where('role', 'technician')
            ->whereIn('status', ['verified', 'active'])
            ->latest()
            ->paginate(12);
    }

    public function findWithUser(string $id): ?User
    {
        return User::with('technicianProfile')
            ->where('id', $id)
            ->where('role', 'technician')
            ->whereIn('status', ['verified', 'active'])
            ->first();
    }

    public function getAvailability(string $userId): \Illuminate\Database\Eloquent\Collection
    {
        return TechnicianAvailability::where('user_id', $userId)
            ->where('is_booked', false)
            ->where('available_date', '>=', now()->toDateString())
            ->orderBy('available_date')
            ->get();
    }

    public function storeAvailability(string $userId, array $data): TechnicianAvailability
    {
        return TechnicianAvailability::create(array_merge($data, ['user_id' => $userId]));
    }

    public function updateAvailability(TechnicianAvailability $slot, array $data): TechnicianAvailability
    {
        $slot->update($data);
        return $slot->fresh();
    }

    public function deleteAvailability(TechnicianAvailability $slot): void
    {
        $slot->delete();
    }
}
