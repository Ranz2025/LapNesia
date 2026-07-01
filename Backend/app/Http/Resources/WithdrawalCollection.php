<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class WithdrawalCollection extends ResourceCollection
{
    public function toArray($request): array
    {
        return [
            'data' => WithdrawalResource::collection($this->collection),
        ];
    }
}