<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WithdrawalResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'wallet_id'       => $this->wallet_id,
            'amount'          => (float) $this->amount,
            'bank_name'       => $this->bank_name,
            'account_name'    => $this->account_name,
            'account_number'  => $this->account_number,
            'status'          => $this->status,
            'approved_by'     => $this->approved_by,
            'processed_at'    => $this->processed_at,
            'rejection_reason'=> $this->rejection_reason,
            'created_at'      => $this->created_at,
            'wallet'          => new WalletResource($this->whenLoaded('wallet')),
            'approver'        => new UserResource($this->whenLoaded('approver')),
        ];
    }
}