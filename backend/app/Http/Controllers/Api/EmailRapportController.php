<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClasseMatiereProf;
use App\Models\EvaluationEnseignement;
use App\Models\Parametre;
use App\Models\ProfEmailLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailRapportController extends Controller
{
    // GET /admin/emails/config
    public function getConfig()
    {
        return response()->json([
            'scheduled_at' => Parametre::get('email_rapport_scheduled_at'),
            'last_sent_at' => Parametre::get('email_rapport_last_sent_at'),
        ]);
    }

    // POST /admin/emails/config
    public function saveConfig(Request $request)
    {
        $request->validate(['scheduled_at' => 'nullable|date']);
        Parametre::set('email_rapport_scheduled_at', $request->scheduled_at);
        return response()->json(['message' => 'Planning sauvegardé.']);
    }

    // POST /admin/emails/envoyer
    public function envoyer(Request $request)
    {
        try {
            $force = $request->boolean('force', false);
            $result = $this->sendAllRapports($force);
            Parametre::set('email_rapport_last_sent_at', now()->toDateTimeString());
            return response()->json([
                'sent'    => $result['sent'],
                'errors'  => $result['errors'],
                'message' => $result['sent'] > 0
                    ? "{$result['sent']} email(s) envoyé(s) avec succès."
                    : "Aucun email envoyé. " . ($result['errors'] ? implode('; ', array_slice($result['errors'], 0, 2)) : "Aucun professeur éligible."),
            ]);
        } catch (\Exception $e) {
            Log::error('EmailRapport::envoyer error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Erreur serveur : ' . $e->getMessage(),
            ], 500);
        }
    }

    // GET /admin/emails/historique
    public function historique()
    {
        $logs = ProfEmailLog::with([
            'professeur',
            'cmp.matiere',
            'cmp.classe',
        ])->orderByDesc('sent_at')->get();

        return response()->json($logs);
    }

    // ── Logique d'envoi ────────────────────────────────────────────────────
    public function sendAllRapports(bool $force = false): array
    {
        $alreadySent = $force ? collect() : ProfEmailLog::where('annee_scolaire', '2025-2026')
            ->pluck('cmp_id');

        $cmps = ClasseMatiereProf::with(['professeur', 'matiere', 'classe'])
            ->whereHas('professeur', fn($q) => $q->whereNotNull('email'))
            ->whereHas('matiere')
            ->whereHas('classe')
            ->when(!$force, fn($q) => $q->whereNotIn('id', $alreadySent))
            ->get();

        $sent   = 0;
        $errors = [];

        foreach ($cmps as $cmp) {
            $evals = EvaluationEnseignement::where('cmp_id', $cmp->id)->get();
            if ($evals->count() === 0) continue;

            $count      = $evals->count();
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

            try {
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
                ], function ($m) use ($prof, $pdfContent, $matiere, $classe) {
                    $filename = 'rapport_' . $prof->nom . '_' . preg_replace('/[^A-Za-z0-9]/', '_', $matiere) . '.pdf';
                    $m->to($prof->email, $prof->prenom . ' ' . $prof->nom)
                      ->subject("Résultats de vos évaluations — {$matiere} / {$classe} — ISI SUPTECH")
                      ->attachData($pdfContent, $filename, ['mime' => 'application/pdf']);
                });

                ProfEmailLog::create([
                    'professeur_id'  => $cmp->professeur_id,
                    'cmp_id'         => $cmp->id,
                    'annee_scolaire' => '2025-2026',
                    'nb_evaluations' => $count,
                    'score_moyen'    => $scoreMoyen,
                    'sent_at'        => now(),
                ]);

                $sent++;

            } catch (\Exception $e) {
                $prof    = $cmp->professeur;
                $matiere = $cmp->matiere->nom ?? '—';
                $msg = "[{$prof->email} / {$matiere}] " . $e->getMessage();
                Log::error('EmailRapport send error: ' . $msg);
                $errors[] = $msg;
            }
        }

        return ['sent' => $sent, 'errors' => $errors];
    }
}
