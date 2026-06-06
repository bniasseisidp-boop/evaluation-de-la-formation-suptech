<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClasseMatiereProf;
use App\Models\EvaluationEnseignement;
use Illuminate\Http\Request;

class EvaluationEnseignementController extends Controller
{
    public function index(Request $request)
    {
        $query = EvaluationEnseignement::with([
            'etudiant.filiere', 'etudiant.classe',
            'cmp.matiere', 'cmp.professeur', 'cmp.classe.filiere',
        ]);

        if ($request->classe_id) {
            $query->whereHas('cmp', fn($q) => $q->where('classe_id', $request->classe_id));
        }
        if ($request->filiere_id) {
            $query->whereHas('cmp.classe', fn($q) => $q->where('filiere_id', $request->filiere_id));
        }
        if ($request->etudiant_id) {
            $query->where('etudiant_id', $request->etudiant_id);
        }

        return response()->json($query->latest()->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cmp_id'     => 'required|exists:classe_matiere_professeur,id',
            'q1'         => 'nullable|in:A,B,C',
            'q2'         => 'nullable|in:A,B,C',
            'q3'         => 'nullable|in:A,B,C',
            'q4'         => 'nullable|in:A,B,C',
            'q5'         => 'nullable|in:A,B,C',
            'q6'         => 'nullable|in:A,B,C',
            'q7'         => 'nullable|in:A,B,C',
            'q8'         => 'nullable|in:A,B,C',
            'q9'         => 'nullable|in:A,B,C',
            'q10'        => 'nullable|in:A,B,C',
            'commentaire'=> 'nullable|string|max:1000',
        ]);

        $data['etudiant_id'] = $request->user()->id;

        $existing = EvaluationEnseignement::where([
            'etudiant_id' => $data['etudiant_id'],
            'cmp_id'      => $data['cmp_id'],
        ])->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà évalué ce cours.'], 422);
        }

        $eval = EvaluationEnseignement::create($data);
        $eval->update(['score_total' => $eval->calculateScore()]);

        return response()->json($eval->load(['cmp.matiere', 'cmp.professeur']), 201);
    }

    public function show(EvaluationEnseignement $evaluationEnseignement)
    {
        return response()->json($evaluationEnseignement->load([
            'etudiant', 'cmp.matiere', 'cmp.professeur', 'cmp.classe.filiere',
        ]));
    }

    public function myEvaluations(Request $request)
    {
        $evals = EvaluationEnseignement::with([
            'cmp.matiere', 'cmp.professeur', 'cmp.classe',
        ])
        ->where('etudiant_id', $request->user()->id)
        ->latest()->get();

        return response()->json($evals);
    }

    public function classeGrid(Request $request, int $classeId)
    {
        $cmps = ClasseMatiereProf::with([
            'matiere', 'professeur',
            'evaluationsEnseignement',
        ])->where('classe_id', $classeId)->get();

        $result = $cmps->map(function ($cmp) {
            $evals = $cmp->evaluationsEnseignement;
            $count = $evals->count();
            $scores = $evals->pluck('score_total')->filter();

            $questions = [];
            foreach (range(1, 10) as $i) {
                $q = "q$i";
                $vals = $evals->pluck($q)->filter()->values();
                $c = collect(['A' => 0, 'B' => 0, 'C' => 0]);
                foreach ($vals as $v) { $c[$v]++; }
                $questions["q$i"] = [
                    'A' => $count > 0 ? round($c['A'] / $count * 100) : 0,
                    'B' => $count > 0 ? round($c['B'] / $count * 100) : 0,
                    'C' => $count > 0 ? round($c['C'] / $count * 100) : 0,
                ];
            }

            return [
                'cmp_id'       => $cmp->id,
                'matiere'      => $cmp->matiere,
                'professeur'   => $cmp->professeur,
                'nb_reponses'  => $count,
                'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
                'questions'    => $questions,
            ];
        });

        return response()->json($result);
    }
}
