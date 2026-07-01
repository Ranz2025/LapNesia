<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectionReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'overall_score'   => $this->overall_score,
            'battery_status'  => $this->battery_status,
            'screen_status'   => $this->screen_status,
            'keyboard_status' => $this->keyboard_status,
            'touchpad_status' => $this->touchpad_status,
            'port_status'     => $this->port_status,
            'storage_status'  => $this->storage_status,
            'ram_status'      => $this->ram_status,
            'cpu_status'      => $this->cpu_status,
            'physical_status' => $this->physical_status,
            'notes'           => $this->notes,
            'recommendation'  => $this->recommendation,
            'published_at'    => $this->published_at,
            'expires_at'      => $this->expires_at,
            'pdf_url'         => $this->pdf_url,
            'technician'      => $this->whenLoaded('technician', fn() => [
                'id'   => $this->technician->id,
                'name' => $this->technician->name,
            ]),
        ];
    }
}
