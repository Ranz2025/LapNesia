<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\InspectionReport;
use App\Models\User;

class InspectionReportPolicy
{
    public function view(User $user, InspectionReport $report): bool
    {
        return (int) $user->id === (int) $report->technician_id
            || (int) $user->id === (int) $report->job?->requested_by
            || in_array($user->role, ['admin', 'owner']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['technician', 'admin']);
    }

    public function uploadPhoto(User $user, InspectionReport $report): bool
    {
        return (int) $user->id === (int) $report->technician_id
            || in_array($user->role, ['admin']);
    }

    public function deletePhoto(User $user, InspectionReport $report): bool
    {
        return $this->uploadPhoto($user, $report);
    }

    public function downloadPdf(User $user, InspectionReport $report): bool
    {
        return (int) $user->id === (int) $report->job?->requested_by
            || (int) $user->id === (int) $report->technician_id
            || in_array($user->role, ['admin', 'owner']);
    }
}
