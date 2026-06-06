<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\EvaluationEnseignement;
use App\Models\EvaluationFormation;
use App\Models\EvaluationQualiteService;
use App\Models\Filiere;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function exportFiliere(Request $request, int $filiereId)
    {
        $filiere = Filiere::with([
            'classes.classeMatiereProfs.matiere',
            'classes.classeMatiereProfs.professeur',
            'classes.etudiants',
        ])->findOrFail($filiereId);

        $etudiantIds = User::where('filiere_id', $filiereId)
            ->where('role', 'student')->pluck('id');

        $evalQualite  = EvaluationQualiteService::whereIn('etudiant_id', $etudiantIds)->get();
        $evalFormation = EvaluationFormation::whereIn('etudiant_id', $etudiantIds)->get();

        $classesData = $filiere->classes->map(function ($classe) use ($etudiantIds) {
            $cmpData = $classe->classeMatiereProfs->map(function ($cmp) use ($etudiantIds) {
                $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)
                    ->whereIn('etudiant_id', $etudiantIds)->get();
                $count = $evals->count();
                $questions = [];
                foreach (range(1, 10) as $i) {
                    $q = "q$i";
                    $questions["q$i"] = [
                        'A' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'A')->count() / $count * 100) : 0,
                        'B' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'B')->count() / $count * 100) : 0,
                        'C' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'C')->count() / $count * 100) : 0,
                    ];
                }
                $scores = $evals->pluck('score_total')->filter();
                return [
                    'matiere'      => $cmp->matiere->nom ?? '—',
                    'professeur'   => ($cmp->professeur->prenom ?? '') . ' ' . ($cmp->professeur->nom ?? ''),
                    'nb_reponses'  => $count,
                    'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
                    'questions'    => $questions,
                    'commentaires' => $evals->pluck('commentaire')->filter()->values()->toArray(),
                ];
            });
            return [
                'nom'      => $classe->nom,
                'niveau'   => $classe->niveau,
                'effectif' => $classe->etudiants->count(),
                'matieres' => $cmpData->toArray(),
            ];
        });

        $data = [
            'filiere'   => $filiere,
            'classes'   => $classesData,
            'annee'     => '2025-2026',
            'generated' => now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('pdf.rapport_filiere', $data)
            ->setPaper('a4', 'portrait');

        return $pdf->download('rapport_' . $filiere->code . '_' . date('Y') . '.pdf');
    }

    public function exportClasse(Request $request, int $classeId)
    {
        $classe = Classe::with([
            'filiere',
            'classeMatiereProfs.matiere',
            'classeMatiereProfs.professeur',
            'etudiants',
        ])->findOrFail($classeId);

        $etudiantIds = $classe->etudiants->pluck('id');

        $matieres = $classe->classeMatiereProfs->map(function ($cmp) use ($etudiantIds) {
            $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)
                ->whereIn('etudiant_id', $etudiantIds)->get();
            $count = $evals->count();

            $questions = [];
            foreach (range(1, 10) as $i) {
                $q = "q$i";
                $questions["q$i"] = [
                    'A' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'A')->count() / $count * 100) : 0,
                    'B' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'B')->count() / $count * 100) : 0,
                    'C' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'C')->count() / $count * 100) : 0,
                ];
            }
            $scores = $evals->pluck('score_total')->filter();
            return [
                'matiere'      => $cmp->matiere->nom ?? '—',
                'professeur'   => ($cmp->professeur->prenom ?? '') . ' ' . ($cmp->professeur->nom ?? ''),
                'nb_reponses'  => $count,
                'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
                'questions'    => $questions,
                'commentaires' => $evals->pluck('commentaire')->filter()->values()->toArray(),
            ];
        });

        $data = [
            'classe'    => $classe,
            'matieres'  => $matieres,
            'annee'     => '2025-2026',
            'generated' => now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('pdf.rapport_classe', $data)->setPaper('a4', 'landscape');
        return $pdf->download('rapport_' . $classe->nom . '_' . date('Y') . '.pdf');
    }
}
