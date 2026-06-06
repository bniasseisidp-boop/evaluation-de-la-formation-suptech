<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'filiere_id', 'classe_id', 'is_active', 'matricule',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function evaluationsEnseignement()
    {
        return $this->hasMany(EvaluationEnseignement::class, 'etudiant_id');
    }

    public function evaluationQualite()
    {
        return $this->hasOne(EvaluationQualiteService::class, 'etudiant_id');
    }

    public function evaluationsFormation()
    {
        return $this->hasMany(EvaluationFormation::class, 'etudiant_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }
}
