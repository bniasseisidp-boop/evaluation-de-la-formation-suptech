<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    public function index()
    {
        $invitations = Invitation::with(['filiere', 'classe', 'createdBy'])
            ->latest()->get();
        return response()->json($invitations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email'      => 'required|email',
            'nom'        => 'nullable|string|max:100',
            'filiere_id' => 'required|exists:filieres,id',
            'classe_id'  => 'required|exists:classes,id',
            'matricule'  => 'nullable|string|max:50',
        ]);

        $tempPassword = Str::random(10);
        $token = Str::random(64);

        // Protège les comptes admin existants
        $existing = User::where('email', $request->email)->first();
        if ($existing && $existing->role === 'admin') {
            return response()->json(['message' => 'Cet email appartient à un compte administrateur.'], 422);
        }

        User::updateOrCreate(
            ['email' => $request->email],
            [
                'name'       => $request->nom ?? explode('@', $request->email)[0],
                'password'   => Hash::make($tempPassword),
                'role'       => 'student',
                'filiere_id' => $request->filiere_id,
                'classe_id'  => $request->classe_id,
                'matricule'  => $request->matricule,
                'is_active'  => true,
            ]
        );

        $invitation = Invitation::create([
            'email'      => $request->email,
            'token'      => $token,
            'nom'        => $request->nom ?? explode('@', $request->email)[0],
            'filiere_id' => $request->filiere_id,
            'classe_id'  => $request->classe_id,
            'matricule'  => $request->matricule,
            'expires_at' => now()->addDays(7),
            'created_by' => $request->user()->id,
        ]);

        try {
            Mail::to($request->email)->send(new InvitationMail($invitation, $tempPassword));
        } catch (\Exception $e) {}

        return response()->json([
            'message'       => 'Invitation envoyée avec succès.',
            'invitation'    => $invitation->load(['filiere', 'classe']),
            'temp_password' => $tempPassword,
        ], 201);
    }

    // Format attendu: { emails: ["a@b.com", ...], filiere_id: 1, classe_id: 2 }
    public function bulkInvite(Request $request)
    {
        $request->validate([
            'emails'     => 'required|array|min:1',
            'emails.*'   => 'required|email',
            'filiere_id' => 'required|exists:filieres,id',
            'classe_id'  => 'required|exists:classes,id',
        ]);

        $sent = 0;

        foreach ($request->emails as $email) {
            $tempPassword = Str::random(10);
            $token = Str::random(64);
            $nom = explode('@', $email)[0];

            // Ne jamais écraser un compte admin
            $existingUser = User::where('email', $email)->first();
            if ($existingUser && $existingUser->role === 'admin') {
                continue;
            }

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name'       => $nom,
                    'password'   => Hash::make($tempPassword),
                    'role'       => 'student',
                    'filiere_id' => $request->filiere_id,
                    'classe_id'  => $request->classe_id,
                    'is_active'  => true,
                ]
            );

            $invitation = Invitation::create([
                'email'      => $email,
                'token'      => $token,
                'nom'        => $nom,
                'filiere_id' => $request->filiere_id,
                'classe_id'  => $request->classe_id,
                'expires_at' => now()->addDays(7),
                'created_by' => $request->user()->id,
            ]);

            try {
                Mail::to($email)->send(new InvitationMail($invitation, $tempPassword));
                $sent++;
            } catch (\Exception $e) {}
        }

        return response()->json(['sent' => $sent, 'total' => count($request->emails)]);
    }

    public function resend(Invitation $invitation)
    {
        $tempPassword = Str::random(10);

        User::where('email', $invitation->email)->update([
            'password' => Hash::make($tempPassword),
        ]);

        $invitation->update([
            'token'      => Str::random(64),
            'used_at'    => null,
            'expires_at' => now()->addDays(7),
        ]);

        try {
            Mail::to($invitation->email)->send(new InvitationMail($invitation->fresh(), $tempPassword));
        } catch (\Exception $e) {}

        return response()->json([
            'message'       => 'Invitation renvoyée.',
            'temp_password' => $tempPassword,
        ]);
    }

    public function destroy(Invitation $invitation)
    {
        $invitation->delete();
        return response()->json(['message' => 'Invitation supprimée.']);
    }
}
