<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInspectionJobRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'product_id'       => ['required', 'integer', 'exists:products,id'],
            'technician_id'    => ['required', 'integer', 'exists:users,id'],
            'laptop_address'   => ['required', 'string'],
            'inspection_notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
