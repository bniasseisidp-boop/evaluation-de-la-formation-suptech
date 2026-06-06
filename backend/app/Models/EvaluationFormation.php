<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationFormation extends Model
{
    use HasFactory;

    protected $table = 'evaluations_formation';

    protected $fillable = [
        'etudiant_id', 'type',
        'score_motivation','score_objectifs','score_contenu','score_techniques',
        'score_exercices','score_formateur_comm','score_formateur_rythme',
        'score_connaissance','score_application','score_recommandation',
        'objectifs_session', 'pedagogie', 'formateurs_avis',
        'moyens_environnement', 'logistique', 'benefices',
        'commentaires_suggestions', 'formation_repondu_attentes',
        'competences_pratique', 'emploi_trouve', 'nature_emploi', 'annee_scolaire',
    ];

    protected $casts = [
        'objectifs_session'         => 'array',
        'formation_repondu_attentes' => 'boolean',
        'emploi_trouve'             => 'boolean',
    ];

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function getScoreMoyenAttribute(): float
    {
        $scores = collect([
            $this->score_motivation, $this->score_objectifs, $this->score_contenu,
            $this->score_techniques, $this->score_exercices, $this->score_formateur_comm,
            $this->score_formateur_rythme,
        ])->filter();
        return $scores->count() > 0 ? round($scores->avg(), 2) : 0;
    }
}
