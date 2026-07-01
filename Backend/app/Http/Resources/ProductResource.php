<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Latest published inspection report
        $latestReport = $this->inspectionJobs()
            ->with('report')
            ->get()
            ->pluck('report')
            ->filter()
            ->sortByDesc('published_at')
            ->first();

        return [
            'id'          => $this->id,
            'slug'        => $this->slug,
            'model'       => $this->model,
            'brand'       => [
                'id'   => $this->brand_id,
                'name' => $this->brand->name ?? null,
                'slug' => $this->brand->slug ?? null,
            ],
            'category' => [
                'id'   => $this->category_id,
                'name' => $this->category->name ?? null,
            ],
            'cpu'          => $this->cpu,
            'ram'          => $this->ram,
            'storage'      => $this->storage,
            'storage_type' => $this->storage_type,
            'gpu'          => $this->gpu,
            'screen_size'  => $this->screen_size,
            'price'        => $this->price,
            'condition'    => $this->condition,
            'location'     => $this->location,
            'description'  => $this->description,
            'status'       => $this->status,
            'stock'        => (int) ($this->stock ?? 0),
            'is_out_of_stock' => (int) ($this->stock ?? 0) <= 0,
            'is_sold'      => $this->status === 'sold',
            'inspection_ready' => (bool) $this->inspection_ready,
            'avg_rating'   => (float) ($this->avg_rating ?? 0),
            'is_spec_verified' => (bool) $this->is_spec_verified,
            'primary_image' => optional($this->images->where('is_primary', true)->first())->image_url
                ?? optional($this->images->first())->image_url ?? null,
            'all_images' => $this->images->sortBy('sort_order')->values()->map(fn($img) => [
                'id'         => $img->id,
                'url'        => $img->image_url,
                'is_primary' => (bool) $img->is_primary,
            ]),
            'seller' => $this->seller ? [
                'id'                => $this->seller->id,
                'name'              => $this->seller->name,
                'avg_rating'        => (float) ($this->seller->avg_rating ?? 0),
                'profile_photo_url' => $this->seller->profile_photo_url,
            ] : null,
            'latest_inspection_report' => $latestReport ? [
                'id'           => $latestReport->id,
                'overall_score' => $latestReport->overall_score,
                'published_at' => $latestReport->published_at,
                'expires_at'   => $latestReport->expires_at,
                'pdf_url'      => $latestReport->pdf_url,
                'recommendation' => $latestReport->recommendation,
                'is_expired'   => $latestReport->expires_at
                    ? $latestReport->expires_at->isPast()
                    : true,
            ] : null,
            'created_at' => $this->created_at,
        ];
    }
}
