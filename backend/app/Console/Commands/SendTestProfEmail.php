<?php

namespace App\Console\Commands;

use App\Models\ClasseMatiereProf;
use App\Models\EvaluationEnseignement;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestProfEmail extends Command
{
    protected $signature   = 'email:prof-test {email : Adresse email destinataire du test}';
    protected $description = 'Envoie un email de test au format rapport professeur';

    public function handle(): int
    {
        $targetEmail = $this->argument('email');

        $cmp = ClasseMatiereProf::with(['professeur', 'matiere', 'classe'])
            ->whereHas('professeur')
            ->whereHas('matiere')
            ->whereHas('classe')
            ->first();

        if (!$cmp) {
            $this->error('Aucun CMP trouvé en base. Lancez d\'abord les seeders.');
            return 1;
        }

        $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)->get();
        $count = $evals->count();

        if ($count === 0) {
            // Données synthétiques pour la démo
            $scoreMoyen = 78.5;
            $count      = 20;
            $questionsStats = [];
            foreach (range(1, 10) as $i) {
                $questionsStats["q{$i}"] = ['A' => 65, 'B' => 25, 'C' => 10];
            }
        } else {
            $scores     = $evals->pluck('score_total')->filter();
            $scoreMoyen = $scores->count() > 0 ? round($scores->avg(), 1) : 0;
            $questionsStats = [];
            foreach (range(1, 10) as $i) {
                $q = "q{$i}";
                $questionsStats[$q] = [
                    'A' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'A')->count() / $count * 100) : 0,
                    'B' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'B')->count() / $count * 100) : 0,
                    'C' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'C')->count() / $count * 100) : 0,
                ];
            }
        }

        $pdfContent = Pdf::loadView('pdf.rapport_prof_cmp', [
            'cmp'            => $cmp,
            'evals'          => $evals,
            'scoreMoyen'     => $scoreMoyen,
            'questionsStats' => $questionsStats,
            'count'          => $count,
            'annee'          => '2025-2026',
            'generated'      => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape')->output();

        $prof    = $cmp->professeur;
        $matiere = $cmp->matiere->nom ?? '—';
        $classe  = $cmp->classe->nom  ?? '—';

        Mail::send('emails.rapport_professeur', [
            'prof'       => $prof,
            'cmp'        => $cmp,
            'matiere'    => $matiere,
            'classe'     => $classe,
            'scoreMoyen' => $scoreMoyen,
            'count'      => $count,
        ], function ($m) use ($targetEmail, $prof, $pdfContent, $matiere, $classe) {
            $m->to($targetEmail, $prof->prenom . ' ' . $prof->nom)
              ->subject("[TEST] Résultats de vos évaluations — {$matiere} / {$classe} — ISI SUPTECH")
              ->attachData($pdfContent, 'rapport_test_prof.pdf', ['mime' => 'application/pdf']);
        });

        $this->info("Email de test envoyé avec succès à {$targetEmail}");
        $this->line("  Professeur : {$prof->prenom} {$prof->nom}");
        $this->line("  Matière    : {$matiere}");
        $this->line("  Classe     : {$classe}");
        $this->line("  Score      : {$scoreMoyen}%");

        return 0;
    }
}
