<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClasseMatiereProf extends Model
{
    use HasFactory;

    protected $table = 'classe_matiere_professeur';

    protected $fillable = ['classe_id', 'matiere_id', 'professeur_id', 'annee_scolaire', 'semestre', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function evaluationsEnseignement()
    {
        return $this->hasMany(EvaluationEnseignement::class, 'cmp_id');
    }

    public function getScoreMoyenAttribute(): float
    {
        $scores = $this->evaluationsEnseignement->pluck('score_total')->filter();
        return $scores->count() > 0 ? round($scores->avg(), 2) : 0;
    }
}
