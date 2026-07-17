<?php

declare(strict_types=1);
$content = file_get_contents('tests/CreatesTestData.php');
$content = preg_replace('/return Product::create\(array_merge\(\[.*?\]\, \$overrides\)\);/s',
    "return Product::create(array_merge([
            'seller_id' => \$seller->id,
            'brand_id' => \$brand->id,
            'category_id' => \$category->id,
            'model' => 'VivoBook ' . uniqid(),
            'slug' => 'product-' . uniqid(),
            'cpu' => 'Intel i7',
            'ram' => 16,
            'storage' => 512,
            'storage_type' => 'SSD',
            'screen_size' => '15.6\"',
            'price' => 8000000,
            'condition' => 'very_good',
            'location' => 'Jakarta',
            'description' => 'Test product description',
            'stock' => 1,
            'status' => 'active',
        ], \$overrides));", $content);
file_put_contents('tests/CreatesTestData.php', $content);
