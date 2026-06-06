<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EvaluationFormation;
use Illuminate\Http\Request;

class EvaluationFormationController extends Controller
{
    public function index(Request $request)
    {
        $query = EvaluationFormation::with(['etudiant.filiere', 'etudiant.classe']);

        if ($request->filiere_id) {
            $query->whereHas('etudiant', fn($q) => $q->where('filiere_id', $request->filiere_id));
        }
        if ($request->classe_id) {
            $query->whereHas('etudiant', fn($q) => $q->where('classe_id', $request->classe_id));
        }

        return response()->json($query->latest()->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'                       => 'required|in:simple,detaillee',
            'score_motivation'           => 'nullable|integer|between:1,5',
            'score_objectifs'            => 'nullable|integer|between:1,5',
            'score_contenu'              => 'nullable|integer|between:1,5',
            'score_techniques'           => 'nullable|integer|between:1,5',
            'score_exercices'            => 'nullable|integer|between:1,5',
            'score_formateur_comm'       => 'nullable|integer|between:1,5',
            'score_formateur_rythme'     => 'nullable|integer|between:1,5',
            'score_connaissance'         => 'nullable|integer|between:1,5',
            'score_application'          => 'nullable|integer|between:1,5',
            'score_recommandation'       => 'nullable|integer|between:1,5',
            'objectifs_session'          => 'nullable|array',
            'pedagogie'                  => 'nullable|string|max:2000',
            'formateurs_avis'            => 'nullable|string|max:2000',
            'moyens_environnement'       => 'nullable|string|max:2000',
            'logistique'                 => 'nullable|string|max:2000',
            'benefices'                  => 'nullable|string|max:2000',
            'commentaires_suggestions'   => 'nullable|string|max:2000',
            'formation_repondu_attentes' => 'nullable|boolean',
            'competences_pratique'       => 'nullable|string|max:2000',
            'emploi_trouve'              => 'nullable|boolean',
            'nature_emploi'              => 'nullable|string|max:500',
        ]);

        $data['etudiant_id']    = $request->user()->id;
        $data['annee_scolaire'] = '2025-2026';

        $eval = EvaluationFormation::create($data);
        return response()->json($eval, 201);
    }

    public function myEvaluations(Request $request)
    {
        $evals = EvaluationFormation::where('etudiant_id', $request->user()->id)
            ->latest()->get();
        return response()->json($evals);
    }

    public function globalStats(Request $request)
    {
        $query = EvaluationFormation::query();
        if ($request->filiere_id) {
            $query->whereHas('etudiant', fn($q) => $q->where('filiere_id', $request->filiere_id));
        }

        $evals = $query->get();
        $count = $evals->count();

        $scoreFields = [
            'score_motivation','score_objectifs','score_contenu','score_techniques',
            'score_exercices','score_formateur_comm','score_formateur_rythme',
        ];

        $stats = [];
        foreach ($scoreFields as $f) {
            $vals = $evals->pluck($f)->filter();
            $stats[$f] = $vals->count() > 0 ? round($vals->avg(), 2) : 0;
        }

        $emploiTrouve = $evals->where('emploi_trouve', true)->count();
        $formationRepondu = $evals->where('formation_repondu_attentes', true)->count();

        return response()->json([
            'total_reponses'         => $count,
            'scores_moyens'          => $stats,
            'taux_emploi'            => $count > 0 ? round($emploiTrouve / $count * 100, 1) : 0,
            'taux_formation_satisf'  => $count > 0 ? round($formationRepondu / $count * 100, 1) : 0,
        ]);
    }
}
