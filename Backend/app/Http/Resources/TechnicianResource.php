<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TechnicianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->relationLoaded('user') ? $this->user : null;
        $profile = $this->relationLoaded('technicianProfile') ? $this->technicianProfile : null;

        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'status'            => $this->status,
            'role'              => $this->role,
            'profile_photo_url' => $this->profile_photo_url,
            'bio'               => $profile?->bio,
            'skills'            => $profile?->skills,
            'inspection_fee'    => $profile?->inspection_fee,
            'rating_avg'        => $profile?->rating_avg ?? $this->avg_rating,
            'total_inspections' => $profile?->total_inspections,
            'user'              => $user ? [
                'id'    => $user->id,
                'name'  => $user->name,
                'photo' => $user->profile_photo_url,
            ] : null,
        ];
    }
}
