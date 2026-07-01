<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProductController extends Controller
{
    use ApiResponse;

    public function __construct(protected ProductService $productService) {}

    public function index(Request $request): ProductCollection
    {
        $products = $this->productService->getProducts($request->all());
        return new ProductCollection($products);
    }

    public function sellerProducts(Request $request): JsonResponse
    {
        $products = Product::where('seller_id', $request->user()->id)
            ->with(['brand', 'category', 'images', 'seller'])
            ->latest()->paginate(12);
        return $this->successResponse(new ProductCollection($products));
    }

    public function sellerProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::where('seller_id', $request->user()->id)
            ->where('id', $id)
            ->with(['brand', 'category', 'images', 'seller'])
            ->firstOrFail();
        return $this->successResponse(new ProductResource($product));
    }

    public function show(string $slug): JsonResponse
    {
        $product = $this->productService->getProductBySlug($slug);
        if (!$product) return $this->errorResponse('Produk tidak ditemukan.', 404);
        return $this->successResponse(new ProductResource($product));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->createProduct($request->validated(), $request->user()->id);
        return $this->successResponse(new ProductResource($product), 'Produk berhasil ditambahkan.', 201);
    }

    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        if (Gate::denies('update', $product)) {
            return $this->errorResponse('Tidak memiliki izin.', 403);
        }
        $updated = $this->productService->updateProduct($product, $request->validated());
        return $this->successResponse(new ProductResource($updated), 'Produk berhasil diperbarui.');
    }

    /** Archive product — no hard delete (BR-16) */
    public function archive(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        if (Gate::denies('update', $product)) {
            return $this->errorResponse('Tidak memiliki izin.', 403);
        }
        if (in_array($product->status, ['booked', 'paid'])) {
            return $this->errorResponse('Produk sedang dalam proses transaksi aktif.', 422);
        }
        $product->update(['status' => 'archived']);
        return $this->successResponse(null, 'Produk berhasil diarsipkan.');
    }
}
