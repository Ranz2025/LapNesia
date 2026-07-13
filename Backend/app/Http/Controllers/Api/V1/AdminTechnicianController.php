<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminTechnicianController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $status = $request->get('status', 'pending');

        $technicians = User::where('role', 'technician')
            ->when($status === 'verified', fn($q) => $q->whereIn('status', ['verified', 'active']))
            ->when($status !== 'all' && $status !== 'verified', fn($q) => $q->where('status', $status))
            ->with('technicianProfile')
            ->latest()
            ->paginate(15);

        return $this->successResponse(
            ['data' => UserResource::collection($technicians), 'meta' => ['total' => $technicians->total()]]
        );
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $technician = User::where('role', 'technician')->findOrFail($id);

        if (in_array($technician->status, ['verified', 'active'])) {
            return $this->errorResponse('Teknisi sudah diverifikasi.', 422);
        }

        $technician->update(['status' => 'verified']);

        $technician->notify(new \App\Notifications\TechnicianVerifiedNotification(true));

        return $this->successResponse(new UserResource($technician), 'Teknisi berhasil diverifikasi.');
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string|min:10']);

        $technician = User::where('role', 'technician')->findOrFail($id);

        if ($technician->status === 'rejected') {
            return $this->errorResponse('Teknisi sudah ditolak sebelumnya.', 422);
        }

        $technician->update(['status' => 'rejected']);

        $technician->notify(new \App\Notifications\TechnicianVerifiedNotification(false, $request->reason));

        return $this->successResponse(new UserResource($technician), 'Teknisi berhasil ditolak.');
    }

    public function allUsers(Request $request): JsonResponse
    {
        $users = User::when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($inner) use ($request) {
                    $inner->where('name', 'like', '%' . $request->search . '%')
                          ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            })
            ->latest()
            ->paginate(20);

        return $this->successResponse([
            'data'  => UserResource::collection($users),
            'total' => $users->total(),
            'per_page'     => $users->perPage(),
            'current_page' => $users->currentPage(),
            'last_page'    => $users->lastPage(),
        ]);
    }

    public function suspendUser(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin' || $user->role === 'owner') {
            return $this->errorResponse('Tidak dapat menangguhkan akun admin/owner.', 403);
        }

        if ($user->status === 'suspended') {
            return $this->errorResponse('Pengguna sudah ditangguhkan.', 422);
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        $user->update(['status' => 'suspended']);

        return $this->successResponse(new UserResource($user), 'Pengguna berhasil ditangguhkan.');
    }

    public function activateUser(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->status !== 'suspended') {
            return $this->errorResponse('Pengguna tidak dalam status ditangguhkan.', 422);
        }

        // Teknisi yang diverifikasi kembali ke verified, role lain ke active
        $newStatus = $user->role === 'technician' ? 'verified' : 'active';
        $user->update(['status' => $newStatus]);

        return $this->successResponse(new UserResource($user), 'Pengguna berhasil diaktifkan kembali.');
    }

    public function certification(string $id): StreamedResponse|JsonResponse
    {
        $technician = User::where('role', 'technician')->with('technicianProfile')->findOrFail($id);
        $url = $technician->technicianProfile?->certification_url;

        if (!$url) {
            return $this->errorResponse('Sertifikat tidak ditemukan.', 404);
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $path = ltrim(str_replace('/storage/', '', $path), '/');

        if (!Storage::disk('public')->exists($path)) {
            return $this->errorResponse('File sertifikat tidak tersedia.', 404);
        }

        return response()->streamDownload(function () use ($path) {
            echo Storage::disk('public')->get($path);
        }, basename($path), [
            'Content-Type' => Storage::disk('public')->mimeType($path) ?: 'application/octet-stream',
        ]);
    }
}
