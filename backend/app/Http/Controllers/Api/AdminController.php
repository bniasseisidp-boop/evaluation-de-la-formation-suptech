<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\EvaluationEnseignement;
use App\Models\EvaluationFormation;
use App\Models\EvaluationQualiteService;
use App\Models\Filiere;
use App\Models\Invitation;
use App\Models\Matiere;
use App\Models\User;
class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'filieres'          => Filiere::count(),
            'classes'           => Classe::count(),
            'etudiants'         => User::where('role', 'student')->count(),
            'invitations'       => Invitation::count(),
            'eval_enseignement' => EvaluationEnseignement::count(),
            'eval_qualite'      => EvaluationQualiteService::count(),
            'eval_formation'    => EvaluationFormation::count(),
            'recent_evals'      => EvaluationEnseignement::with([
                'etudiant', 'cmp.matiere', 'cmp.professeur', 'matiere',
            ])->latest()->take(10)->get(),
            'filieres_stats'    => $this->getFiliereStats(),
        ]);
    }

    public function filiereReport(int $filiereId)
    {
        $filiere = Filiere::with([
            'classes.classeMatiereProfs.matiere',
            'classes.classeMatiereProfs.professeur',
            'classes.etudiants',
        ])->findOrFail($filiereId);

        $allEtudiantIds = User::where('filiere_id', $filiereId)->where('role', 'student')->pluck('id');

        $classesData = $filiere->classes->map(function ($classe) {
            $etudiantIds = $classe->etudiants->pluck('id');
            $cmps        = $classe->classeMatiereProfs;

            if ($cmps->isEmpty()) {
                $matieresList = Matiere::orderBy('nom')->get()->map(function ($m) use ($etudiantIds) {
                    $evals = EvaluationEnseignement::whereNull('cmp_id')
                        ->where('matiere_id', $m->id)
                        ->whereIn('etudiant_id', $etudiantIds)->get();
                    return $this->buildCmpStats($evals, $m->nom, null);
                });
            } else {
                $matieresList = $cmps->map(function ($cmp) use ($etudiantIds) {
                    $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)
                        ->whereIn('etudiant_id', $etudiantIds)->get();
                    $prof = $cmp->professeur
                        ? trim(($cmp->professeur->prenom ?? '') . ' ' . ($cmp->professeur->nom ?? ''))
                        : null;
                    return $this->buildCmpStats($evals, $cmp->matiere->nom ?? '—', $prof);
                });
            }

            $nbEvals = EvaluationEnseignement::whereIn('etudiant_id', $etudiantIds)->count();

            return [
                'nom'            => $classe->nom,
                'niveau'         => $classe->niveau,
                'nb_etudiants'   => $etudiantIds->count(),
                'nb_cmps'        => $matieresList->count(),
                'nb_evaluations' => $nbEvals,
                'matieres'       => $matieresList->values(),
            ];
        });

        return response()->json([
            'filiere'         => $filiere,
            'nb_classes'      => $filiere->classes->count(),
            'nb_etudiants'    => $allEtudiantIds->count(),
            'qualite_stats'   => $this->getQualiteStats($allEtudiantIds),
            'formation_stats' => $this->getFormationStats($allEtudiantIds),
            'classes'         => $classesData,
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
        $cmps        = $classe->classeMatiereProfs;

        if ($cmps->isEmpty()) {
            $matieresList = Matiere::orderBy('nom')->get()->map(function ($m) use ($etudiantIds) {
                $evals = EvaluationEnseignement::whereNull('cmp_id')
                    ->where('matiere_id', $m->id)
                    ->whereIn('etudiant_id', $etudiantIds)->get();
                return $this->buildCmpStats($evals, $m->nom, null);
            });
        } else {
            $matieresList = $cmps->map(function ($cmp) use ($etudiantIds) {
                $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)
                    ->whereIn('etudiant_id', $etudiantIds)->get();
                $prof = $cmp->professeur
                    ? trim(($cmp->professeur->prenom ?? '') . ' ' . ($cmp->professeur->nom ?? ''))
                    : null;
                $stats = $this->buildCmpStats($evals, $cmp->matiere->nom ?? '—', $prof);
                $stats['cmp_id'] = $cmp->id;
                return $stats;
            });
        }

        $nbEvalStudents = $etudiantIds->count() > 0
            ? EvaluationEnseignement::whereIn('etudiant_id', $etudiantIds)
                ->distinct('etudiant_id')->count('etudiant_id')
            : 0;

        return response()->json([
            'classe'       => $classe,
            'nb_etudiants' => $etudiantIds->count(),
            'taux_reponse' => $etudiantIds->count() > 0
                ? round($nbEvalStudents / $etudiantIds->count() * 100, 1)
                : 0,
            'matieres'     => $matieresList->values(),
        ]);
    }

    public function resetEvals()
    {
        EvaluationEnseignement::truncate();
        EvaluationQualiteService::truncate();
        EvaluationFormation::truncate();
        // Remettre les invitations en "non utilisé" pour la nouvelle année
        Invitation::whereNotNull('used_at')->update(['used_at' => null]);

        return response()->json(['message' => 'Toutes les évaluations ont été réinitialisées pour la nouvelle année.']);
    }

    private function buildCmpStats($evals, string $matiereName, ?string $profName): array
    {
        $count = $evals->count();
        $questions = [];
        foreach (range(1, 10) as $i) {
            $q = "q$i";
            $questions["q$i"] = [
                'A' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'A')->count() / $count * 100, 1) : 0,
                'B' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'B')->count() / $count * 100, 1) : 0,
                'C' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'C')->count() / $count * 100, 1) : 0,
            ];
        }
        $scores = $evals->pluck('score_total')->filter();
        return [
            'matiere'      => $matiereName,
            'professeur'   => $profName,
            'nb_reponses'  => $count,
            'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
            'questions'    => $questions,
            'commentaires' => $evals->pluck('commentaire')->filter()->values(),
        ];
    }

    private function getFiliereStats(): array
    {
        return Filiere::with('classes')->get()->map(function ($filiere) {
            $etudiantIds = User::where('filiere_id', $filiere->id)
                ->where('role', 'student')->pluck('id');

            $evalEnsCount  = EvaluationEnseignement::whereIn('etudiant_id', $etudiantIds)->count();
            $evalQualCount = EvaluationQualiteService::whereIn('etudiant_id', $etudiantIds)->count();
            $evalFormCount = EvaluationFormation::whereIn('etudiant_id', $etudiantIds)->count();

            return [
                'filiere'           => $filiere->nom,
                'code'              => $filiere->code,
                'couleur'           => $filiere->couleur,
                'nb_classes'        => $filiere->classes->count(),
                'nb_etudiants'      => $etudiantIds->count(),
                'eval_enseignement' => $evalEnsCount,
                'eval_qualite'      => $evalQualCount,
                'eval_formation'    => $evalFormCount,
                'total_evals'       => $evalEnsCount + $evalQualCount + $evalFormCount,
            ];
        })->toArray();
    }

    private function getQualiteStats($etudiantIds): array
    {
        $evals = EvaluationQualiteService::whereIn('etudiant_id', $etudiantIds)->get();
        $count = $evals->count();
        if ($count === 0) return ['total' => 0];

        $fields = ['secretariat', 'direction', 'direction_etudes', 'documentation',
                   'salle_pratique', 'connexion', 'securite', 'toilettes', 'restaurant', 'cadre_general'];
        $stats = ['total' => $count];
        foreach ($fields as $f) {
            $vals     = $evals->pluck($f)->filter();
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

        $scoreFields = ['score_motivation', 'score_objectifs', 'score_contenu',
                        'score_techniques', 'score_exercices', 'score_formateur_comm', 'score_formateur_rythme'];
        $stats = ['total' => $count];
        foreach ($scoreFields as $f) {
            $vals      = $evals->pluck($f)->filter();
            $stats[$f] = $vals->count() > 0 ? round($vals->avg(), 2) : 0;
        }
        return $stats;
    }
}
