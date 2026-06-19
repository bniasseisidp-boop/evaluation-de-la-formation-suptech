<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    protected $primaryKey = 'cle';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = ['cle', 'valeur'];

    public static function get(string $cle, $default = null)
    {
        return static::find($cle)?->valeur ?? $default;
    }

    public static function set(string $cle, $valeur): void
    {
        static::updateOrCreate(['cle' => $cle], ['valeur' => $valeur]);
    }
}
