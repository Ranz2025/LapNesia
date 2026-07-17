<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_user_can_list_chat_rooms(): void
    {
        $buyer = $this->createBuyer();

        $response = $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/chat');

        $response->assertStatus(200);
    }

    public function test_user_can_start_chat(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $response = $this->actingAs($buyer)
            ->postJson('/api/v1/chat/start', [
                'user_id' => $seller->id,
                'product_id' => $product->id,
            ]);

        $response->assertStatus(201);
    }

    public function test_user_can_view_chat_room(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer->id,
            'user_two_id' => $seller->id,
        ]);

        $response = $this->actingAs($buyer, 'sanctum')
            ->getJson("/api/v1/chat/{$room->id}/room");

        $response->assertStatus(200);
    }

    public function test_user_cannot_view_other_users_chat(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer1->id,
            'user_two_id' => $seller->id,
        ]);

        $response = $this->actingAs($buyer2, 'sanctum')
            ->getJson("/api/v1/chat/{$room->id}/room");

        $response->assertStatus(403);
    }

    public function test_user_can_send_message(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer->id,
            'user_two_id' => $seller->id,
        ]);

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/chat/{$room->id}/messages", [
                'body' => 'Hello seller!',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('chat_messages', [
            'chat_room_id' => $room->id,
            'sender_id' => $buyer->id,
            'body' => 'Hello seller!',
        ]);
    }

    public function test_user_can_get_messages(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer->id,
            'user_two_id' => $seller->id,
        ]);

        ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_id' => $buyer->id,
            'body' => 'Test message',
        ]);

        $response = $this->actingAs($buyer, 'sanctum')
            ->getJson("/api/v1/chat/{$room->id}/messages");

        $response->assertStatus(200);
    }

    public function test_user_cannot_send_message_to_other_chat(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer1->id,
            'user_two_id' => $seller->id,
        ]);

        $response = $this->actingAs($buyer2, 'sanctum')
            ->postJson("/api/v1/chat/{$room->id}/messages", [
                'body' => 'Unauthorized message',
            ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_chat(): void
    {
        $this->getJson('/api/v1/chat')->assertUnauthorized();
    }
}
