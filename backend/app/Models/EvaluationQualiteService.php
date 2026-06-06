<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationQualiteService extends Model
{
    use HasFactory;

    protected $table = 'evaluations_qualite_service';

    protected $fillable = [
        'etudiant_id', 'secretariat', 'direction', 'direction_etudes',
        'documentation', 'salle_pratique', 'connexion', 'securite',
        'toilettes', 'restaurant', 'cadre_general', 'recommande',
        'commentaire', 'annee_scolaire',
    ];

    protected $casts = ['recommande' => 'boolean'];

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public static function getScoreLabel(string $value): int
    {
        return match($value) {
            'tres_satisfait'  => 5,
            'satisfait'       => 4,
            'peu_satisfait'   => 3,
            'pas_satisfait'   => 2,
            'pas_du_tout'     => 1,
            default           => 0,
        };
    }
}
