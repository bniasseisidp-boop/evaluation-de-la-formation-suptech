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
            ->latest()->paginate(20);
        return response()->json($invitations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email'      => 'required|email',
            'nom'        => 'required|string|max:100',
            'filiere_id' => 'required|exists:filieres,id',
            'classe_id'  => 'required|exists:classes,id',
            'matricule'  => 'nullable|string|max:50',
        ]);

        $tempPassword = Str::random(10);
        $token = Str::random(64);

        $user = User::updateOrCreate(
            ['email' => $request->email],
            [
                'name'       => $request->nom,
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
            'nom'        => $request->nom,
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

    public function bulkInvite(Request $request)
    {
        $request->validate([
            'invitations'              => 'required|array|min:1',
            'invitations.*.email'      => 'required|email',
            'invitations.*.nom'        => 'required|string',
            'invitations.*.filiere_id' => 'required|exists:filieres,id',
            'invitations.*.classe_id'  => 'required|exists:classes,id',
        ]);

        $results = [];
        foreach ($request->invitations as $inv) {
            $tempPassword = Str::random(10);
            $token = Str::random(64);

            User::updateOrCreate(
                ['email' => $inv['email']],
                [
                    'name'       => $inv['nom'],
                    'password'   => Hash::make($tempPassword),
                    'role'       => 'student',
                    'filiere_id' => $inv['filiere_id'],
                    'classe_id'  => $inv['classe_id'],
                    'matricule'  => $inv['matricule'] ?? null,
                    'is_active'  => true,
                ]
            );

            $invitation = Invitation::create([
                'email'      => $inv['email'],
                'token'      => $token,
                'nom'        => $inv['nom'],
                'filiere_id' => $inv['filiere_id'],
                'classe_id'  => $inv['classe_id'],
                'expires_at' => now()->addDays(7),
                'created_by' => $request->user()->id,
            ]);

            try {
                Mail::to($inv['email'])->send(new InvitationMail($invitation, $tempPassword));
                $results[] = ['email' => $inv['email'], 'status' => 'sent'];
            } catch (\Exception $e) {
                $results[] = ['email' => $inv['email'], 'status' => 'error'];
            }
        }

        return response()->json(['results' => $results]);
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
