<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClasseMatiereProf;
use Illuminate\Http\Request;

class ClasseMatiereProfController extends Controller
{
    public function index(Request $request)
    {
        $query = ClasseMatiereProf::with(['classe.filiere', 'matiere', 'professeur']);
        if ($request->classe_id) {
            $query->where('classe_id', $request->classe_id);
        }
        if ($request->professeur_id) {
            $query->where('professeur_id', $request->professeur_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'classe_id'      => 'required|exists:classes,id',
            'matiere_id'     => 'required|exists:matieres,id',
            'professeur_id'  => 'required|exists:professeurs,id',
            'annee_scolaire' => 'nullable|string|max:20',
            'semestre'       => 'nullable|in:S1,S2,S3,S4,S5,S6,S7,S8,S9,S10',
        ]);

        $cmp = ClasseMatiereProf::firstOrCreate(
            [
                'classe_id'      => $data['classe_id'],
                'matiere_id'     => $data['matiere_id'],
                'professeur_id'  => $data['professeur_id'],
                'annee_scolaire' => $data['annee_scolaire'] ?? '2025-2026',
            ],
            ['semestre' => $data['semestre'] ?? 'S1']
        );

        return response()->json($cmp->load(['classe', 'matiere', 'professeur']), 201);
    }

    public function destroy(ClasseMatiereProf $classeMatiereProfesseur)
    {
        $classeMatiereProfesseur->delete();
        return response()->json(['message' => 'Association supprimée.']);
    }
}
