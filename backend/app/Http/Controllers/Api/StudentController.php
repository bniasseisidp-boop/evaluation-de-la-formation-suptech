<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClasseMatiereProf;
use App\Models\EvaluationEnseignement;
use App\Models\EvaluationFormation;
use App\Models\EvaluationQualiteService;
use App\Models\Matiere;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user()->load(['filiere', 'classe']);

        // 1. Chercher les CMPs associés à la classe de l'étudiant
        $cmpsInClasse = ClasseMatiereProf::with(['matiere', 'professeur'])
            ->where('classe_id', $user->classe_id)
            ->get();

        // 2. Si aucun CMP configuré → utiliser toutes les matières du système
        //    comme "matières virtuelles" à évaluer (sans professeur)
        $useDirectMatieres = $cmpsInClasse->isEmpty();
        if ($useDirectMatieres) {
            $matieres = Matiere::orderBy('nom')->get();
            // Transformer en objets compatibles avec le format CMP
            $cmpsInClasse = $matieres->map(function ($m) {
                return (object)[
                    'id'          => 'mat_' . $m->id,
                    'matiere_id'  => $m->id,
                    'matiere'     => $m,
                    'professeur'  => null,
                    'classe_id'   => null,
                    'is_virtual'  => true,
                ];
            });
        }

        // 3. Évaluations déjà faites par cet étudiant
        $evalCmpIds    = EvaluationEnseignement::where('etudiant_id', $user->id)->pluck('cmp_id')->filter()->toArray();
        $evalMatIds    = EvaluationEnseignement::where('etudiant_id', $user->id)->pluck('matiere_id')->filter()->toArray();

        $evalQualite   = EvaluationQualiteService::where('etudiant_id', $user->id)->exists();
        $evalFormation = EvaluationFormation::where('etudiant_id', $user->id)->count();

        $totalMatieres   = $cmpsInClasse->count();

        $matieresEvalueesCount = $cmpsInClasse->filter(function ($c) use ($evalCmpIds, $evalMatIds, $useDirectMatieres) {
            if ($useDirectMatieres) {
                return in_array($c->matiere_id, $evalMatIds);
            }
            return in_array($c->id, $evalCmpIds);
        })->count();

        $matieresAEvaluer = $cmpsInClasse->filter(function ($c) use ($evalCmpIds, $evalMatIds, $useDirectMatieres) {
            if ($useDirectMatieres) {
                return !in_array($c->matiere_id, $evalMatIds);
            }
            return !in_array($c->id, $evalCmpIds);
        })->values();

        $matieresEvaluees = $cmpsInClasse->filter(function ($c) use ($evalCmpIds, $evalMatIds, $useDirectMatieres) {
            if ($useDirectMatieres) {
                return in_array($c->matiere_id, $evalMatIds);
            }
            return in_array($c->id, $evalCmpIds);
        })->values();

        return response()->json([
            'user'  => $user,
            'stats' => [
                'total_matieres'       => $totalMatieres,
                'matieres_evaluees'    => $matieresEvalueesCount,
                'eval_qualite_done'    => $evalQualite,
                'eval_formation_count' => $evalFormation,
                'mode_virtuel'         => $useDirectMatieres,
            ],
            'matieres_a_evaluer' => $matieresAEvaluer,
            'matieres_evaluees'  => $matieresEvaluees,
        ]);
    }

    public function index(Request $request)
    {
        $query = User::where('role', 'student')->with(['filiere', 'classe']);

        if ($request->filiere_id) {
            $query->where('filiere_id', $request->filiere_id);
        }
        if ($request->classe_id) {
            $query->where('classe_id', $request->classe_id);
        }

        $students = $query->get()->map(function ($student) {
            $evalEns  = EvaluationEnseignement::where('etudiant_id', $student->id)->count();
            $evalQual = EvaluationQualiteService::where('etudiant_id', $student->id)->exists();
            $evalForm = EvaluationFormation::where('etudiant_id', $student->id)->count();

            $cmpsInClasse = $student->classe_id
                ? ClasseMatiereProf::where('classe_id', $student->classe_id)->count()
                : 0;

            $student->evaluation_stats = [
                'enseignement'       => $evalEns,
                'qualite'            => $evalQual ? 1 : 0,
                'formation'          => $evalForm,
                'total_matieres'     => $cmpsInClasse,
                'taux_participation' => $cmpsInClasse > 0
                    ? round($evalEns / $cmpsInClasse * 100, 1) : 0,
            ];
            return $student;
        });

        return response()->json($students);
    }

    public function show(User $user)
    {
        $evalEns  = EvaluationEnseignement::with(['cmp.matiere', 'cmp.professeur', 'matiere'])
            ->where('etudiant_id', $user->id)->get();
        $evalQual = EvaluationQualiteService::where('etudiant_id', $user->id)->latest()->first();
        $evalForm = EvaluationFormation::where('etudiant_id', $user->id)->get();

        return response()->json([
            'student'                  => $user->load(['filiere', 'classe']),
            'evaluations_enseignement' => $evalEns,
            'evaluation_qualite'       => $evalQual,
            'evaluations_formation'    => $evalForm,
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }
        EvaluationEnseignement::where('etudiant_id', $user->id)->delete();
        EvaluationQualiteService::where('etudiant_id', $user->id)->delete();
        EvaluationFormation::where('etudiant_id', $user->id)->delete();
        $user->tokens()->delete();
        $user->delete();
        return response()->json(['message' => 'Étudiant supprimé avec succès.']);
    }
}
