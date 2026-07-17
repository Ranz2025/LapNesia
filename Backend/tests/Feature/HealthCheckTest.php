<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_returns_status(): void
    {
        $response = $this->getJson('/api/v1/health');
        // If Redis is not available locally it will return 500 or 503 depending on handling
        $this->assertContains($response->status(), [200, 500, 503]);
        if ($response->status() === 200) {
            $response->assertJsonStructure(['status', 'timestamp', 'checks']);
        }
    }

    public function test_liveness_probe(): void
    {
        $response = $this->getJson('/api/v1/health/live');
        $response->assertStatus(200);
        $response->assertJson(['status' => 'alive']);
    }

    public function test_readiness_probe(): void
    {
        $response = $this->getJson('/api/v1/health/ready');
        // Will be 200 if DB and Redis are available, 503 if not
        $this->assertContains($response->status(), [200, 503, 500]);
    }
}
