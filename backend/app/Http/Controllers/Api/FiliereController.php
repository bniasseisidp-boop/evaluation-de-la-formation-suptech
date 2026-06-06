<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use Illuminate\Http\Request;

class FiliereController extends Controller
{
    public function index()
    {
        return response()->json(Filiere::withCount(['classes', 'etudiants'])->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:100',
            'code'        => 'required|string|max:20|unique:filieres',
            'description' => 'nullable|string',
            'couleur'     => 'nullable|string|max:7',
            'icone'       => 'nullable|string|max:50',
        ]);

        $filiere = Filiere::create($data);
        return response()->json($filiere, 201);
    }

    public function show(Filiere $filiere)
    {
        return response()->json($filiere->load(['classes.classeMatiereProfs.matiere', 'classes.classeMatiereProfs.professeur']));
    }

    public function update(Request $request, Filiere $filiere)
    {
        $data = $request->validate([
            'nom'         => 'sometimes|string|max:100',
            'code'        => 'sometimes|string|max:20|unique:filieres,code,' . $filiere->id,
            'description' => 'nullable|string',
            'couleur'     => 'nullable|string|max:7',
            'icone'       => 'nullable|string|max:50',
            'is_active'   => 'sometimes|boolean',
        ]);

        $filiere->update($data);
        return response()->json($filiere);
    }

    public function destroy(Filiere $filiere)
    {
        $filiere->delete();
        return response()->json(['message' => 'Filière supprimée.']);
    }
}
