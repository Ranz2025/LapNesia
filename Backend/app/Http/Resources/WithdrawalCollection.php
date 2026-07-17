<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * @mixin \App\Models\WithdrawalCollection.php
 */
class WithdrawalCollection extends ResourceCollection
{
    public function toArray($request): array
    {
        return [
            'data' => WithdrawalResource::collection($this->collection),
        ];
    }
}
