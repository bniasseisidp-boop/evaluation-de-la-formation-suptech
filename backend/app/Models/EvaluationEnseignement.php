<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Matiere;

class EvaluationEnseignement extends Model
{
    use HasFactory;

    protected $table = 'evaluations_enseignement';

    protected $fillable = [
        'etudiant_id', 'cmp_id', 'matiere_id',
        'q1','q2','q3','q4','q5','q6','q7','q8','q9','q10',
        'commentaire', 'score_total',
    ];

    protected $casts = ['score_total' => 'float'];

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function cmp()
    {
        return $this->belongsTo(ClasseMatiereProf::class, 'cmp_id');
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class, 'matiere_id');
    }

    public static function scoreFromLetter(string $letter): float
    {
        return match($letter) {
            'A' => 50.0,
            'B' => 75.0,
            'C' => 100.0,
            default => 0,
        };
    }

    public function calculateScore(): float
    {
        $questions = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
        $total = 0;
        $count = 0;
        foreach ($questions as $q) {
            if ($this->$q) {
                $total += self::scoreFromLetter($this->$q);
                $count++;
            }
        }
        return $count > 0 ? round($total / $count, 2) : 0;
    }
}
