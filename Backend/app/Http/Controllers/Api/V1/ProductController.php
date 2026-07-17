<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    /** Public: list products with pagination */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['brand', 'category', 'images', 'seller:id,name,profile_photo_url'])
            ->where('status', 'active');

        if ($request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->search) {
            $query->where('model', 'like', '%'.$request->search.'%');
        }
        if ($request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->condition) {
            $query->where('condition', $request->condition);
        }
        if ($request->location) {
            $query->where('location', 'like', '%'.$request->location.'%');
        }

        $sortField = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['price', 'created_at', 'avg_rating'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $products = $query->paginate($request->get('per_page', 12));

        return $this->successResponse($products);
    }

    /** Public: show single product by slug */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'images', 'seller:id,name,profile_photo_url,avg_rating'])
            ->where('slug', $slug)
            ->firstOrFail();

        return $this->successResponse($product);
    }

    /** Seller: list own products */
    public function sellerProducts(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Product::class);

        $products = Product::with(['brand', 'category', 'images'])
            ->where('seller_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return $this->successResponse($products);
    }

    /** Seller: show own single product */
    public function sellerProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::with(['brand', 'category', 'images'])->findOrFail($id);

        Gate::authorize('update', $product);

        return $this->successResponse($product);
    }

    /** Seller: store new product */
    public function store(StoreProductRequest $request): JsonResponse
    {
        Gate::authorize('create', Product::class);

        $data = $request->validated();
        $data['seller_id'] = $request->user()->id;
        $data['slug'] = Str::slug($data['model'].'-'.Str::random(6));
        $data['status'] = 'active';

        $images = $data['images'] ?? [];
        unset($data['images']);

        $product = Product::create($data);

        if (! empty($images)) {
            foreach ($images as $i => $url) {
                $product->images()->create(['image_url' => $url, 'sort_order' => $i]);
            }
        }

        return $this->successResponse($product->load(['brand', 'category', 'images']), 'Produk berhasil ditambahkan.', 201);
    }

    /** Seller: update product */
    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        Gate::authorize('update', $product);

        $product->update($request->validated());

        return $this->successResponse($product->fresh()->load(['brand', 'category', 'images']), 'Produk berhasil diperbarui.');
    }

    /** Seller: archive product (soft delete) */
    public function archive(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        Gate::authorize('archive', $product);

        $product->update(['status' => 'archived']);

        return $this->successResponse($product->fresh(), 'Produk berhasil diarsipkan.');
    }
}
