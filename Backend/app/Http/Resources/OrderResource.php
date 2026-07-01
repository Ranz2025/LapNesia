<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'order_number'       => $this->order_number,
            'product_id'         => $this->product_id,
            'buyer_id'           => $this->buyer_id,
            'seller_id'          => $this->seller_id,
            'product_price'      => (float) $this->product_price,
            'platform_fee'       => (float) $this->platform_fee,
            'total_amount'       => (float) $this->total_amount,
            'product_snapshot'   => $this->product_snapshot,
            'booking_expires_at' => $this->booking_expires_at,
            'paid_at'            => $this->paid_at,
            'shipped_at'         => $this->shipped_at,
            'completed_at'       => $this->completed_at,
            'status'             => $this->status,
            'is_disputed'        => $this->is_disputed,
            'notes'              => $this->notes,
            'resi_number'        => $this->resi_number,
            'shipping_address'   => $this->shipping_address,
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
            'product'            => new ProductResource($this->whenLoaded('product')),
            'buyer'              => new UserResource($this->whenLoaded('buyer')),
            'seller'             => new UserResource($this->whenLoaded('seller')),
        ];
    }
}
