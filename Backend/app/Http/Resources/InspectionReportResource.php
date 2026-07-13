<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InspectionReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'overall_score'    => $this->overall_score,
            'battery_status'   => $this->battery_status,
            'battery_notes'    => $this->battery_notes,
            'screen_status'    => $this->screen_status,
            'screen_notes'     => $this->screen_notes,
            'keyboard_status'  => $this->keyboard_status,
            'keyboard_notes'   => $this->keyboard_notes,
            'touchpad_status'  => $this->touchpad_status,
            'touchpad_notes'   => $this->touchpad_notes,
            'port_status'      => $this->port_status,
            'port_notes'       => $this->port_notes,
            'storage_status'   => $this->storage_status,
            'storage_notes'    => $this->storage_notes,
            'ram_status'       => $this->ram_status,
            'ram_notes'        => $this->ram_notes,
            'cpu_status'       => $this->cpu_status,
            'cpu_notes'        => $this->cpu_notes,
            'physical_status'  => $this->physical_status,
            'physical_notes'   => $this->physical_notes,
            'notes'            => $this->notes,
            'recommendation'   => $this->recommendation,
            'published_at'     => $this->published_at,
            'expires_at'       => $this->expires_at,
            'pdf_url'          => $this->pdf_url,
            'technician'       => $this->whenLoaded('technician', fn() => [
                'id'   => $this->technician->id,
                'name' => $this->technician->name,
            ]),
            'photos'           => $this->whenLoaded('photos', fn() =>
                $this->photos->map(fn($p) => [
                    'id'      => $p->id,
                    'url'     => $p->url,
                    'caption' => $p->caption,
                ])
            ),
        ];
    }
}
