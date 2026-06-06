<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Professeur extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'prenom', 'email', 'specialite', 'grade', 'photo', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function getFullNameAttribute(): string
    {
        return $this->prenom . ' ' . $this->nom;
    }

    public function classeMatiereProfs()
    {
        return $this->hasMany(ClasseMatiereProf::class);
    }

    public function classes()
    {
        return $this->belongsToMany(Classe::class, 'classe_matiere_professeur')
            ->withPivot('matiere_id', 'semestre', 'annee_scolaire')
            ->withTimestamps()
            ->distinct();
    }

    public function matieres()
    {
        return $this->belongsToMany(Matiere::class, 'classe_matiere_professeur')
            ->withPivot('classe_id', 'semestre', 'annee_scolaire')
            ->withTimestamps();
    }
}
