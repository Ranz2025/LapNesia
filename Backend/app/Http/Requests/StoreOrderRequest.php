<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id'       => 'required|exists:products,id',
            'notes'            => 'nullable|string|max:1000',
            'shipping_address' => 'required|string|max:500',
        ];
    }
}
