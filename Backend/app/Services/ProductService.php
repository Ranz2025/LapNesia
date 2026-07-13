<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Get products with search, filters and pagination
     */
    public function getProducts(array $filters): LengthAwarePaginator
    {
        // Untuk halaman listing, tidak perlu eager-load inspectionJobs.report
        // karena memperberat query secara signifikan. Hanya load relasi yang ditampilkan.
        $query = Product::with(['brand', 'category', 'images'])
            ->whereIn('status', ['active', 'sold']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('model', 'like', "%{$search}%")
                  ->orWhere('cpu', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['brand'])) {
            $query->whereHas('brand', function($q) use ($filters) {
                $q->where('slug', $filters['brand']);
            });
        }

        if (!empty($filters['category'])) {
            $query->whereHas('category', function($q) use ($filters) {
                $q->where('slug', $filters['category']);
            });
        }

        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        $sort = $filters['sort'] ?? 'latest';
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        return $query->paginate(50);
    }

    /**
     * Get a single product by slug
     */
    public function getProductBySlug(string $slug): ?Product
    {
        return Product::with(['brand', 'category', 'images', 'seller', 'inspectionJobs.report'])
            ->where('slug', $slug)
            ->first();
    }

    /**
     * Create a new product for a seller
     */
    public function createProduct(array $data, string $sellerId): Product
    {
        return DB::transaction(function () use ($data, $sellerId) {
            $brand = Brand::findOrFail($data['brand_id']);
            $data['slug'] = $this->generateUniqueSlug($brand->name . ' ' . $data['model']);
            $data['seller_id'] = $sellerId;
            // Produk masuk status pending, menunggu inspeksi sebelum aktif
            $data['status'] = 'pending';
            // Default stock ke 1 jika tidak diisi
            $data['stock'] = $data['stock'] ?? 1;
            // Default inspection_ready ke false
            $data['inspection_ready'] = isset($data['inspection_ready'])
                ? (bool) $data['inspection_ready']
                : false;

            $product = Product::create($data);

            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $imageUrl) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url'  => $imageUrl,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ]);
                }
            }

            return $product;
        });
    }

    /**
     * Update an existing product
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            if (!empty($data['model']) && $data['model'] !== $product->model) {
                $brandName = $product->brand->name;
                $product->slug = $this->generateUniqueSlug($brandName . ' ' . $data['model']);
            }

            $product->update($data);

            return $product->fresh(['brand', 'category', 'images', 'seller']);
        });
    }

    /**
     * Delete a product
     */
    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }

    /**
     * Generate unique slug
     */
    private function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . (++$count);
        }

        return $slug;
    }
}
