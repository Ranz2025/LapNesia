<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\InspectionPayment
 */
class InspectionPaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'inspection_job_id' => $this->inspection_job_id,
            'buyer_id' => $this->buyer_id,
            'technician_id' => $this->technician_id,
            'payment_gateway' => $this->payment_gateway,
            'payment_gateway_ref' => $this->payment_gateway_ref,
            'snap_token' => $this->snap_token,
            'snap_redirect_url' => $this->snap_redirect_url,
            'payment_type' => $this->payment_type,
            'transaction_id' => $this->transaction_id,
            'gross_amount' => (float) $this->gross_amount,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
            'job' => new InspectionJobResource($this->whenLoaded('job')),
        ];
    }
}
