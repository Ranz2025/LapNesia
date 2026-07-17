<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\InspectionJob;
use App\Models\TechnicianAvailability;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TechnicianService
{
    public function getAll(): LengthAwarePaginator
    {
        // Ambil ID teknisi yang sedang punya job aktif (assigned/accepted/in_progress)
        // Harus konsisten dengan InspectionJobService::canAcceptNewJob()
        $busyTechnicianIds = InspectionJob::whereIn('status', ['assigned', 'accepted', 'in_progress'])
            ->pluck('technician_id')
            ->unique()
            ->toArray();

        return User::with('technicianProfile')
            ->where('role', 'technician')
            ->whereIn('status', ['verified', 'active'])
            ->whereNotIn('id', $busyTechnicianIds)
            ->latest()
            ->paginate(12);
    }

    public function findWithUser(int $id): ?User
    {
        return User::with('technicianProfile')
            ->where('id', $id)
            ->where('role', 'technician')
            ->whereIn('status', ['verified', 'active'])
            ->first();
    }

    public function getAvailability(int $userId): Collection
    {
        return TechnicianAvailability::where('user_id', $userId)
            ->where('is_booked', false)
            ->where('available_date', '>=', now()->toDateString())
            ->orderBy('available_date')
            ->get();
    }

    public function storeAvailability(int $userId, array $data): TechnicianAvailability
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
