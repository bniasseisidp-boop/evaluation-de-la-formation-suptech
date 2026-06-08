<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AdminUserController extends Controller
{
    public function index()
    {
        $admins = User::where('role', 'admin')
            ->select('id', 'name', 'email', 'is_active', 'created_at')
            ->orderBy('created_at')
            ->get();

        return response()->json($admins);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $admin = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        try {
            Mail::send('emails.admin_welcome', [
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => $data['password'],
            ], function ($m) use ($data) {
                $m->to($data['email'], $data['name'])
                  ->subject('Votre accès administrateur — ISI SUPTECH');
            });
        } catch (\Exception $e) {
            // Email failure should not block account creation
        }

        return response()->json($admin, 201);
    }

    public function update(Request $request, User $user)
    {
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Utilisateur non admin'], 403);
        }

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'is_active'=> 'sometimes|boolean',
        ]);

        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user->fresh());
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Cet utilisateur n\'est pas un admin.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Admin supprimé']);
    }
}
