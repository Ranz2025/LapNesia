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

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::where('role', 'seller')->first();
        $brands = Brand::pluck('id', 'name');
        $categories = Category::pluck('id', 'name');

        $products = [
            ['brand' => 'ASUS', 'category' => 'Gaming', 'model' => 'ROG Strix G15', 'cpu' => 'AMD Ryzen 9 5900HX', 'ram' => 16, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => 'NVIDIA RTX 3070', 'screen_size' => '15.6"', 'price' => 18500000, 'condition' => 'very_good'],
            ['brand' => 'ASUS', 'category' => 'Office', 'model' => 'ExpertBook B9', 'cpu' => 'Intel Core i7-1165G7', 'ram' => 16, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '14"', 'price' => 14000000, 'condition' => 'good'],
            ['brand' => 'Acer', 'category' => 'Gaming', 'model' => 'Predator Helios 300', 'cpu' => 'Intel Core i7-11800H', 'ram' => 16, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => 'NVIDIA RTX 3060', 'screen_size' => '15.6"', 'price' => 16000000, 'condition' => 'very_good'],
            ['brand' => 'Acer', 'category' => 'Student', 'model' => 'Aspire 5 A515', 'cpu' => 'AMD Ryzen 5 5500U', 'ram' => 8, 'storage' => 256, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '15.6"', 'price' => 7500000, 'condition' => 'good'],
            ['brand' => 'Dell', 'category' => 'Office', 'model' => 'XPS 13 9310', 'cpu' => 'Intel Core i7-1185G7', 'ram' => 16, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '13.4"', 'price' => 17000000, 'condition' => 'very_good'],
            ['brand' => 'Dell', 'category' => 'Gaming', 'model' => 'Alienware m15 R6', 'cpu' => 'Intel Core i9-11900H', 'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080', 'screen_size' => '15.6"', 'price' => 28000000, 'condition' => 'very_good'],
            ['brand' => 'HP', 'category' => 'Office', 'model' => 'EliteBook 840 G8', 'cpu' => 'Intel Core i5-1135G7', 'ram' => 8, 'storage' => 256, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '14"', 'price' => 12000000, 'condition' => 'good'],
            ['brand' => 'HP', 'category' => 'Student', 'model' => 'Pavilion 15', 'cpu' => 'AMD Ryzen 5 5600H', 'ram' => 8, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => 'NVIDIA GTX 1650', 'screen_size' => '15.6"', 'price' => 8500000, 'condition' => 'good'],
            ['brand' => 'Lenovo', 'category' => 'Office', 'model' => 'ThinkPad X1 Carbon Gen9', 'cpu' => 'Intel Core i7-1165G7', 'ram' => 16, 'storage' => 512, 'storage_type' => 'NVMe', 'gpu' => null, 'screen_size' => '14"', 'price' => 19000000, 'condition' => 'very_good'],
            ['brand' => 'Lenovo', 'category' => 'Gaming', 'model' => 'Legion 5 Pro', 'cpu' => 'AMD Ryzen 7 5800H', 'ram' => 16, 'storage' => 512, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070', 'screen_size' => '16"', 'price' => 17500000, 'condition' => 'very_good'],
            ['brand' => 'Lenovo', 'category' => 'Student', 'model' => 'IdeaPad Slim 5', 'cpu' => 'AMD Ryzen 5 5500U', 'ram' => 8, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '14"', 'price' => 8000000, 'condition' => 'good'],
            ['brand' => 'MSI', 'category' => 'Gaming', 'model' => 'GF65 Thin', 'cpu' => 'Intel Core i7-10750H', 'ram' => 16, 'storage' => 512, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3060', 'screen_size' => '15.6"', 'price' => 14500000, 'condition' => 'good'],
            ['brand' => 'MSI', 'category' => 'Content Creation', 'model' => 'Creator 15', 'cpu' => 'Intel Core i7-11800H', 'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3070', 'screen_size' => '15.6"', 'price' => 25000000, 'condition' => 'very_good'],
            ['brand' => 'Apple', 'category' => 'Content Creation', 'model' => 'MacBook Pro 14 M1 Pro', 'cpu' => 'Apple M1 Pro', 'ram' => 16, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '14.2"', 'price' => 30000000, 'condition' => 'very_good'],
            ['brand' => 'Apple', 'category' => 'Ultrabook', 'model' => 'MacBook Air M1', 'cpu' => 'Apple M1', 'ram' => 8, 'storage' => 256, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '13.3"', 'price' => 14500000, 'condition' => 'good'],
            ['brand' => 'ASUS', 'category' => 'Ultrabook', 'model' => 'ZenBook 14 UM425', 'cpu' => 'AMD Ryzen 7 5700U', 'ram' => 16, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '14"', 'price' => 13000000, 'condition' => 'very_good'],
            ['brand' => 'Dell', 'category' => 'Ultrabook', 'model' => 'XPS 15 9510', 'cpu' => 'Intel Core i7-11800H', 'ram' => 16, 'storage' => 512, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3050 Ti', 'screen_size' => '15.6"', 'price' => 22000000, 'condition' => 'very_good'],
            ['brand' => 'HP', 'category' => 'Ultrabook', 'model' => 'Spectre x360 14', 'cpu' => 'Intel Core i7-1165G7', 'ram' => 16, 'storage' => 512, 'storage_type' => 'SSD', 'gpu' => null, 'screen_size' => '13.5"', 'price' => 18000000, 'condition' => 'good'],
            ['brand' => 'Acer', 'category' => 'Content Creation', 'model' => 'ConceptD 5', 'cpu' => 'Intel Core i7-11800H', 'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080', 'screen_size' => '15.6"', 'price' => 32000000, 'condition' => 'good'],
            ['brand' => 'Lenovo', 'category' => 'Content Creation', 'model' => 'ThinkPad X1 Extreme Gen4', 'cpu' => 'Intel Core i9-11950H', 'ram' => 32, 'storage' => 1024, 'storage_type' => 'NVMe', 'gpu' => 'NVIDIA RTX 3080', 'screen_size' => '16"', 'price' => 35000000, 'condition' => 'needs_repair'],
        ];

        foreach ($products as $i => $data) {
            $brandId = $brands[$data['brand']] ?? null;
            $categoryId = $categories[$data['category']] ?? null;
            if (! $brandId || ! $categoryId) {
                continue;
            }

            $slug = Str::slug($data['brand'].' '.$data['model']);
            $originalSlug = $slug;
            $counter = 2;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$counter++;
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
                'location' => 'Jakarta',
                'description' => 'Laptop '.$data['brand'].' '.$data['model'].' kondisi '.str_replace('_', ' ', $data['condition']).'.',
                'status' => 'active',
            ]);

            // Add product image
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => 'https://picsum.photos/400/300?random='.($i + 1),
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
