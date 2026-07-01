<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InspectionRatingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'job_id' => $this->job_id,
            'technician_id' => $this->technician_id,
            'buyer_id' => $this->buyer_id,
            'rating' => $this->rating,
            'review' => $this->review,
            'created_at' => $this->created_at,
        ];
    }
}
