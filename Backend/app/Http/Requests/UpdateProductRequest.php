<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = Product::find($this->route('id'));
        if (! $product) {
            return false;
        }

        return Gate::allows('update', $product);
    }

    public function rules(): array
    {
        return [
            'brand_id' => ['sometimes', 'exists:brands,id'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'model' => ['sometimes', 'string', 'max:255'],
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
