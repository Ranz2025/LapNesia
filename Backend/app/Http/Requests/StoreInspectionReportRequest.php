<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\InspectionReport;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreInspectionReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', InspectionReport::class);
    }

    public function rules(): array
    {
        $statusRules = ['required', 'in:good,needs_attention,faulty'];
        $notesRules = ['nullable', 'string', 'max:1000'];

        return [
            'job_id' => ['required', 'integer', 'exists:inspection_jobs,id'],
            'battery_status' => $statusRules,
            'battery_notes' => $notesRules,
            'screen_status' => $statusRules,
            'screen_notes' => $notesRules,
            'keyboard_status' => $statusRules,
            'keyboard_notes' => $notesRules,
            'touchpad_status' => $statusRules,
            'touchpad_notes' => $notesRules,
            'port_status' => $statusRules,
            'port_notes' => $notesRules,
            'storage_status' => $statusRules,
            'storage_notes' => $notesRules,
            'ram_status' => $statusRules,
            'ram_notes' => $notesRules,
            'cpu_status' => $statusRules,
            'cpu_notes' => $notesRules,
            'physical_status' => $statusRules,
            'physical_notes' => $notesRules,
            'overall_score' => ['required', 'integer', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
            'recommendation' => ['required', 'in:recommended,fix_required,not_recommended'],
        ];
    }
}
