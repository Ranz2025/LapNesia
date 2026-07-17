<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SellerProductSeeder extends Seeder
{
    public function run(): void
    {
        $brands = Brand::pluck('id', 'name');
        $categories = Category::pluck('id', 'name');

        // Pool 100 variasi produk (dirotasi per seller)
        $pool = [
            ['brand' => 'ASUS',   'category' => 'Gaming',           'model' => 'ROG Strix G15',             'cpu' => 'AMD Ryzen 9 5900HX',    'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',       'screen_size' => '15.6"', 'price' => 18500000, 'condition' => 'very_good'],
            ['brand' => 'ASUS',   'category' => 'Office',           'model' => 'ExpertBook B9',              'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '14"',   'price' => 14000000, 'condition' => 'good'],
            ['brand' => 'ASUS',   'category' => 'Ultrabook',        'model' => 'ZenBook 14 UM425',           'cpu' => 'AMD Ryzen 7 5700U',     'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '14"',   'price' => 13000000, 'condition' => 'very_good'],
            ['brand' => 'ASUS',   'category' => 'Student',          'model' => 'VivoBook 15',                'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '15.6"', 'price' => 7800000,  'condition' => 'good'],
            ['brand' => 'ASUS',   'category' => 'Gaming',           'model' => 'TUF Gaming A15',             'cpu' => 'AMD Ryzen 7 5800H',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3060',       'screen_size' => '15.6"', 'price' => 15000000, 'condition' => 'good'],

            ['brand' => 'Acer',   'category' => 'Gaming',           'model' => 'Predator Helios 300',        'cpu' => 'Intel Core i7-11800H',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => 'NVIDIA RTX 3060',       'screen_size' => '15.6"', 'price' => 16000000, 'condition' => 'very_good'],
            ['brand' => 'Acer',   'category' => 'Student',          'model' => 'Aspire 5 A515',              'cpu' => 'AMD Ryzen 5 5500U',     'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '15.6"', 'price' => 7500000,  'condition' => 'good'],
            ['brand' => 'Acer',   'category' => 'Content Creation', 'model' => 'ConceptD 5',                 'cpu' => 'Intel Core i7-11800H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080',       'screen_size' => '15.6"', 'price' => 32000000, 'condition' => 'good'],
            ['brand' => 'Acer',   'category' => 'Ultrabook',        'model' => 'Swift 5 SF514',              'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '14"',   'price' => 12500000, 'condition' => 'very_good'],
            ['brand' => 'Acer',   'category' => 'Gaming',           'model' => 'Nitro 5 AN515',              'cpu' => 'AMD Ryzen 5 5600H',     'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => 'NVIDIA GTX 1650',       'screen_size' => '15.6"', 'price' => 9500000,  'condition' => 'good'],

            ['brand' => 'Dell',   'category' => 'Office',           'model' => 'XPS 13 9310',                'cpu' => 'Intel Core i7-1185G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '13.4"', 'price' => 17000000, 'condition' => 'very_good'],
            ['brand' => 'Dell',   'category' => 'Gaming',           'model' => 'Alienware m15 R6',           'cpu' => 'Intel Core i9-11900H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080',       'screen_size' => '15.6"', 'price' => 28000000, 'condition' => 'very_good'],
            ['brand' => 'Dell',   'category' => 'Ultrabook',        'model' => 'XPS 15 9510',                'cpu' => 'Intel Core i7-11800H',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3050 Ti',    'screen_size' => '15.6"', 'price' => 22000000, 'condition' => 'very_good'],
            ['brand' => 'Dell',   'category' => 'Student',          'model' => 'Inspiron 15 3511',           'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '15.6"', 'price' => 8200000,  'condition' => 'good'],
            ['brand' => 'Dell',   'category' => 'Office',           'model' => 'Latitude 7420',              'cpu' => 'Intel Core i7-1185G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                    'screen_size' => '14"',   'price' => 16500000, 'condition' => 'good'],

            ['brand' => 'HP',     'category' => 'Office',           'model' => 'EliteBook 840 G8',           'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '14"',   'price' => 12000000, 'condition' => 'good'],
            ['brand' => 'HP',     'category' => 'Student',          'model' => 'Pavilion 15',                'cpu' => 'AMD Ryzen 5 5600H',     'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => 'NVIDIA GTX 1650',       'screen_size' => '15.6"', 'price' => 8500000,  'condition' => 'good'],
            ['brand' => 'HP',     'category' => 'Ultrabook',        'model' => 'Spectre x360 14',            'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '13.5"', 'price' => 18000000, 'condition' => 'good'],
            ['brand' => 'HP',     'category' => 'Gaming',           'model' => 'OMEN 15',                    'cpu' => 'AMD Ryzen 7 5800H',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',       'screen_size' => '15.6"', 'price' => 17500000, 'condition' => 'very_good'],
            ['brand' => 'HP',     'category' => 'Office',           'model' => 'ProBook 450 G8',             'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '15.6"', 'price' => 9800000,  'condition' => 'good'],

            ['brand' => 'Lenovo', 'category' => 'Office',           'model' => 'ThinkPad X1 Carbon Gen9',   'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                    'screen_size' => '14"',   'price' => 19000000, 'condition' => 'very_good'],
            ['brand' => 'Lenovo', 'category' => 'Gaming',           'model' => 'Legion 5 Pro',               'cpu' => 'AMD Ryzen 7 5800H',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',       'screen_size' => '16"',   'price' => 17500000, 'condition' => 'very_good'],
            ['brand' => 'Lenovo', 'category' => 'Student',          'model' => 'IdeaPad Slim 5',             'cpu' => 'AMD Ryzen 5 5500U',     'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '14"',   'price' => 8000000,  'condition' => 'good'],
            ['brand' => 'Lenovo', 'category' => 'Content Creation', 'model' => 'ThinkPad X1 Extreme Gen4',  'cpu' => 'Intel Core i9-11950H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080',       'screen_size' => '16"',   'price' => 35000000, 'condition' => 'needs_repair'],
            ['brand' => 'Lenovo', 'category' => 'Ultrabook',        'model' => 'Yoga Slim 7',                'cpu' => 'AMD Ryzen 7 5800U',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                    'screen_size' => '14"',   'price' => 14000000, 'condition' => 'very_good'],

            ['brand' => 'MSI',    'category' => 'Gaming',           'model' => 'GF65 Thin',                  'cpu' => 'Intel Core i7-10750H',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3060',       'screen_size' => '15.6"', 'price' => 14500000, 'condition' => 'good'],
            ['brand' => 'MSI',    'category' => 'Content Creation', 'model' => 'Creator 15',                 'cpu' => 'Intel Core i7-11800H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',       'screen_size' => '15.6"', 'price' => 25000000, 'condition' => 'very_good'],
            ['brand' => 'MSI',    'category' => 'Gaming',           'model' => 'Raider GE76',                'cpu' => 'Intel Core i9-11980HK', 'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080',       'screen_size' => '17.3"', 'price' => 38000000, 'condition' => 'very_good'],
            ['brand' => 'MSI',    'category' => 'Office',           'model' => 'Modern 14',                  'cpu' => 'Intel Core i5-1155G7',  'ram' => 8,  'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                    'screen_size' => '14"',   'price' => 8900000,  'condition' => 'good'],
            ['brand' => 'MSI',    'category' => 'Student',          'model' => 'Prestige 14',                'cpu' => 'Intel Core i7-1185G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA GTX 1650 Ti',    'screen_size' => '14"',   'price' => 13500000, 'condition' => 'good'],

            ['brand' => 'Apple',  'category' => 'Content Creation', 'model' => 'MacBook Pro 14 M1 Pro',      'cpu' => 'Apple M1 Pro',          'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '14.2"', 'price' => 30000000, 'condition' => 'very_good'],
            ['brand' => 'Apple',  'category' => 'Ultrabook',        'model' => 'MacBook Air M1',             'cpu' => 'Apple M1',              'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '13.3"', 'price' => 14500000, 'condition' => 'good'],
            ['brand' => 'Apple',  'category' => 'Content Creation', 'model' => 'MacBook Pro 16 M1 Max',      'cpu' => 'Apple M1 Max',          'ram' => 32, 'storage' => 1024, 'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '16.2"', 'price' => 45000000, 'condition' => 'very_good'],
            ['brand' => 'Apple',  'category' => 'Ultrabook',        'model' => 'MacBook Air M2',             'cpu' => 'Apple M2',              'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '13.6"', 'price' => 18000000, 'condition' => 'very_good'],
            ['brand' => 'Apple',  'category' => 'Content Creation', 'model' => 'MacBook Pro 13 M2',          'cpu' => 'Apple M2',              'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                    'screen_size' => '13.3"', 'price' => 22000000, 'condition' => 'good'],
        ];

        $locations = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan', 'Semarang', 'Makassar', 'Palembang'];
        $poolSize = count($pool);
        $imageBase = 100; // offset agar tidak bentrok dengan seeder lain

        $sellers = User::where('email', 'like', 'seller%@example.com')
            ->orderBy('id')
            ->get();

        if ($sellers->isEmpty()) {
            $this->command->warn('⚠️  Tidak ada seller@example.com. Jalankan BulkUserSeeder dulu.');

            return;
        }

        $idx = 0;
        foreach ($sellers as $sellerNo => $seller) {
            for ($p = 0; $p < 5; $p++) {
                $data = $pool[$idx % $poolSize];
                $brandId = $brands[$data['brand']] ?? null;
                $categoryId = $categories[$data['category']] ?? null;

                if (! $brandId || ! $categoryId) {
                    $idx++;

                    continue;
                }

                // Slug unik
                $base = Str::slug($data['brand'].' '.$data['model']);
                $slug = $base;
                $c = 2;
                while (Product::where('slug', $slug)->exists()) {
                    $slug = $base.'-'.$c++;
                }

                $product = Product::create([
                    'seller_id' => $seller->id,
                    'brand_id' => $brandId,
                    'category_id' => $categoryId,
                    'model' => $data['model'],
                    'slug' => $slug,
                    'cpu' => $data['cpu'],
                    'ram' => $data['ram'],
                    'storage' => $data['storage'],
                    'storage_type' => $data['storage_type'],
                    'gpu' => $data['gpu'],
                    'screen_size' => $data['screen_size'],
                    'price' => $data['price'],
                    'condition' => $data['condition'],
                    'location' => $locations[($sellerNo + $p) % count($locations)],
                    'description' => 'Laptop '.$data['brand'].' '.$data['model'].' kondisi '.str_replace('_', ' ', $data['condition']).'. Siap pakai, bisa COD area '.$locations[($sellerNo + $p) % count($locations)].'.',
                    'status' => 'active',
                    'stock' => ($idx % 3) + 1, // rotasi 1, 2, 3
                ]);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => 'https://picsum.photos/400/300?random='.($imageBase + $idx),
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);

                $idx++;
            }
        }

        $total = $sellers->count() * 5;
        $this->command->info("✅ Berhasil: {$total} produk ditambahkan untuk {$sellers->count()} seller.");
    }
}
