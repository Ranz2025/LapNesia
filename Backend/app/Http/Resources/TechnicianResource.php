<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class TechnicianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->relationLoaded('technicianProfile') ? $this->technicianProfile : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'role' => $this->role,
            'profile_photo_url' => $this->profile_photo_url,
            'bio' => $profile?->bio,
            'skills' => $profile?->skills,
            'inspection_fee' => $profile?->inspection_fee,
            'rating_avg' => $profile?->rating_avg ?? $this->avg_rating ?? 0,
            'total_inspections' => $profile?->total_inspections,
            'created_at' => $this->created_at,
        ];
    }
}
