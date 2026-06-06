<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    public function index(Request $request)
    {
        $query = Classe::with('filiere')->withCount('etudiants');
        if ($request->filiere_id) {
            $query->where('filiere_id', $request->filiere_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'filiere_id'    => 'required|exists:filieres,id',
            'nom'           => 'required|string|max:100',
            'niveau'        => 'required|in:BT1,BT2,BT3,L1,L2,L3,M1,M2,FC_L1,FC_L2,FC_L3',
            'annee_scolaire'=> 'nullable|string|max:20',
            'effectif'      => 'nullable|integer|min:0',
        ]);

        $classe = Classe::create($data);
        return response()->json($classe->load('filiere'), 201);
    }

    public function show(Classe $classe)
    {
        return response()->json($classe->load([
            'filiere',
            'etudiants',
            'classeMatiereProfs.matiere',
            'classeMatiereProfs.professeur',
        ]));
    }

    public function update(Request $request, Classe $classe)
    {
        $data = $request->validate([
            'nom'           => 'sometimes|string|max:100',
            'niveau'        => 'sometimes|in:BT1,BT2,BT3,L1,L2,L3,M1,M2,FC_L1,FC_L2,FC_L3',
            'annee_scolaire'=> 'nullable|string|max:20',
            'effectif'      => 'nullable|integer|min:0',
            'is_active'     => 'sometimes|boolean',
        ]);

        $classe->update($data);
        return response()->json($classe->load('filiere'));
    }

    public function destroy(Classe $classe)
    {
        $classe->delete();
        return response()->json(['message' => 'Classe supprimée.']);
    }
}
