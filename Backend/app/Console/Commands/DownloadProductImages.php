<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DownloadProductImages extends Command
{
    protected $signature = 'products:download-images';

    protected $description = 'Download 20 laptop images and save to storage';

    public function handle()
    {
        $images = [
            'asus-rog-g15.jpg' => 'https://images.unsplash.com/photo-1587829191301-26da5f51ace9?w=500',
            'asus-expertbook-b9.jpg' => 'https://images.unsplash.com/photo-1588872657840-790ff3bde08c?w=500',
            'acer-predator-helios-300.jpg' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
            'acer-aspire-5.jpg' => 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500',
            'dell-xps-13.jpg' => 'https://images.unsplash.com/photo-1591799264318-966efe75ad36?w=500',
            'dell-alienware-m15.jpg' => 'https://images.unsplash.com/photo-1603302576837-37561b1df307?w=500',
            'hp-elitebook-840.jpg' => 'https://images.unsplash.com/photo-1586253408ca-4513f736b341?w=500',
            'hp-pavilion-15.jpg' => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500',
            'lenovo-thinkpad-x1.jpg' => 'https://images.unsplash.com/photo-1581092916550-e323be2ae537?w=500',
            'lenovo-legion-5-pro.jpg' => 'https://images.unsplash.com/photo-1603302576837-37561b1df307?w=500',
            'lenovo-ideapad-slim-5.jpg' => 'https://images.unsplash.com/photo-1611707267537-b85faf00021a?w=500',
            'msi-gf65-thin.jpg' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
            'msi-creator-15.jpg' => 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=500',
            'macbook-pro-14-m1.jpg' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
            'macbook-air-m1.jpg' => 'https://images.unsplash.com/photo-1539632346654-dd4c3cffad8c?w=500',
            'asus-zenbook-14.jpg' => 'https://images.unsplash.com/photo-1588872657840-790ff3bde08c?w=500',
            'dell-xps-15.jpg' => 'https://images.unsplash.com/photo-1603302576837-37561b1df307?w=500',
            'hp-spectre-x360.jpg' => 'https://images.unsplash.com/photo-1587829191301-26da5f51ace9?w=500',
            'acer-conceptd-5.jpg' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
            'lenovo-thinkpad-x1-extreme.jpg' => 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=500',
        ];

        $disk = Storage::disk('public');
        if (! $disk->exists('products')) {
            $disk->makeDirectory('products');
        }

        $downloaded = [];
        $failed = [];

        foreach ($images as $filename => $url) {
            try {
                $content = file_get_contents($url);
                if ($content) {
                    $disk->put('products/'.$filename, $content);
                    $downloaded[] = $filename;
                    $this->info("✓ Downloaded: $filename");
                } else {
                    $failed[] = $filename;
                    $this->warn("✗ Failed to download: $filename");
                }
            } catch (\Exception $e) {
                $failed[] = $filename;
                $this->warn("✗ Error downloading $filename: ".$e->getMessage());
            }
        }

        $this->line("\n=== SUMMARY ===");
        $this->info('Downloaded: '.count($downloaded).'/20');
        $this->warn('Failed: '.count($failed).'/20');

        if (count($downloaded) >= 15) {
            $this->info("\n✓ Sufficient images downloaded! Ready to seed.");

            return 0;
        } else {
            $this->error("\n✗ Too few images downloaded. Please check your internet connection.");

            return 1;
        }
    }
}
