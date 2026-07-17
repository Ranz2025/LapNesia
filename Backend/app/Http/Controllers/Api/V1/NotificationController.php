<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Gate;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(protected NotificationService $service) {}

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', DatabaseNotification::class);

        $notifications = $this->service->getNotifications($request->user());
        $unreadCount = $this->service->getUnreadCount($request->user());

        return $this->successResponse([
            'data' => NotificationResource::collection($notifications->items()),
            'total' => $notifications->total(),
            'per_page' => $notifications->perPage(),
            'current_page' => $notifications->currentPage(),
            'unread_count' => $unreadCount,
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', DatabaseNotification::class);

        $notifications = $this->service->getUnreadNotifications($request->user());

        return $this->successResponse([
            'data' => NotificationResource::collection($notifications->items()),
            'total' => $notifications->total(),
            'per_page' => $notifications->perPage(),
            'current_page' => $notifications->currentPage(),
        ]);
    }

    public function read(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->find($id);

        if (! $notification) {
            return $this->errorResponse('Notifikasi tidak ditemukan.', 404);
        }

        Gate::authorize('update', $notification);

        $notification = $this->service->markAsRead($request->user(), $id);

        return $this->successResponse(new NotificationResource($notification), 'Notifikasi telah ditandai sebagai dibaca.');
    }

    public function readAll(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', DatabaseNotification::class);

        $count = $this->service->markAllAsRead($request->user());

        return $this->successResponse(['marked' => $count], "$count notifikasi telah ditandai sebagai dibaca.");
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return $this->successResponse([
            'count' => $this->service->getUnreadCount($request->user()),
        ]);
    }
}
