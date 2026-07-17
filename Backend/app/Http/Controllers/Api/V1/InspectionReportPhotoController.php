<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InspectionReport;
use App\Models\InspectionReportPhoto;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class InspectionReportPhotoController extends Controller
{
    use ApiResponse;

    public function store(Request $request, string $id): JsonResponse
    {
        $report = InspectionReport::with('job')->findOrFail($id);

        Gate::authorize('uploadPhoto', $report);

        $request->validate([
            'photos' => ['required', 'array', 'min:1', 'max:10'],
            'photos.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:200'],
        ]);

        $existing = $report->photos()->count();
        if ($existing + count($request->file('photos')) > 20) {
            return $this->errorResponse('Maksimal 20 foto per laporan. Sudah ada '.$existing.' foto.', 422);
        }

        $uploaded = [];
        $captions = $request->input('captions', []);

        foreach ($request->file('photos') as $idx => $file) {
            $path = $file->store('inspections/photos', 'public');

            $uploaded[] = InspectionReportPhoto::create([
                'inspection_report_id' => $report->id,
                'path' => $path,
                'caption' => $captions[$idx] ?? null,
                'sort_order' => $existing + $idx,
            ]);
        }

        return $this->successResponse(
            collect($uploaded)->map(fn ($p) => [
                'id' => $p->id,
                'url' => $p->url,
                'caption' => $p->caption,
            ]),
            count($uploaded).' foto berhasil diupload.',
            201
        );
    }

    public function destroy(Request $request, string $id, string $photoId): JsonResponse
    {
        $report = InspectionReport::findOrFail($id);

        Gate::authorize('deletePhoto', $report);

        $photo = InspectionReportPhoto::where('inspection_report_id', $report->id)
            ->findOrFail($photoId);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return $this->successResponse(null, 'Foto berhasil dihapus.');
    }
}
