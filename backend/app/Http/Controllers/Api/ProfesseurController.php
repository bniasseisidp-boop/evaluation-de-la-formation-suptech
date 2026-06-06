<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professeur;
use Illuminate\Http\Request;

class ProfesseurController extends Controller
{
    public function index()
    {
        return response()->json(
            Professeur::with(['classes.filiere', 'matieres'])->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'email'      => 'nullable|email|unique:professeurs',
            'specialite' => 'nullable|string|max:200',
            'grade'      => 'nullable|string|max:100',
        ]);

        $professeur = Professeur::create($data);
        return response()->json($professeur, 201);
    }

    public function show(Professeur $professeur)
    {
        return response()->json($professeur->load([
            'classeMatiereProfs.classe.filiere',
            'classeMatiereProfs.matiere',
        ]));
    }

    public function update(Request $request, Professeur $professeur)
    {
        $data = $request->validate([
            'nom'        => 'sometimes|string|max:100',
            'prenom'     => 'sometimes|string|max:100',
            'email'      => 'nullable|email|unique:professeurs,email,' . $professeur->id,
            'specialite' => 'nullable|string|max:200',
            'grade'      => 'nullable|string|max:100',
            'is_active'  => 'sometimes|boolean',
        ]);

        $professeur->update($data);
        return response()->json($professeur);
    }

    public function destroy(Professeur $professeur)
    {
        $professeur->delete();
        return response()->json(['message' => 'Professeur supprimé.']);
    }
}
