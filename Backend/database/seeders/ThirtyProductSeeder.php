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

class ThirtyProductSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil semua seller yang ada
        $seller = User::where('role', 'seller')->first();

        if (! $seller) {
            $this->command->error('❌ Tidak ada user dengan role seller. Buat user seller dulu.');

            return;
        }

        $brands = Brand::pluck('id', 'name');
        $categories = Category::pluck('id', 'name');

        if ($brands->isEmpty() || $categories->isEmpty()) {
            $this->command->error('❌ Brand/Category belum ada. Jalankan BrandSeeder & CategorySeeder dulu.');

            return;
        }

        // Hapus semua produk beserta data terkait (disable FK sementara)
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0');
        ProductImage::query()->delete();
        \DB::table('inspection_jobs')->delete();
        \DB::table('orders')->delete();
        \DB::table('carts')->delete();
        \DB::table('wishlists')->delete();
        \DB::table('ratings')->delete();
        Product::query()->delete();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1');
        $this->command->warn('⚠️  Semua produk lama dan data terkait telah dihapus.');

        $locations = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan', 'Semarang', 'Makassar', 'Palembang'];

        // 30 produk laptop bekas yang bervariasi
        $products = [
            // ASUS (5 produk)
            ['brand' => 'ASUS',   'category' => 'Gaming',           'model' => 'ROG Strix G15',            'cpu' => 'AMD Ryzen 9 5900HX',    'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',    'screen_size' => '15.6"', 'price' => 18500000, 'condition' => 'very_good'],
            ['brand' => 'ASUS',   'category' => 'Office',           'model' => 'ExpertBook B9',             'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '14"',   'price' => 14000000, 'condition' => 'good'],
            ['brand' => 'ASUS',   'category' => 'Ultrabook',        'model' => 'ZenBook 14 UM425',          'cpu' => 'AMD Ryzen 7 5700U',     'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '14"',   'price' => 13000000, 'condition' => 'very_good'],
            ['brand' => 'ASUS',   'category' => 'Student',          'model' => 'VivoBook 15',               'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '15.6"', 'price' => 7800000,  'condition' => 'good'],
            ['brand' => 'ASUS',   'category' => 'Gaming',           'model' => 'TUF Gaming A15',            'cpu' => 'AMD Ryzen 7 5800H',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3060',    'screen_size' => '15.6"', 'price' => 15000000, 'condition' => 'good'],

            // Acer (5 produk)
            ['brand' => 'Acer',   'category' => 'Gaming',           'model' => 'Predator Helios 300',       'cpu' => 'Intel Core i7-11800H',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => 'NVIDIA RTX 3060',    'screen_size' => '15.6"', 'price' => 16000000, 'condition' => 'very_good'],
            ['brand' => 'Acer',   'category' => 'Student',          'model' => 'Aspire 5 A515',             'cpu' => 'AMD Ryzen 5 5500U',     'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '15.6"', 'price' => 7500000,  'condition' => 'good'],
            ['brand' => 'Acer',   'category' => 'Content Creation', 'model' => 'ConceptD 5',                'cpu' => 'Intel Core i7-11800H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080',    'screen_size' => '15.6"', 'price' => 32000000, 'condition' => 'good'],
            ['brand' => 'Acer',   'category' => 'Ultrabook',        'model' => 'Swift 5 SF514',             'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '14"',   'price' => 12500000, 'condition' => 'very_good'],
            ['brand' => 'Acer',   'category' => 'Gaming',           'model' => 'Nitro 5 AN515',             'cpu' => 'AMD Ryzen 5 5600H',     'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => 'NVIDIA GTX 1650',    'screen_size' => '15.6"', 'price' => 9500000,  'condition' => 'good'],

            // Dell (5 produk)
            ['brand' => 'Dell',   'category' => 'Office',           'model' => 'XPS 13 9310',               'cpu' => 'Intel Core i7-1185G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '13.4"', 'price' => 17000000, 'condition' => 'very_good'],
            ['brand' => 'Dell',   'category' => 'Gaming',           'model' => 'Alienware m15 R6',          'cpu' => 'Intel Core i9-11900H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080',    'screen_size' => '15.6"', 'price' => 28000000, 'condition' => 'very_good'],
            ['brand' => 'Dell',   'category' => 'Ultrabook',        'model' => 'XPS 15 9510',               'cpu' => 'Intel Core i7-11800H',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3050 Ti', 'screen_size' => '15.6"', 'price' => 22000000, 'condition' => 'very_good'],
            ['brand' => 'Dell',   'category' => 'Student',          'model' => 'Inspiron 15 3511',          'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '15.6"', 'price' => 8200000,  'condition' => 'good'],
            ['brand' => 'Dell',   'category' => 'Office',           'model' => 'Latitude 7420',             'cpu' => 'Intel Core i7-1185G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                 'screen_size' => '14"',   'price' => 16500000, 'condition' => 'good'],

            // HP (5 produk)
            ['brand' => 'HP',     'category' => 'Office',           'model' => 'EliteBook 840 G8',          'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '14"',   'price' => 12000000, 'condition' => 'good'],
            ['brand' => 'HP',     'category' => 'Student',          'model' => 'Pavilion 15',               'cpu' => 'AMD Ryzen 5 5600H',     'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => 'NVIDIA GTX 1650',    'screen_size' => '15.6"', 'price' => 8500000,  'condition' => 'good'],
            ['brand' => 'HP',     'category' => 'Ultrabook',        'model' => 'Spectre x360 14',           'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '13.5"', 'price' => 18000000, 'condition' => 'good'],
            ['brand' => 'HP',     'category' => 'Gaming',           'model' => 'OMEN 15',                   'cpu' => 'AMD Ryzen 7 5800H',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',    'screen_size' => '15.6"', 'price' => 17500000, 'condition' => 'very_good'],
            ['brand' => 'HP',     'category' => 'Office',           'model' => 'ProBook 450 G8',            'cpu' => 'Intel Core i5-1135G7',  'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '15.6"', 'price' => 9800000,  'condition' => 'good'],

            // Lenovo (5 produk)
            ['brand' => 'Lenovo', 'category' => 'Office',           'model' => 'ThinkPad X1 Carbon Gen9',  'cpu' => 'Intel Core i7-1165G7',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                 'screen_size' => '14"',   'price' => 19000000, 'condition' => 'very_good'],
            ['brand' => 'Lenovo', 'category' => 'Gaming',           'model' => 'Legion 5 Pro',              'cpu' => 'AMD Ryzen 7 5800H',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',    'screen_size' => '16"',   'price' => 17500000, 'condition' => 'very_good'],
            ['brand' => 'Lenovo', 'category' => 'Student',          'model' => 'IdeaPad Slim 5',            'cpu' => 'AMD Ryzen 5 5500U',     'ram' => 8,  'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '14"',   'price' => 8000000,  'condition' => 'good'],
            ['brand' => 'Lenovo', 'category' => 'Content Creation', 'model' => 'ThinkPad X1 Extreme Gen4', 'cpu' => 'Intel Core i9-11950H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080',    'screen_size' => '16"',   'price' => 35000000, 'condition' => 'needs_repair'],
            ['brand' => 'Lenovo', 'category' => 'Ultrabook',        'model' => 'Yoga Slim 7',               'cpu' => 'AMD Ryzen 7 5800U',     'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                 'screen_size' => '14"',   'price' => 14000000, 'condition' => 'very_good'],

            // MSI (3 produk)
            ['brand' => 'MSI',    'category' => 'Gaming',           'model' => 'GF65 Thin',                 'cpu' => 'Intel Core i7-10750H',  'ram' => 16, 'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3060',    'screen_size' => '15.6"', 'price' => 14500000, 'condition' => 'good'],
            ['brand' => 'MSI',    'category' => 'Content Creation', 'model' => 'Creator 15',                'cpu' => 'Intel Core i7-11800H',  'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070',    'screen_size' => '15.6"', 'price' => 25000000, 'condition' => 'very_good'],
            ['brand' => 'MSI',    'category' => 'Office',           'model' => 'Modern 14',                 'cpu' => 'Intel Core i5-1155G7',  'ram' => 8,  'storage' => 512,  'storage_type' => 'NVMe', 'gpu' => null,                 'screen_size' => '14"',   'price' => 8900000,  'condition' => 'good'],

            // Apple (2 produk)
            ['brand' => 'Apple',  'category' => 'Content Creation', 'model' => 'MacBook Pro 14 M1 Pro',    'cpu' => 'Apple M1 Pro',          'ram' => 16, 'storage' => 512,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '14.2"', 'price' => 30000000, 'condition' => 'very_good'],
            ['brand' => 'Apple',  'category' => 'Ultrabook',        'model' => 'MacBook Air M1',            'cpu' => 'Apple M1',              'ram' => 8,  'storage' => 256,  'storage_type' => 'SSD',  'gpu' => null,                 'screen_size' => '13.3"', 'price' => 14500000, 'condition' => 'good'],
        ];

        // Mapping foto lokal untuk tiap model produk
        $imageMap = [
            'ROG Strix G15' => 'products/asus-rog-strix-g15.jpg.jpeg',
            'ExpertBook B9' => 'products/asus-expertbook-b9.jpg.jpeg',
            'ZenBook 14 UM425' => 'products/asus-zenbook-14-um425.jpg.jpeg',
            'VivoBook 15' => 'products/asus-vivobook-15.jpg.jpeg',
            'TUF Gaming A15' => 'products/asus-tuf-gaming-a15.webp',
            'Predator Helios 300' => 'products/acer-predator-helios-300.webp',
            'Aspire 5 A515' => 'products/acer-aspire 5-a515.jpg.jpeg',
            'ConceptD 5' => 'products/acer-conceptd-5.webp',
            'Swift 5 SF514' => 'products/acer-swift-5-sf514.jpg.jpeg',
            'Nitro 5 AN515' => 'products/acer nitro 5-an515.jpg.jpeg',
            'XPS 13 9310' => 'products/dell-xps-13-9310.jpg.jpeg',
            'Alienware m15 R6' => 'products/dell alienware m15-r6.jpg.jpeg',
            'XPS 15 9510' => 'products/dell xps 15-9510.jpg.jpeg',
            'Inspiron 15 3511' => 'products/dell inspiron 15-3511.jpg.jpeg',
            'Latitude 7420' => 'products/dell latitude 7420.jpg.jpeg',
            'EliteBook 840 G8' => 'products/hp-elitebook 840-g8.avif',
            'Pavilion 15' => 'products/hp pavillion 15.jpg.jpeg',
            'Spectre x360 14' => 'products/hp spectre x360-14.jpg.jpeg',
            'OMEN 15' => 'products/hp omen 15.jpg.jpeg',
            'ProBook 450 G8' => 'products/hp probook 450-g8.jpg.jpeg',
            'ThinkPad X1 Carbon Gen9' => 'products/lenovo thinkpad x1-carbon-gen9.jpg.jpeg',
            'Legion 5 Pro' => 'products/lenovo legion 5-pro.jpg.jpeg',
            'IdeaPad Slim 5' => 'products/lenovo ideapad slim-5-.jpg.jpeg',
            'ThinkPad X1 Extreme Gen4' => 'products/Lenovo ThinkPad X1 Extreme Gen 4.avif',
            'Yoga Slim 7' => 'products/lenovo yoga slim-7.png',
            'GF65 Thin' => 'products/msi-gf65-thin.jpg.jpeg',
            'Creator 15' => 'products/msi creator 15.avif',
            'Modern 14' => 'products/msi modern 14.png',
            'MacBook Pro 14 M1 Pro' => 'products/apple macbook pro-14-m1-pro.jpg.jpeg',
            'MacBook Air M1' => 'products/apple macbook air-m1.jpg.jpeg',
        ];

        // Ambil semua seller untuk rotasi
        $sellers = User::where('role', 'seller')->pluck('id')->toArray();
        $sellerCount = count($sellers);

        foreach ($products as $i => $data) {
            $brandId = $brands[$data['brand']] ?? null;
            $categoryId = $categories[$data['category']] ?? null;

            if (! $brandId || ! $categoryId) {
                $this->command->warn("⚠️  Brand '{$data['brand']}' atau Category '{$data['category']}' tidak ditemukan. Produk ke-".($i + 1).' dilewati.');

                continue;
            }

            // Buat slug unik
            $base = Str::slug($data['brand'].' '.$data['model']);
            $slug = $base;
            $c = 2;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $base.'-'.$c++;
            }

            // Rotasi seller agar produk terdistribusi
            $assignedSeller = $sellers[$i % $sellerCount];

            $product = Product::create([
                'seller_id' => $assignedSeller,
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
                'location' => $locations[$i % count($locations)],
                'description' => 'Laptop '.$data['brand'].' '.$data['model']
                    .' kondisi '.str_replace('_', ' ', $data['condition'])
                    .'. Siap pakai, bisa COD area '.$locations[$i % count($locations)].'.',
                'status' => 'active',
                'stock' => ($i % 3) + 1,
            ]);

            $imageUrl = $imageMap[$data['model']] ?? 'products/asus-vivobook-15.jpg.jpeg';

            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $imageUrl,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        $total = Product::count();
        $this->command->info("✅ Selesai! Total produk di database: {$total}");
    }
}
