<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Hijo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $request->authenticate();
            
            $user = $request->user();
            
            // For testing without database, create a simple token
            $token = 'token_' . base64_encode($user->email . ':' . now()->timestamp);
            
            return response()->json([
                'success' => true,
                'message' => 'Logged in successfully',
                'user' => $user->load(['hijos.inscripciones.grupo.paquete']),
                'token' => $token,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'errors' => $e->errors()
            ], 422);
        }
    }



    public function logout(Request $request): JsonResponse
    {
        // For session-based logout
        Auth::guard('web')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function hijoLogin(Request $request): JsonResponse
    {
        $request->validate([
            'doc_numero' => 'required|string',
            'password_hijo' => 'required|string',
        ]);

        try {
            $hijo = Hijo::where('doc_numero', $request->doc_numero)->first();

            if (!$hijo || $hijo->password_hijo !== $request->password_hijo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales inválidas',
                ], 422);
            }

            // Create a simple token for the child
            $token = 'hijo_token_' . base64_encode($hijo->doc_numero . ':' . now()->timestamp);

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'hijo' => $hijo->load(['user', 'inscripciones.grupo.paquete']),
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }




}