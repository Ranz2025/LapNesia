<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ChatController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $rooms = ChatRoom::with(['userOne:id,name,role,profile_photo_url', 'userTwo:id,name,role,profile_photo_url', 'latestMessage'])
            ->where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($room) use ($userId) {
                $other = $room->user_one_id === $userId ? $room->userTwo : $room->userOne;
                $unread = $room->messages()
                    ->where('sender_id', '!=', $userId)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id' => $room->id,
                    'other_user' => $other,
                    'product_id' => $room->product_id,
                    'last_message' => $room->latestMessage,
                    'unread_count' => $unread,
                    'last_message_at' => $room->last_message_at,
                ];
            });

        return $this->successResponse($rooms);
    }

    public function showRoom(Request $request, string $roomId): JsonResponse
    {
        $room = ChatRoom::with([
            'userOne:id,name,role,profile_photo_url',
            'userTwo:id,name,role,profile_photo_url',
        ])->findOrFail($roomId);

        Gate::authorize('view', $room);

        $userId = (int) $request->user()->id;
        $other = (int) $room->user_one_id === $userId ? $room->userTwo : $room->userOne;

        return $this->successResponse([
            'id' => $room->id,
            'other_user' => $other,
            'product_id' => $room->product_id,
        ]);
    }

    public function startOrGet(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'product_id' => 'nullable|integer|exists:products,id',
        ]);

        $authId = (int) $request->user()->id;
        $otherId = (int) $request->user_id;

        if ($authId === $otherId) {
            return $this->errorResponse('Tidak bisa membuat chat dengan diri sendiri.', 422);
        }

        [$one, $two] = $authId < $otherId ? [$authId, $otherId] : [$otherId, $authId];

        $room = ChatRoom::firstOrCreate(
            ['user_one_id' => $one, 'user_two_id' => $two, 'product_id' => $request->product_id],
            ['last_message_at' => now()]
        );

        $room->load(['userOne:id,name,role,profile_photo_url', 'userTwo:id,name,role,profile_photo_url']);

        return $this->successResponse($room, 'Chat room siap.', 201);
    }

    public function messages(Request $request, string $roomId): JsonResponse
    {
        $room = ChatRoom::findOrFail($roomId);

        Gate::authorize('view', $room);

        $userId = $request->user()->id;

        // Mark all unread messages from the other user as read
        $room->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $room->messages()
            ->with('sender:id,name,profile_photo_url')
            ->orderBy('created_at')
            ->paginate(50);

        return $this->successResponse([
            'data' => $messages->items(),
            'total' => $messages->total(),
            'current_page' => $messages->currentPage(),
            'last_page' => $messages->lastPage(),
        ]);
    }

    public function sendMessage(Request $request, string $roomId): JsonResponse
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $room = ChatRoom::findOrFail($roomId);

        Gate::authorize('sendMessage', $room);

        $userId = $request->user()->id;

        $message = DB::transaction(function () use ($request, $room, $userId) {
            $msg = ChatMessage::create([
                'chat_room_id' => $room->id,
                'sender_id' => $userId,
                'body' => $request->body,
            ]);

            $room->update(['last_message_at' => now()]);

            return $msg->load('sender:id,name,profile_photo_url');
        });

        return $this->successResponse($message, 'Pesan terkirim.', 201);
    }
}
