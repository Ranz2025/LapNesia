<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InspectionRatingResource;
use App\Models\InspectionJob;
use App\Models\InspectionRating;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        if ((int) $job->requested_by !== (int) $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses.', 403);
        }

        if ($job->status !== 'completed') {
            return $this->errorResponse('Rating hanya bisa diberikan setelah inspeksi selesai.', 422);
        }

        if (InspectionRating::where('job_id', $job->id)->exists()) {
            return $this->errorResponse('Rating untuk inspeksi ini sudah pernah diberikan.', 409);
        }

        $rating = DB::transaction(function () use ($request, $job) {
            $rating = InspectionRating::create([
                'job_id'       => $job->id,
                'technician_id'=> $job->technician_id,
                'buyer_id'     => $job->requested_by,
                'rating'       => $request->rating,
                'review'       => $request->review,
            ]);

            // Recalculate rating_avg di TechnicianProfile
            $avg = InspectionRating::where('technician_id', $job->technician_id)
                ->avg('rating');

            \App\Models\TechnicianProfile::where('user_id', $job->technician_id)
                ->update(['rating_avg' => round($avg, 2)]);

            return $rating;
        });

        return $this->successResponse(new InspectionRatingResource($rating), 'Rating teknisi berhasil diberikan.', 201);
    }

    public function show(string $jobId): JsonResponse
    {
        $rating = InspectionRating::where('job_id', $jobId)->first();
        if (!$rating) {
            return $this->errorResponse('Rating tidak ditemukan.', 404);
        }
        return $this->successResponse(new InspectionRatingResource($rating));
    }
}
