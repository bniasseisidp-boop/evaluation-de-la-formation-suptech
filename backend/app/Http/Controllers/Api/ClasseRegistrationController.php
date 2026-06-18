<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClasseRegistrationController extends Controller
{
    // GET /api/register/classe/{token} — info classe pour le formulaire
    public function show(string $token)
    {
        $classe = Classe::with('filiere')
            ->where('registration_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'id'      => $classe->id,
            'nom'     => $classe->nom,
            'niveau'  => $classe->niveau,
            'filiere' => $classe->filiere,
        ]);
    }

    // POST /api/register/classe/{token} — inscription via lien classe
    public function register(Request $request, string $token)
    {
        $classe = Classe::with('filiere')
            ->where('registration_token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        $request->validate([
            'nom'                   => 'required|string|max:100',
            'prenom'                => 'required|string|max:100',
            'email'                 => 'required|email|max:255',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $existing = User::where('email', $request->email)->first();
        if ($existing && $existing->role === 'admin') {
            return response()->json(['message' => 'Cet email est réservé à un compte administrateur.'], 422);
        }

        User::updateOrCreate(
            ['email' => $request->email],
            [
                'name'       => $request->prenom . ' ' . strtoupper($request->nom),
                'password'   => Hash::make($request->password),
                'role'       => 'student',
                'filiere_id' => $classe->filiere_id,
                'classe_id'  => $classe->id,
                'is_active'  => true,
            ]
        );

        return response()->json([
            'message' => 'Inscription réussie. Vous pouvez maintenant vous connecter.',
        ], 201);
    }

    // POST /api/register/public — inscription générale (l'étudiant choisit sa filière/classe)
    public function registerPublic(Request $request)
    {
        $request->validate([
            'nom'                   => 'required|string|max:100',
            'prenom'                => 'required|string|max:100',
            'email'                 => 'required|email|max:255',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required',
            'filiere_id'            => 'required|exists:filieres,id',
            'classe_id'             => 'required|exists:classes,id',
        ]);

        $classe = Classe::findOrFail($request->classe_id);

        if ((int)$classe->filiere_id !== (int)$request->filiere_id) {
            return response()->json(['message' => 'La classe sélectionnée ne correspond pas à la filière.'], 422);
        }

        $existing = User::where('email', $request->email)->first();
        if ($existing && $existing->role === 'admin') {
            return response()->json(['message' => 'Cet email est réservé à un compte administrateur.'], 422);
        }

        User::updateOrCreate(
            ['email' => $request->email],
            [
                'name'       => $request->prenom . ' ' . strtoupper($request->nom),
                'password'   => Hash::make($request->password),
                'role'       => 'student',
                'filiere_id' => $classe->filiere_id,
                'classe_id'  => $classe->id,
                'is_active'  => true,
            ]
        );

        return response()->json([
            'message' => 'Inscription réussie. Vous pouvez maintenant vous connecter.',
        ], 201);
    }

    // POST /admin/classes/{classe}/regenerate-token — admin régénère le lien d'une classe
    public function regenerateToken(Classe $classe)
    {
        $token = Str::random(40);
        $classe->update(['registration_token' => $token]);

        return response()->json(['token' => $token]);
    }
}
