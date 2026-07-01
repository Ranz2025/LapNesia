<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInspectionReportRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $statusRules = ['required', 'in:good,needs_attention,faulty'];
        return [
            'job_id'          => ['required', 'integer', 'exists:inspection_jobs,id'],
            'battery_status'  => $statusRules,
            'screen_status'   => $statusRules,
            'keyboard_status' => $statusRules,
            'touchpad_status' => $statusRules,
            'port_status'     => $statusRules,
            'storage_status'  => $statusRules,
            'ram_status'      => $statusRules,
            'cpu_status'      => $statusRules,
            'physical_status' => $statusRules,
            'overall_score'   => ['required', 'integer', 'min:0', 'max:100'],
            'notes'           => ['nullable', 'string'],
            'recommendation'  => ['required', 'in:recommended,fix_required,not_recommended'],
        ];
    }
}
