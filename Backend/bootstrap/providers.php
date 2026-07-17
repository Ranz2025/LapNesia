<?php

declare(strict_types=1);

use App\Providers\AppServiceProvider;
use Barryvdh\DomPDF\ServiceProvider;

return [
    AppServiceProvider::class,
    ServiceProvider::class,
];
