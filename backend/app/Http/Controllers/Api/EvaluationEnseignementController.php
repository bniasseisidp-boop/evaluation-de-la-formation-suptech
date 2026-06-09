<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClasseMatiereProf;
use App\Models\EvaluationEnseignement;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EvaluationEnseignementController extends Controller
{
    public function index(Request $request)
    {
        $query = EvaluationEnseignement::with([
            'etudiant.filiere', 'etudiant.classe',
            'cmp.matiere', 'cmp.professeur', 'cmp.classe.filiere',
        ]);

        if ($request->classe_id) {
            $query->whereHas('cmp', fn($q) => $q->where('classe_id', $request->classe_id));
        }
        if ($request->filiere_id) {
            $query->whereHas('cmp.classe', fn($q) => $q->where('filiere_id', $request->filiere_id));
        }
        if ($request->etudiant_id) {
            $query->where('etudiant_id', $request->etudiant_id);
        }

        return response()->json($query->latest()->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cmp_id'      => 'nullable|exists:classe_matiere_professeur,id',
            'matiere_id'  => 'nullable|exists:matieres,id',
            'q1'          => 'nullable|in:A,B,C',
            'q2'          => 'nullable|in:A,B,C',
            'q3'          => 'nullable|in:A,B,C',
            'q4'          => 'nullable|in:A,B,C',
            'q5'          => 'nullable|in:A,B,C',
            'q6'          => 'nullable|in:A,B,C',
            'q7'          => 'nullable|in:A,B,C',
            'q8'          => 'nullable|in:A,B,C',
            'q9'          => 'nullable|in:A,B,C',
            'q10'         => 'nullable|in:A,B,C',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        if (empty($data['cmp_id']) && empty($data['matiere_id'])) {
            return response()->json(['message' => 'cmp_id ou matiere_id requis.'], 422);
        }

        $data['etudiant_id'] = $request->user()->id;

        $query = EvaluationEnseignement::where('etudiant_id', $data['etudiant_id']);
        if (!empty($data['cmp_id'])) {
            $query->where('cmp_id', $data['cmp_id']);
        } else {
            $query->where('matiere_id', $data['matiere_id'])->whereNull('cmp_id');
        }

        if ($query->exists()) {
            return response()->json(['message' => 'Vous avez déjà évalué ce cours.'], 422);
        }

        $eval = EvaluationEnseignement::create($data);
        $eval->update(['score_total' => $eval->calculateScore()]);

        // Auto-notify professor when all students have evaluated
        if (!empty($data['cmp_id'])) {
            $this->checkAndNotifyProfesseur($eval);
        }

        return response()->json($eval->load(['cmp.matiere', 'cmp.professeur']), 201);
    }

    public function show(EvaluationEnseignement $evaluationEnseignement)
    {
        return response()->json($evaluationEnseignement->load([
            'etudiant', 'cmp.matiere', 'cmp.professeur', 'cmp.classe.filiere',
        ]));
    }

    public function myEvaluations(Request $request)
    {
        $evals = EvaluationEnseignement::with([
            'cmp.matiere', 'cmp.professeur', 'cmp.classe',
        ])
        ->where('etudiant_id', $request->user()->id)
        ->latest()->get();

        return response()->json($evals);
    }

    public function classeGrid(int $classeId)
    {
        $cmps = ClasseMatiereProf::with([
            'matiere', 'professeur',
            'evaluationsEnseignement',
        ])->where('classe_id', $classeId)->get();

        $result = $cmps->map(function ($cmp) {
            $evals = $cmp->evaluationsEnseignement;
            $count = $evals->count();
            $scores = $evals->pluck('score_total')->filter();

            $questions = [];
            foreach (range(1, 10) as $i) {
                $q = "q$i";
                $vals = $evals->pluck($q)->filter()->values();
                $c = collect(['A' => 0, 'B' => 0, 'C' => 0]);
                foreach ($vals as $v) { $c[$v]++; }
                $questions["q$i"] = [
                    'A' => $count > 0 ? round($c['A'] / $count * 100) : 0,
                    'B' => $count > 0 ? round($c['B'] / $count * 100) : 0,
                    'C' => $count > 0 ? round($c['C'] / $count * 100) : 0,
                ];
            }

            return [
                'cmp_id'       => $cmp->id,
                'matiere'      => $cmp->matiere,
                'professeur'   => $cmp->professeur,
                'nb_reponses'  => $count,
                'score_moyen'  => $scores->count() > 0 ? round($scores->avg(), 1) : 0,
                'questions'    => $questions,
            ];
        });

        return response()->json($result);
    }

    private function checkAndNotifyProfesseur(EvaluationEnseignement $eval): void
    {
        try {
            $cmp = ClasseMatiereProf::with(['professeur', 'matiere', 'classe'])->find($eval->cmp_id);
            if (!$cmp || !$cmp->professeur || !$cmp->professeur->email) return;

            $totalStudents = User::where('classe_id', $cmp->classe_id)->where('role', 'student')->count();
            if ($totalStudents === 0) return;

            $totalEvals = EvaluationEnseignement::where('cmp_id', $cmp->id)->count();
            if ($totalEvals !== $totalStudents) return;

            $this->sendProfesseurReport($cmp);
        } catch (\Exception $e) {
            // Silent fail — don't break the evaluation submission
            \Log::warning('Prof notification failed for CMP ' . $eval->cmp_id . ': ' . $e->getMessage());
        }
    }

    private function sendProfesseurReport(ClasseMatiereProf $cmp): void
    {
        $evals = EvaluationEnseignement::with(['etudiant'])
            ->where('cmp_id', $cmp->id)->get();

        $count = $evals->count();
        $scores = $evals->pluck('score_total')->filter();
        $scoreMoyen = $scores->count() > 0 ? round($scores->avg(), 1) : 0;

        $questionsStats = [];
        foreach (range(1, 10) as $i) {
            $q = "q$i";
            $questionsStats[$q] = [
                'A' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'A')->count() / $count * 100) : 0,
                'B' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'B')->count() / $count * 100) : 0,
                'C' => $count > 0 ? round($evals->filter(fn($e) => $e->$q === 'C')->count() / $count * 100) : 0,
            ];
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
        $classe  = $cmp->classe->nom ?? '—';
        $pdfName = 'rapport_' . preg_replace('/[^a-z0-9]/i', '_', $matiere) . '_' . preg_replace('/[^a-z0-9]/i', '_', $classe) . '.pdf';

        Mail::send('emails.rapport_professeur', [
            'prof'       => $prof,
            'cmp'        => $cmp,
            'matiere'    => $matiere,
            'classe'     => $classe,
            'scoreMoyen' => $scoreMoyen,
            'count'      => $count,
        ], function ($m) use ($prof, $pdfContent, $pdfName, $matiere, $classe) {
            $m->to($prof->email, $prof->prenom . ' ' . $prof->nom)
              ->subject("Résultats de vos évaluations — {$matiere} / {$classe} — ISI SUPTECH")
              ->attachData($pdfContent, $pdfName, ['mime' => 'application/pdf']);
        });
    }
}
