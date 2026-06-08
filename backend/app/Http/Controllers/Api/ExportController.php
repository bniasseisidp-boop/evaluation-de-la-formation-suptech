<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\EvaluationEnseignement;
use App\Models\EvaluationFormation;
use App\Models\EvaluationQualiteService;
use App\Models\Filiere;
use App\Models\Matiere;
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

        $classesData = $filiere->classes->map(function ($classe) {
            $etudiantIds = $classe->etudiants->pluck('id');
            $cmps        = $classe->classeMatiereProfs;

            if ($cmps->isEmpty()) {
                $matieresList = Matiere::orderBy('nom')->get()->map(function ($m) use ($etudiantIds) {
                    $evals = EvaluationEnseignement::whereNull('cmp_id')
                        ->where('matiere_id', $m->id)
                        ->whereIn('etudiant_id', $etudiantIds)->get();
                    return $this->buildStats($evals, $m->nom, '—');
                });
            } else {
                $matieresList = $cmps->map(function ($cmp) use ($etudiantIds) {
                    $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)
                        ->whereIn('etudiant_id', $etudiantIds)->get();
                    $prof = trim(($cmp->professeur->prenom ?? '') . ' ' . ($cmp->professeur->nom ?? '')) ?: '—';
                    return $this->buildStats($evals, $cmp->matiere->nom ?? '—', $prof);
                });
            }

            return [
                'nom'      => $classe->nom,
                'niveau'   => $classe->niveau,
                'effectif' => $etudiantIds->count(),
                'matieres' => $matieresList->values()->toArray(),
            ];
        });

        $pdf = Pdf::loadView('pdf.rapport_filiere', [
            'filiere'   => $filiere,
            'classes'   => $classesData,
            'annee'     => '2025-2026',
            'generated' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'portrait');

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
        $cmps        = $classe->classeMatiereProfs;

        if ($cmps->isEmpty()) {
            $matieresList = Matiere::orderBy('nom')->get()->map(function ($m) use ($etudiantIds) {
                $evals = EvaluationEnseignement::whereNull('cmp_id')
                    ->where('matiere_id', $m->id)
                    ->whereIn('etudiant_id', $etudiantIds)->get();
                return $this->buildStats($evals, $m->nom, '—');
            });
        } else {
            $matieresList = $cmps->map(function ($cmp) use ($etudiantIds) {
                $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)
                    ->whereIn('etudiant_id', $etudiantIds)->get();
                $prof = trim(($cmp->professeur->prenom ?? '') . ' ' . ($cmp->professeur->nom ?? '')) ?: '—';
                return $this->buildStats($evals, $cmp->matiere->nom ?? '—', $prof);
            });
        }

        $pdf = Pdf::loadView('pdf.rapport_classe', [
            'classe'    => $classe,
            'matieres'  => $matieresList->values()->toArray(),
            'annee'     => '2025-2026',
            'generated' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('rapport_' . $classe->nom . '_' . date('Y') . '.pdf');
    }

    private function buildStats($evals, string $matiere, string $prof): array
    {
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
            'matiere'      => $matiere,
            'professeur'   => $prof,
            'nb_reponses'  => $count,
            'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
            'questions'    => $questions,
            'commentaires' => $evals->pluck('commentaire')->filter()->values()->toArray(),
        ];
    }
}
