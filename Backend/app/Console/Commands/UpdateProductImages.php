<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\ProductImage;

class UpdateProductImages extends Command
{
    protected $signature = 'products:update-images';
    protected $description = 'Update image_url produk yang ada di database dengan foto lokal dari folder products/';

    // Mapping model produk ke file foto lokal
    private array $imageMap = [
        'ROG Strix G15'            => 'products/asus-rog-strix-g15.jpg.jpeg',
        'ExpertBook B9'            => 'products/asus-expertbook-b9.jpg.jpeg',
        'ZenBook 14 UM425'         => 'products/asus-zenbook-14-um425.jpg.jpeg',
        'VivoBook 15'              => 'products/asus-vivobook-15.jpg.jpeg',
        'TUF Gaming A15'           => 'products/asus-tuf-gaming-a15.webp',
        'Predator Helios 300'      => 'products/acer-predator-helios-300.webp',
        'Aspire 5 A515'            => 'products/acer-aspire 5-a515.jpg.jpeg',
        'ConceptD 5'               => 'products/acer-conceptd-5.webp',
        'Swift 5 SF514'            => 'products/acer-swift-5-sf514.jpg.jpeg',
        'Nitro 5 AN515'            => 'products/acer nitro 5-an515.jpg.jpeg',
        'XPS 13 9310'              => 'products/dell-xps-13-9310.jpg.jpeg',
        'Alienware m15 R6'         => 'products/dell alienware m15-r6.jpg.jpeg',
        'XPS 15 9510'              => 'products/dell xps 15-9510.jpg.jpeg',
        'Inspiron 15 3511'         => 'products/dell inspiron 15-3511.jpg.jpeg',
        'Latitude 7420'            => 'products/dell latitude 7420.jpg.jpeg',
        'EliteBook 840 G8'         => 'products/hp-elitebook 840-g8.avif',
        'Pavilion 15'              => 'products/hp pavillion 15.jpg.jpeg',
        'Spectre x360 14'          => 'products/hp spectre x360-14.jpg.jpeg',
        'OMEN 15'                  => 'products/hp omen 15.jpg.jpeg',
        'ProBook 450 G8'           => 'products/hp probook 450-g8.jpg.jpeg',
        'ThinkPad X1 Carbon Gen9'  => 'products/lenovo thinkpad x1-carbon-gen9.jpg.jpeg',
        'Legion 5 Pro'             => 'products/lenovo legion 5-pro.jpg.jpeg',
        'IdeaPad Slim 5'           => 'products/lenovo ideapad slim-5-.jpg.jpeg',
        'ThinkPad X1 Extreme Gen4' => 'products/Lenovo ThinkPad X1 Extreme Gen 4.avif',
        'Yoga Slim 7'              => 'products/lenovo yoga slim-7.png',
        'GF65 Thin'                => 'products/msi-gf65-thin.jpg.jpeg',
        'Creator 15'               => 'products/msi creator 15.avif',
        'Modern 14'                => 'products/msi modern 14.png',
        'MacBook Pro 14 M1 Pro'    => 'products/apple macbook pro-14-m1-pro.jpg.jpeg',
        'MacBook Air M1'           => 'products/apple macbook air-m1.jpg.jpeg',
    ];

    public function handle(): int
    {
        $products = Product::with('images')->get();
        $updated  = 0;
        $skipped  = 0;
        $fallback = 'products/asus-vivobook-15.jpg.jpeg';

        foreach ($products as $product) {
            $imageUrl = $this->imageMap[$product->model] ?? null;

            if (!$imageUrl) {
                $this->warn("  ⚠  Tidak ada foto untuk model: {$product->model} — pakai fallback");
                $imageUrl = $fallback;
                $skipped++;
            }

            // Update atau buat primary image
            $existing = $product->images()->where('is_primary', true)->first();

            if ($existing) {
                $existing->update(['image_url' => $imageUrl]);
            } else {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url'  => $imageUrl,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }

            $this->line("  ✓  [{$product->model}] → {$imageUrl}");
            $updated++;
        }

        $this->newLine();
        $this->info("✅ Selesai! {$updated} produk diupdate, {$skipped} pakai fallback.");

        return Command::SUCCESS;
    }
}
