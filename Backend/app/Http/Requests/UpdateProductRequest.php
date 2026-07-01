<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_id' => ['sometimes', 'required', 'uuid', 'exists:brands,id'],
            'category_id' => ['sometimes', 'required', 'uuid', 'exists:categories,id'],
            'model' => ['sometimes', 'required', 'string', 'max:255'],
            'cpu' => ['sometimes', 'required', 'string', 'max:255'],
            'ram' => ['sometimes', 'required', 'integer', 'min:1'],
            'storage' => ['sometimes', 'required', 'integer', 'min:1'],
            'storage_type' => ['sometimes', 'required', 'in:SSD,HDD,NVMe'],
            'gpu' => ['nullable', 'string', 'max:255'],
            'screen_size' => ['sometimes', 'required', 'string', 'max:50'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'condition' => ['sometimes', 'required', 'in:very_good,good,needs_repair'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'status' => ['sometimes', 'required', 'in:draft,pending,active,booked,paid,sold,archived'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0', 'max:9999'],
            'inspection_ready' => ['sometimes', 'boolean'],
        ];
    }
}
