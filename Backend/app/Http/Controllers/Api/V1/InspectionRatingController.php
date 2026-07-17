<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InspectionRatingResource;
use App\Models\InspectionJob;
use App\Models\InspectionRating;
use App\Models\TechnicianProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class InspectionRatingController extends Controller
{
    use ApiResponse;

    public function store(Request $request, string $jobId): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $job = InspectionJob::findOrFail($jobId);

        Gate::authorize('rate', $job);

        if (InspectionRating::where('job_id', $job->id)->exists()) {
            return $this->errorResponse('Rating untuk inspeksi ini sudah pernah diberikan.', 409);
        }

        $rating = DB::transaction(function () use ($request, $job) {
            $rating = InspectionRating::create([
                'job_id' => $job->id,
                'technician_id' => $job->technician_id,
                'buyer_id' => $job->requested_by,
                'rating' => $request->rating,
                'review' => $request->review,
            ]);

            // Recalculate rating_avg di TechnicianProfile
            $avg = InspectionRating::where('technician_id', $job->technician_id)
                ->avg('rating');

            TechnicianProfile::where('user_id', $job->technician_id)
                ->update(['rating_avg' => round($avg, 2)]);

            return $rating;
        });

        return $this->successResponse(new InspectionRatingResource($rating), 'Rating teknisi berhasil diberikan.', 201);
    }

    public function show(string $jobId): JsonResponse
    {
        $rating = InspectionRating::where('job_id', $jobId)->first();
        if (! $rating) {
            return $this->errorResponse('Rating tidak ditemukan.', 404);
        }

        return $this->successResponse(new InspectionRatingResource($rating));
    }
}
