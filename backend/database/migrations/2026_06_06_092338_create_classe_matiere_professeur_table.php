<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('classe_matiere_professeur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classe_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('matiere_id')->constrained('matieres')->cascadeOnDelete();
            $table->foreignId('professeur_id')->constrained('professeurs')->cascadeOnDelete();
            $table->string('annee_scolaire')->default('2025-2026');
            $table->enum('semestre', ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'])->default('S1');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['classe_id','matiere_id','professeur_id','annee_scolaire'], 'cmp_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('classe_matiere_professeur');
    }
};
