<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
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




}