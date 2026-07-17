<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\InspectionRating;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class InspectionRatingTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_buyer_can_rate_completed_inspection_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'completed');

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/inspection-jobs/{$job->id}/rating", [
                'rating' => 5,
                'review' => 'Excellent technician!',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.review', 'Excellent technician!');

        $this->assertDatabaseHas('inspection_ratings', [
            'job_id' => $job->id,
            'buyer_id' => $buyer->id,
            'technician_id' => $tech->id,
            'rating' => 5,
        ]);
    }

    public function test_cannot_rate_non_completed_job(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'accepted');

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/inspection-jobs/{$job->id}/rating", [
                'rating' => 5,
                'review' => 'Good job!',
            ]);

        $response->assertStatus(403); // Validation throws 403 because Policy might block non-completed
    }

    public function test_user_can_view_rating(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'completed');

        $rating = InspectionRating::create([
            'job_id' => $job->id,
            'buyer_id' => $buyer->id,
            'technician_id' => $tech->id,
            'rating' => 4,
            'review' => 'Good',
        ]);

        $response = $this->actingAs($tech, 'sanctum')
            ->getJson("/api/v1/inspection-ratings/{$job->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.rating', 4);
    }
}
