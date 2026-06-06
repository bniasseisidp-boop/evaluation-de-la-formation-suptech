<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\EvaluationEnseignement;
use App\Models\EvaluationFormation;
use App\Models\EvaluationQualiteService;
use App\Models\Filiere;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'filieres'         => Filiere::count(),
            'classes'          => Classe::count(),
            'etudiants'        => User::where('role', 'student')->count(),
            'invitations'      => Invitation::count(),
            'eval_enseignement'=> EvaluationEnseignement::count(),
            'eval_qualite'     => EvaluationQualiteService::count(),
            'eval_formation'   => EvaluationFormation::count(),
            'recent_evals'     => EvaluationEnseignement::with([
                'etudiant', 'cmp.matiere', 'cmp.professeur',
            ])->latest()->take(10)->get(),
            'filieres_stats'   => $this->getFiliereStats(),
        ]);
    }

    private function getFiliereStats(): array
    {
        return Filiere::with('classes')->get()->map(function ($filiere) {
            $etudiantIds = User::where('filiere_id', $filiere->id)
                ->where('role', 'student')->pluck('id');

            $evalEnsCount = EvaluationEnseignement::whereIn('etudiant_id', $etudiantIds)->count();
            $evalQualCount = EvaluationQualiteService::whereIn('etudiant_id', $etudiantIds)->count();
            $evalFormCount = EvaluationFormation::whereIn('etudiant_id', $etudiantIds)->count();

            return [
                'filiere'         => $filiere->nom,
                'code'            => $filiere->code,
                'couleur'         => $filiere->couleur,
                'nb_classes'      => $filiere->classes->count(),
                'nb_etudiants'    => $etudiantIds->count(),
                'eval_enseignement' => $evalEnsCount,
                'eval_qualite'    => $evalQualCount,
                'eval_formation'  => $evalFormCount,
                'total_evals'     => $evalEnsCount + $evalQualCount + $evalFormCount,
            ];
        })->toArray();
    }

    public function filiereReport(int $filiereId)
    {
        $filiere = Filiere::with([
            'classes.classeMatiereProfs.matiere',
            'classes.classeMatiereProfs.professeur',
            'classes.etudiants',
        ])->findOrFail($filiereId);

        $etudiantIds = User::where('filiere_id', $filiereId)
            ->where('role', 'student')->pluck('id');

        $evalQualStats  = $this->getQualiteStats($etudiantIds);
        $evalFormStats  = $this->getFormationStats($etudiantIds);
        $classesDetails = $this->getClassesDetails($filiere->classes);

        return response()->json([
            'filiere'        => $filiere,
            'nb_etudiants'   => $etudiantIds->count(),
            'qualite_stats'  => $evalQualStats,
            'formation_stats'=> $evalFormStats,
            'classes'        => $classesDetails,
        ]);
    }

    public function classeReport(int $classeId)
    {
        $classe = Classe::with([
            'filiere',
            'classeMatiereProfs.matiere',
            'classeMatiereProfs.professeur',
            'etudiants',
        ])->findOrFail($classeId);

        $etudiantIds = $classe->etudiants->pluck('id');

        $cmpsWithScores = $classe->classeMatiereProfs->map(function ($cmp) use ($etudiantIds) {
            $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)
                ->whereIn('etudiant_id', $etudiantIds)->get();
            $count = $evals->count();

            $questionStats = [];
            foreach (range(1, 10) as $i) {
                $q    = "q$i";
                $vals = $evals->pluck($q)->filter();
                $questionStats["q$i"] = [
                    'A'       => $count > 0 ? round($vals->filter(fn($v) => $v === 'A')->count() / $count * 100, 1) : 0,
                    'B'       => $count > 0 ? round($vals->filter(fn($v) => $v === 'B')->count() / $count * 100, 1) : 0,
                    'C'       => $count > 0 ? round($vals->filter(fn($v) => $v === 'C')->count() / $count * 100, 1) : 0,
                ];
            }

            $scores = $evals->pluck('score_total')->filter();
            return [
                'cmp'          => $cmp,
                'nb_reponses'  => $count,
                'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
                'questions'    => $questionStats,
                'commentaires' => $evals->pluck('commentaire')->filter()->values(),
            ];
        });

        return response()->json([
            'classe'         => $classe,
            'nb_etudiants'   => $etudiantIds->count(),
            'taux_reponse'   => $etudiantIds->count() > 0
                ? round(
                    EvaluationEnseignement::whereIn('etudiant_id', $etudiantIds)->distinct('etudiant_id')->count('etudiant_id')
                    / $etudiantIds->count() * 100, 1
                )
                : 0,
            'matieres'       => $cmpsWithScores,
        ]);
    }

    private function getQualiteStats($etudiantIds): array
    {
        $evals = EvaluationQualiteService::whereIn('etudiant_id', $etudiantIds)->get();
        $count = $evals->count();
        if ($count === 0) return ['total' => 0];

        $fields = ['secretariat','direction','direction_etudes','documentation',
                   'salle_pratique','connexion','securite','toilettes','restaurant','cadre_general'];
        $stats = ['total' => $count];
        foreach ($fields as $f) {
            $vals = $evals->pluck($f)->filter();
            $scoreSum = $vals->sum(fn($v) => EvaluationQualiteService::getScoreLabel($v));
            $stats[$f] = $vals->count() > 0 ? round($scoreSum / $vals->count(), 2) : 0;
        }
        $stats['taux_recommande'] = round($evals->where('recommande', true)->count() / $count * 100, 1);
        return $stats;
    }

    private function getFormationStats($etudiantIds): array
    {
        $evals = EvaluationFormation::whereIn('etudiant_id', $etudiantIds)->get();
        $count = $evals->count();
        if ($count === 0) return ['total' => 0];

        $scoreFields = ['score_motivation','score_objectifs','score_contenu',
                        'score_techniques','score_exercices','score_formateur_comm','score_formateur_rythme'];
        $stats = ['total' => $count];
        foreach ($scoreFields as $f) {
            $vals = $evals->pluck($f)->filter();
            $stats[$f] = $vals->count() > 0 ? round($vals->avg(), 2) : 0;
        }
        return $stats;
    }

    private function getClassesDetails($classes): array
    {
        return $classes->map(function ($classe) {
            $etudiantIds = $classe->etudiants->pluck('id');
            $evalCount = EvaluationEnseignement::whereIn('etudiant_id', $etudiantIds)->count();
            $scores = EvaluationEnseignement::whereIn('etudiant_id', $etudiantIds)
                ->pluck('score_total')->filter();

            return [
                'id'           => $classe->id,
                'nom'          => $classe->nom,
                'niveau'       => $classe->niveau,
                'nb_etudiants' => $etudiantIds->count(),
                'nb_evals'     => $evalCount,
                'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
            ];
        })->toArray();
    }
}
