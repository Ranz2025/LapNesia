<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', Product::class);
    }

    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'exists:brands,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'model' => ['required', 'string', 'max:255'],
            'cpu' => ['required', 'string', 'max:255'],
            'ram' => ['required', 'integer', 'min:1'],
            'storage' => ['required', 'integer', 'min:1'],
            'storage_type' => ['required', 'in:SSD,HDD,NVMe'],
            'gpu' => ['nullable', 'string', 'max:255'],
            'screen_size' => ['required', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'condition' => ['required', 'in:very_good,good,needs_repair'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['nullable', 'string'],
            'stock' => ['required', 'integer', 'min:1', 'max:9999'],
            'inspection_ready' => ['sometimes', 'boolean'],
        ];
    }
}
