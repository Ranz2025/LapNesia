<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\InspectionJob;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreInspectionJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', InspectionJob::class);
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'technician_id' => ['required', 'integer', 'exists:users,id'],
            'laptop_address' => ['required', 'string'],
            'inspection_notes' => ['nullable', 'string', 'max:500'],
            'availability_id' => ['nullable', 'integer', 'exists:technician_availabilities,id'],
            'fee' => ['nullable', 'numeric'],
        ];
    }
}
