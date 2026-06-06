<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClasseMatiereProf;
use App\Models\EvaluationEnseignement;
use App\Models\EvaluationFormation;
use App\Models\EvaluationQualiteService;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user()->load(['filiere', 'classe']);

        $cmpsInClasse = ClasseMatiereProf::with(['matiere', 'professeur'])
            ->where('classe_id', $user->classe_id)
            ->get();

        $evalIds = EvaluationEnseignement::where('etudiant_id', $user->id)
            ->pluck('cmp_id')->toArray();

        $evalQualite = EvaluationQualiteService::where('etudiant_id', $user->id)->exists();
        $evalFormation = EvaluationFormation::where('etudiant_id', $user->id)->count();

        $totalMatieres = $cmpsInClasse->count();
        $matieresEvaluees = count(array_intersect($cmpsInClasse->pluck('id')->toArray(), $evalIds));

        return response()->json([
            'user'               => $user,
            'stats'              => [
                'total_matieres'     => $totalMatieres,
                'matieres_evaluees'  => $matieresEvaluees,
                'eval_qualite_done'  => $evalQualite,
                'eval_formation_count' => $evalFormation,
            ],
            'matieres_a_evaluer' => $cmpsInClasse->filter(
                fn($c) => !in_array($c->id, $evalIds)
            )->values(),
            'matieres_evaluees'  => $cmpsInClasse->filter(
                fn($c) => in_array($c->id, $evalIds)
            )->values(),
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
                'nb_eval_enseignement' => $evalEns,
                'eval_qualite_done'    => $evalQual,
                'nb_eval_formation'    => $evalForm,
                'total_matieres'       => $cmpsInClasse,
                'taux_participation'   => $cmpsInClasse > 0
                    ? round($evalEns / $cmpsInClasse * 100, 1) : 0,
            ];
            return $student;
        });

        return response()->json($students);
    }

    public function show(User $user)
    {
        $evalEns = EvaluationEnseignement::with(['cmp.matiere', 'cmp.professeur'])
            ->where('etudiant_id', $user->id)->get();
        $evalQual = EvaluationQualiteService::where('etudiant_id', $user->id)->latest()->first();
        $evalForm = EvaluationFormation::where('etudiant_id', $user->id)->get();

        return response()->json([
            'student'               => $user->load(['filiere', 'classe']),
            'evaluations_enseignement' => $evalEns,
            'evaluation_qualite'    => $evalQual,
            'evaluations_formation' => $evalForm,
        ]);
    }
}
