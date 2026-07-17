<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\ChatRoom;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ChatRoomPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_participant_can_view_room(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer->id,
            'user_two_id' => $seller->id,
        ]);

        $this->assertTrue($buyer->can('view', $room));
        $this->assertTrue($seller->can('view', $room));
    }

    public function test_non_participant_cannot_view_room(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer1->id,
            'user_two_id' => $seller->id,
        ]);

        $this->assertFalse($buyer2->can('view', $room));
    }

    public function test_participant_can_send_message(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer->id,
            'user_two_id' => $seller->id,
        ]);

        $this->assertTrue($buyer->can('sendMessage', $room));
        $this->assertTrue($seller->can('sendMessage', $room));
    }

    public function test_non_participant_cannot_send_message(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer1->id,
            'user_two_id' => $seller->id,
        ]);

        $this->assertFalse($buyer2->can('sendMessage', $room));
    }
}
