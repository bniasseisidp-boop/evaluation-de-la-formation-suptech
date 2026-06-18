<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    use HasFactory;

    protected $fillable = ['filiere_id', 'nom', 'niveau', 'annee_scolaire', 'effectif', 'is_active', 'registration_token'];

    protected $casts = ['is_active' => 'boolean'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function etudiants()
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }

    public function classeMatiereProfs()
    {
        return $this->hasMany(ClasseMatiereProf::class);
    }

    public function matieres()
    {
        return $this->belongsToMany(Matiere::class, 'classe_matiere_professeur')
            ->withPivot('professeur_id', 'semestre', 'annee_scolaire')
            ->withTimestamps();
    }

    public function professeurs()
    {
        return $this->belongsToMany(Professeur::class, 'classe_matiere_professeur')
            ->withPivot('matiere_id', 'semestre', 'annee_scolaire')
            ->withTimestamps();
    }
}
