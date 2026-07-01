<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;

class PasswordResetController extends Controller
{
    use ApiResponse;

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(['email' => $request->email]);

        // Always return success to prevent user enumeration
        return $this->successResponse(null, 'Jika email terdaftar, link reset password telah dikirim.');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::min(8)->mixedCase()->numbers()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                // Revoke all tokens
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->successResponse(null, 'Password berhasil direset. Silakan login kembali.');
        }

        return $this->errorResponse(__($status), 422);
    }
}
