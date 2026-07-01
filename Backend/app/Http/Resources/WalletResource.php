<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'available_balance' => (float) $this->available_balance,
            'held_balance'      => (float) $this->held_balance,
            'frozen_balance'    => (float) $this->frozen_balance,
            'total_balance'     => (float) $this->available_balance + (float) $this->held_balance + (float) $this->frozen_balance,
            'updated_at'        => $this->updated_at,
        ];
    }
}
