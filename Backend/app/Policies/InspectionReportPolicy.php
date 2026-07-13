<?php

namespace App\Policies;

use App\Models\InspectionReport;
use App\Models\User;

class InspectionReportPolicy
{
    /**
     * Hanya teknisi yang mengerjakan, pembeli yang memesan, atau admin/owner
     * yang boleh melihat detail laporan inspeksi.
     */
    public function view(User $user, InspectionReport $report): bool
    {
        return (int) $user->id === (int) $report->technician_id
            || (int) $user->id === (int) $report->job?->requested_by
            || in_array($user->role, ['admin', 'owner']);
    }

    /**
     * Hanya pembeli yang memesan inspeksi, teknisi yang mengerjakan,
     * atau admin/owner yang boleh mengunduh PDF laporan.
     */
    public function downloadPdf(User $user, InspectionReport $report): bool
    {
        return (int) $user->id === (int) $report->job?->requested_by
            || (int) $user->id === (int) $report->technician_id
            || in_array($user->role, ['admin', 'owner']);
    }
}
