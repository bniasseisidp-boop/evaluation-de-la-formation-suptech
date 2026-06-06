<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'code', 'description', 'couleur', 'icone', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function classes()
    {
        return $this->hasMany(Classe::class);
    }

    public function etudiants()
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }
}
