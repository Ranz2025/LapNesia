<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\TechnicianCertificationUploadedNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Get current user profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('wallet', 'technicianProfile');

        return $this->successResponse(new UserResource($user), 'Profil berhasil diambil.');
    }

    /**
     * Update profile (name, phone, address, profile photo)
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'phone' => ['sometimes', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'address' => 'sometimes|nullable|string|max:500',
        ]);

        $user->update($validated);

        return $this->successResponse(
            new UserResource($user->fresh()->load('wallet')),
            'Profil berhasil diperbarui.'
        );
    }

    /**
     * Upload/update profile photo
     */
    public function updatePhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();

        // Delete old photo if exists
        if ($user->profile_photo_url) {
            $oldPath = str_replace('/storage/', '', parse_url($user->profile_photo_url, PHP_URL_PATH));
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('photo')->store('profile-photos', 'public');
        $url = Storage::disk('public')->url($path);

        $user->update(['profile_photo_url' => $url]);

        return $this->successResponse(
            new UserResource($user->fresh()->load('wallet')),
            'Foto profil berhasil diperbarui.'
        );
    }

    /**
     * Upload/update technician certification
     */
    public function uploadCertification(Request $request): JsonResponse
    {
        $request->validate([
            'certificate' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $user = $request->user();
        if ($user->role !== 'technician') {
            return $this->errorResponse('Hanya teknisi yang dapat mengunggah sertifikat.', 403);
        }

        $profile = $user->technicianProfile()->firstOrCreate(['user_id' => $user->id]);

        if ($profile->certification_url) {
            $oldPath = str_replace('/storage/', '', parse_url($profile->certification_url, PHP_URL_PATH));
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('certificate')->store('technician-certifications', 'public');
        $url = Storage::disk('public')->url($path);

        $profile->update(['certification_url' => $url]);

        User::where('role', 'admin')
            ->orWhere('role', 'superadmin')
            ->get()
            ->each(fn (User $admin) => $admin->notify(new TechnicianCertificationUploadedNotification($user, $profile->fresh())));

        return $this->successResponse([
            'technician_profile' => $profile->fresh(),
            'certification_url' => $url,
        ], 'Sertifikat berhasil diunggah.');
    }

    /**
     * Download current technician certification
     */
    public function certification(Request $request): JsonResponse|StreamedResponse
    {
        $user = $request->user();
        if ($user->role !== 'technician') {
            return $this->errorResponse('Hanya teknisi yang dapat membuka sertifikat.', 403);
        }

        $profile = $user->technicianProfile;
        $url = $profile?->certification_url;

        if (! $url) {
            return $this->errorResponse('Sertifikat tidak ditemukan.', 404);
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $path = ltrim(str_replace('/storage/', '', $path), '/');

        if (! Storage::disk('public')->exists($path)) {
            return $this->errorResponse('File sertifikat tidak tersedia.', 404);
        }

        return response()->streamDownload(function () use ($path) {
            echo Storage::disk('public')->get($path);
        }, basename($path), [
            'Content-Type' => Storage::disk('public')->mimeType($path) ?: 'application/octet-stream',
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Password lama tidak sesuai.', 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Revoke all other tokens
        if ($user->currentAccessToken()) {
            $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
        } else {
            $user->tokens()->delete();
        }

        return $this->successResponse(null, 'Password berhasil diubah.');
    }
}
