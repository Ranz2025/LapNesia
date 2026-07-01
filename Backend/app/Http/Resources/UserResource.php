<?php

namespace App\Http\Resources;

use App\Traits\MasksData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    use MasksData;

    public function toArray(Request $request): array
    {
        $authUser = $request->user();

        // Show full data only to: the user themselves, admin, or owner
        $showFull = $authUser && (
            $authUser->id === $this->id ||
            in_array($authUser->role, ['admin', 'owner'])
        );

        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $showFull ? $this->email : self::maskEmail($this->email),
            'phone'             => $showFull ? $this->phone : self::maskPhone($this->phone),
            'role'              => $this->role,
            'status'            => $this->status,
            'avg_rating'        => $this->avg_rating ?? 0,
            'address'           => $showFull ? $this->address : null,
            'profile_photo_url' => $this->profile_photo_url,
            'technician_profile' => $showFull && $this->relationLoaded('technicianProfile') && $this->technicianProfile ? [
                'id' => $this->technicianProfile->id,
                'certification_url' => $this->technicianProfile->certification_url,
                'bio' => $this->technicianProfile->bio,
                'skills' => $this->technicianProfile->skills,
            ] : null,
            'wallet'            => $showFull ? [
                'available_balance' => $this->wallet->available_balance ?? 0,
                'held_balance'      => $this->wallet->held_balance ?? 0,
            ] : null,
            'created_at' => $this->created_at,
        ];
    }
}
