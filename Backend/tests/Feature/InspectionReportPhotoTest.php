<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\InspectionReport;
use App\Models\InspectionReportPhoto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\CreatesTestData;
use Tests\TestCase;

class InspectionReportPhotoTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_technician_can_upload_photo(): void
    {
        Storage::fake('public');

        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'completed');

        $report = InspectionReport::create([
            'job_id' => $job->id,
            'technician_id' => $tech->id,
            'battery_status' => 'good',
            'screen_status' => 'good',
            'keyboard_status' => 'good',
            'touchpad_status' => 'good',
            'port_status' => 'good',
            'storage_status' => 'good',
            'ram_status' => 'good',
            'cpu_status' => 'good',
            'physical_status' => 'good',
            'overall_score' => 90,
            'recommendation' => 'recommended',
            'summary' => 'Test',
            'is_recommended' => true,
        ]);

        $file = UploadedFile::fake()->image('photo1.jpg');

        $response = $this->actingAs($tech, 'sanctum')
            ->postJson("/api/v1/inspection-reports/{$report->id}/photos", [
                'photos' => [$file],
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('inspection_report_photos', 1);

        $photo = InspectionReportPhoto::first();
        Storage::disk('public')->assertExists($photo->photo_path);
    }

    public function test_technician_can_delete_photo(): void
    {
        Storage::fake('public');

        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $job = $this->createJob($buyer, $tech, 'completed');

        $report = InspectionReport::create([
            'job_id' => $job->id,
            'technician_id' => $tech->id,
            'battery_status' => 'good',
            'screen_status' => 'good',
            'keyboard_status' => 'good',
            'touchpad_status' => 'good',
            'port_status' => 'good',
            'storage_status' => 'good',
            'ram_status' => 'good',
            'cpu_status' => 'good',
            'physical_status' => 'good',
            'overall_score' => 90,
            'recommendation' => 'recommended',
            'summary' => 'Test',
            'is_recommended' => true,
        ]);

        $photoPath = UploadedFile::fake()->image('photo.jpg')->store('inspection-photos', 'public');

        $photo = InspectionReportPhoto::create([
            'inspection_report_id' => $report->id,
            'path' => $photoPath,
        ]);

        $response = $this->actingAs($tech, 'sanctum')
            ->deleteJson("/api/v1/inspection-reports/{$report->id}/photos/{$photo->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('inspection_report_photos', ['id' => $photo->id]);
        Storage::disk('public')->assertMissing($photoPath);
    }
}
