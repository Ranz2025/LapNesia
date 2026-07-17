<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\AdminTechnicianController;
use App\Http\Controllers\Api\V1\AdminWithdrawalController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\HealthCheckController;
use App\Http\Controllers\Api\V1\InspectionJobController;
use App\Http\Controllers\Api\V1\InspectionPaymentController;
use App\Http\Controllers\Api\V1\InspectionRatingController;
use App\Http\Controllers\Api\V1\InspectionReportController;
use App\Http\Controllers\Api\V1\InspectionReportPhotoController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\OwnerDashboardController;
use App\Http\Controllers\Api\V1\PasswordResetController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\RatingController;
use App\Http\Controllers\Api\V1\ReturnController;
use App\Http\Controllers\Api\V1\TechnicianController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\WithdrawalController;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ─── Health Check (Public, No Auth) ────────────────────────────────────
    Route::get('/health', [HealthCheckController::class, 'check']);
    Route::get('/health/live', [HealthCheckController::class, 'live']);
    Route::get('/health/ready', [HealthCheckController::class, 'ready']);

    // ─── Auth ────────────────────────────────────────────────────────────────
    Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
        Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // ─── Public ──────────────────────────────────────────────────────────────
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/brands', fn () => response()->json([
        'data' => Cache::remember('brands_all', 3600, fn () => Brand::all()),
    ]));
    Route::get('/categories', fn () => response()->json([
        'data' => Cache::remember('categories_all', 3600, fn () => Category::all()),
    ]));
    Route::get('/technicians', [TechnicianController::class, 'index']);
    Route::get('/technicians/{id}', [TechnicianController::class, 'show']);
    Route::get('/technicians/{id}/availability', [TechnicianController::class, 'availability']);

    // Public ratings for a product
    Route::get('/ratings', [RatingController::class, 'index']);

    // ─── Webhook (no auth) ───────────────────────────────────────────────────
    Route::middleware('throttle:60,1')
        ->post('/payments/webhook', [PaymentController::class, 'webhook']);

    // ─── Protected ───────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Seller
        Route::middleware('role:seller,admin')->group(function () {
            Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
            Route::get('/seller/products/{id}', [ProductController::class, 'sellerProduct']);
            Route::post('/seller/products', [ProductController::class, 'store']);
            Route::put('/seller/products/{id}', [ProductController::class, 'update']);
            // Archive instead of hard-delete
            Route::put('/seller/products/{id}/archive', [ProductController::class, 'archive']);
            // Ship order - input resi number
            Route::put('/orders/{id}/ship', [OrderController::class, 'ship']);
        });

        // Technician
        Route::middleware('role:technician,admin')->group(function () {
            Route::post('/technician/availability', [TechnicianController::class, 'storeAvailability']);
            Route::put('/technician/availability/{id}', [TechnicianController::class, 'updateAvailability']);
            Route::delete('/technician/availability/{id}', [TechnicianController::class, 'destroyAvailability']);
            Route::put('/inspection-jobs/{id}/accept', [InspectionJobController::class, 'accept']);
            Route::put('/inspection-jobs/{id}/reject', [InspectionJobController::class, 'reject']);
            Route::put('/inspection-jobs/{id}/complete', [InspectionJobController::class, 'complete']);
            Route::put('/inspection-jobs/{id}/set-schedule', [InspectionJobController::class, 'setSchedule']);
            Route::post('/inspection-reports', [InspectionReportController::class, 'store']);
            Route::get('/inspection-ratings/{jobId}', [InspectionRatingController::class, 'show']);
            // Foto bukti inspeksi
            Route::post('/inspection-reports/{id}/photos', [InspectionReportPhotoController::class, 'store']);
            Route::delete('/inspection-reports/{id}/photos/{photoId}', [InspectionReportPhotoController::class, 'destroy']);
        });

        // Buyer
        Route::middleware('role:buyer,admin')->group(function () {
            Route::post('/inspection-jobs', [InspectionJobController::class, 'store']);
            Route::post('/inspection-jobs/{job}/pay', [InspectionPaymentController::class, 'pay']);
            Route::get('/inspection-payments/{id}', [InspectionPaymentController::class, 'show']);
            Route::post('/inspection-jobs/{job}/rating', [InspectionRatingController::class, 'store']);
            Route::post('/orders', [OrderController::class, 'store']);
            Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
            Route::put('/orders/{id}/confirm-received', [OrderController::class, 'confirmReceived']);
            Route::put('/orders/{id}/shipping-address', [OrderController::class, 'updateShippingAddress']);
            Route::post('/orders/{order}/pay', [PaymentController::class, 'pay']);
            Route::post('/ratings', [RatingController::class, 'store']);
        });

        // Cancel inspeksi — bisa dilakukan buyer ATAU teknisi (logic validasi ada di service)
        Route::middleware('role:buyer,technician,admin')->group(function () {
            Route::put('/inspection-jobs/{id}/cancel', [InspectionJobController::class, 'cancel']);
        });

        // Profile (any authenticated user)
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
        Route::put('/profile/password', [ProfileController::class, 'changePassword']);
        Route::post('/profile/certification', [ProfileController::class, 'uploadCertification']);

        // Any authenticated
        Route::get('/inspection-jobs', [InspectionJobController::class, 'index']);
        Route::get('/technician/jobs', [InspectionJobController::class, 'index']);
        Route::get('/inspection-jobs/{id}', [InspectionJobController::class, 'show']);
        Route::get('/inspection-reports/{id}', [InspectionReportController::class, 'show']);
        Route::get('/inspection-reports/{id}/pdf', [InspectionReportController::class, 'downloadPdf']);
        Route::get('/technician/certification', [ProfileController::class, 'certification']);
        Route::get('/admin/technicians/{id}/certification', [AdminTechnicianController::class, 'certification']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::get('/payments/{payment}', [PaymentController::class, 'show']);
        Route::get('/ratings/{orderId}', [RatingController::class, 'show']);

        // Returns
        Route::get('/returns', [ReturnController::class, 'index']);
        Route::get('/returns/{id}', [ReturnController::class, 'show']);
        Route::post('/returns', [ReturnController::class, 'store']);
        Route::put('/returns/{id}/status', [ReturnController::class, 'updateStatus']);
        Route::put('/returns/{id}/resi', [ReturnController::class, 'submitResi']);

        // Wallet & Withdrawal
        Route::get('/wallet', [WalletController::class, 'show']);
        Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
        Route::post('/wallet/withdraw', [WalletController::class, 'withdraw']);
        Route::get('/withdrawals', [WithdrawalController::class, 'index']);
        Route::post('/withdrawals', [WithdrawalController::class, 'store']);
        Route::get('/withdrawals/{id}', [WithdrawalController::class, 'show']);

        // Chat
        Route::get('/chat', [ChatController::class, 'index']);
        Route::post('/chat/start', [ChatController::class, 'startOrGet']);
        Route::get('/chat/{roomId}/room', [ChatController::class, 'showRoom']);
        Route::get('/chat/{roomId}/messages', [ChatController::class, 'messages']);
        Route::post('/chat/{roomId}/messages', [ChatController::class, 'sendMessage']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::get('/notifications/unread', [NotificationController::class, 'unread']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'read']);
        Route::put('/notifications/read-all', [NotificationController::class, 'readAll']);

        // Admin
        Route::prefix('admin')->middleware('role:admin,owner')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            Route::get('/withdrawals', [AdminWithdrawalController::class, 'index']);
            Route::put('/withdrawals/{id}/approve', [AdminWithdrawalController::class, 'approve']);
            Route::put('/withdrawals/{id}/reject', [AdminWithdrawalController::class, 'reject']);

            // Technician verification
            Route::get('/technicians', [AdminTechnicianController::class, 'index']);
            Route::put('/technicians/{id}/approve', [AdminTechnicianController::class, 'approve']);
            Route::put('/technicians/{id}/reject', [AdminTechnicianController::class, 'reject']);

            // User management
            Route::get('/users', [AdminTechnicianController::class, 'allUsers']);
            Route::put('/users/{id}/suspend', [AdminTechnicianController::class, 'suspendUser']);
            Route::put('/users/{id}/activate', [AdminTechnicianController::class, 'activateUser']);

            // Returns management
            Route::get('/returns', [ReturnController::class, 'adminIndex']);
            Route::put('/returns/{id}/complete', [ReturnController::class, 'adminComplete']);
            Route::put('/returns/{id}/status', [ReturnController::class, 'updateStatus']);
        });

        // Owner dashboard
        Route::middleware('role:owner')->group(function () {
            Route::get('/owner/dashboard', [OwnerDashboardController::class, 'index']);
        });
    });
});
