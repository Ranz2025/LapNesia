<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'         => 'required|numeric|min:10000',
            'bank_name'      => 'required|string|max:100',
            'account_name'   => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
        ];
    }
}