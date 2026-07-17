<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', Order::class);
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'notes' => 'nullable|string|max:1000',
            'shipping_address' => 'nullable|string|max:500',
        ];
    }
}
