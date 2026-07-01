<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            'ASUS',
            'Acer',
            'Dell',
            'HP',
            'Lenovo',
            'MSI',
            'Apple',
        ];

        foreach ($brands as $brand) {
            Brand::create([
                'name' => $brand,
                'slug' => Str::slug($brand),
            ]);
        }
    }
}
