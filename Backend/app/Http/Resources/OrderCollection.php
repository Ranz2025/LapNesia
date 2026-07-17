<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * @mixin \App\Models\OrderCollection.php
 */
class OrderCollection extends ResourceCollection
{
    public function toArray($request): array
    {
        return [
            'data' => OrderResource::collection($this->collection),
        ];
    }
}
