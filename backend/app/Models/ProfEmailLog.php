<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfEmailLog extends Model
{
    protected $fillable = [
        'professeur_id', 'cmp_id', 'annee_scolaire',
        'nb_evaluations', 'score_moyen', 'sent_at',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function cmp()
    {
        return $this->belongsTo(ClasseMatiereProf::class, 'cmp_id');
    }
}
