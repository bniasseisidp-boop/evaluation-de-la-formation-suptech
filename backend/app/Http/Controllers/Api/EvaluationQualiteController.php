<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EvaluationQualiteService;
use Illuminate\Http\Request;

class EvaluationQualiteController extends Controller
{
    public function index(Request $request)
    {
        $query = EvaluationQualiteService::with(['etudiant.filiere', 'etudiant.classe']);

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
        $annee      = '2025-2026';
        $etudiantId = $request->user()->id;

        $data = $request->validate([
            'secretariat'      => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'direction'        => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'direction_etudes' => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'documentation'    => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'salle_pratique'   => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'connexion'        => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'securite'         => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'toilettes'        => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'restaurant'       => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'cadre_general'    => 'nullable|in:tres_satisfait,satisfait,peu_satisfait,pas_satisfait,pas_du_tout',
            'recommande'       => 'nullable|boolean',
            'commentaire'      => 'nullable|string|max:1000',
        ]);

        // updateOrCreate → l'étudiant peut modifier sa réponse
        $eval = EvaluationQualiteService::updateOrCreate(
            ['etudiant_id' => $etudiantId, 'annee_scolaire' => $annee],
            $data
        );

        return response()->json($eval, 201);
    }

    public function myEvaluation(Request $request)
    {
        $eval = EvaluationQualiteService::where('etudiant_id', $request->user()->id)
            ->latest()->first();
        return response()->json($eval);
    }

    public function globalStats(Request $request)
    {
        $query = EvaluationQualiteService::query();
        if ($request->filiere_id) {
            $query->whereHas('etudiant', fn($q) => $q->where('filiere_id', $request->filiere_id));
        }

        $evals = $query->get();
        $count = $evals->count();

        $fields = ['secretariat','direction','direction_etudes','documentation',
                   'salle_pratique','connexion','securite','toilettes','restaurant','cadre_general'];

        $stats = [];
        foreach ($fields as $field) {
            $distribution = ['tres_satisfait'=>0,'satisfait'=>0,'peu_satisfait'=>0,'pas_satisfait'=>0,'pas_du_tout'=>0];
            foreach ($evals as $e) {
                if ($e->$field) $distribution[$e->$field]++;
            }
            $scoreTotal = 0;
            foreach ($evals as $e) {
                if ($e->$field) $scoreTotal += EvaluationQualiteService::getScoreLabel($e->$field);
            }
            $stats[$field] = [
                'distribution' => $distribution,
                'score_moyen'  => $count > 0 ? round($scoreTotal / $count, 2) : 0,
            ];
        }

        $recommandes = $evals->where('recommande', true)->count();

        return response()->json([
            'total_reponses'  => $count,
            'taux_recommande' => $count > 0 ? round($recommandes / $count * 100, 1) : 0,
            'stats'           => $stats,
        ]);
    }
}
