<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ChatRoom;
use App\Models\User;

class ChatRoomPolicy
{
    public function view(User $user, ChatRoom $room): bool
    {
        return (int) $room->user_one_id === (int) $user->id
            || (int) $room->user_two_id === (int) $user->id;
    }

    public function sendMessage(User $user, ChatRoom $room): bool
    {
        return $this->view($user, $room);
    }
}
