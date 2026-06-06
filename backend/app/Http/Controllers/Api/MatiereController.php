<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    public function index()
    {
        return response()->json(Matiere::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'         => 'required|string|max:150',
            'code'        => 'required|string|max:30|unique:matieres',
            'description' => 'nullable|string',
            'credits'     => 'nullable|integer|min:1',
            'semestre'    => 'nullable|in:S1,S2,S3,S4,S5,S6,S7,S8,S9,S10',
        ]);

        $matiere = Matiere::create($data);
        return response()->json($matiere, 201);
    }

    public function show(Matiere $matiere)
    {
        return response()->json($matiere->load('classeMatiereProfs.classe'));
    }

    public function update(Request $request, Matiere $matiere)
    {
        $data = $request->validate([
            'nom'         => 'sometimes|string|max:150',
            'code'        => 'sometimes|string|max:30|unique:matieres,code,' . $matiere->id,
            'description' => 'nullable|string',
            'credits'     => 'nullable|integer|min:1',
            'semestre'    => 'nullable|in:S1,S2,S3,S4,S5,S6,S7,S8,S9,S10',
            'is_active'   => 'sometimes|boolean',
        ]);

        $matiere->update($data);
        return response()->json($matiere);
    }

    public function destroy(Matiere $matiere)
    {
        $matiere->delete();
        return response()->json(['message' => 'Matière supprimée.']);
    }
}
