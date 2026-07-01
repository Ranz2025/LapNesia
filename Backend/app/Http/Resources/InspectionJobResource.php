<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectionJobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $scheduleDate = $this->schedule_date;

        return [
            'id'             => $this->id,
            'status'         => $this->status,
            'fee'            => $this->fee,
            'schedule_date'  => $scheduleDate,
            // Aliases used by frontend
            'scheduled_date' => $scheduleDate ? $scheduleDate->toDateString() : null,
            'scheduled_time' => $scheduleDate ? $scheduleDate->format('H:i') : null,
            // Laptop info from product
            'laptop_brand'   => $this->whenLoaded('product', fn() =>
                optional($this->product->brand)->name ?? $this->product->model
            ),
            'laptop_model'   => $this->whenLoaded('product', fn() => $this->product->model),
            'issues_description' => $this->issues_description ?? null,
            'address'        => $this->address ?? null,
            'laptop_address' => $this->laptop_address ?? null,
            // Technician-set schedule fields
            'scheduled_by_technician'   => $this->scheduled_by_technician,
            'inspection_notes'          => $this->inspection_notes,
            'technician_schedule_date'  => $this->technician_schedule_date?->toDateString(),
            'technician_schedule_time'  => $this->technician_schedule_time,
            'technician_schedule_notes' => $this->technician_schedule_notes,
            'product'        => $this->whenLoaded('product', fn() => [
                'id'    => $this->product->id,
                'model' => $this->product->model,
                'slug'  => $this->product->slug,
                'seller' => $this->product->relationLoaded('seller') ? [
                    'id'   => $this->product->seller->id,
                    'name' => $this->product->seller->name,
                ] : null,
            ]),
            'technician'     => $this->whenLoaded('technician', fn() => [
                'id'   => $this->technician->id,
                'name' => $this->technician->name,
            ]),
            'buyer'          => $this->whenLoaded('requester', fn() => [
                'id'   => $this->requester->id,
                'name' => $this->requester->name,
            ]),
            'requester'      => $this->whenLoaded('requester', fn() => [
                'id'   => $this->requester->id,
                'name' => $this->requester->name,
            ]),
            'payment'        => $this->whenLoaded('payment', fn() =>
                $this->payment ? new InspectionPaymentResource($this->payment) : null
            ),
            'report'         => $this->whenLoaded('report', fn() =>
                $this->report ? new InspectionReportResource($this->report) : null
            ),
            'rating'         => $this->whenLoaded('rating', fn() =>
                $this->rating ? new InspectionRatingResource($this->rating) : null
            ),
            'buyer_rating'   => $this->whenLoaded('rating', fn() =>
                $this->rating?->rating
            ),
            'created_at'     => $this->created_at,
        ];
    }
}
