<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'code', 'description', 'credits', 'semestre', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function classeMatiereProfs()
    {
        return $this->hasMany(ClasseMatiereProf::class);
    }

    public function classes()
    {
        return $this->belongsToMany(Classe::class, 'classe_matiere_professeur')
            ->withPivot('professeur_id', 'semestre', 'annee_scolaire')
            ->withTimestamps();
    }
}
