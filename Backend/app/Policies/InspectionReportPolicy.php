<?php

namespace App\Policies;

use App\Models\InspectionReport;
use App\Models\User;

class InspectionReportPolicy
{
    public function view(User $user, InspectionReport $report): bool
    {
        return (int) $user->id === (int) $report->technician_id
            || (int) $user->id === (int) $report->job->requested_by
            || in_array($user->role, ['admin', 'owner']);
    }

    /**
     * Laporan inspeksi adalah informasi publik untuk semua calon pembeli.
     * Semua user yang terautentikasi boleh mengunduh PDF laporan inspeksi.
     */
    public function downloadPdf(User $user, InspectionReport $report): bool
    {
        return true;
    }
}
