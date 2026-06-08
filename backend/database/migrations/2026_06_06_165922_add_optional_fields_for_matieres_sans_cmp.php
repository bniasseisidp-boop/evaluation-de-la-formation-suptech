<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // cmp_id devient nullable → permet d'évaluer une matière sans CMP configuré
        DB::statement('ALTER TABLE evaluations_enseignement MODIFY cmp_id BIGINT UNSIGNED NULL');

        // Ajouter matiere_id pour évaluation directe sans CMP
        try {
            DB::statement('ALTER TABLE evaluations_enseignement ADD COLUMN matiere_id BIGINT UNSIGNED NULL AFTER cmp_id');
        } catch (\Exception $e) {
            // Colonne déjà existante
        }

        // professeur_id devient nullable dans CMP
        DB::statement('ALTER TABLE classe_matiere_professeur MODIFY professeur_id BIGINT UNSIGNED NULL');
    }

    public function down()
    {
        DB::statement('ALTER TABLE evaluations_enseignement MODIFY cmp_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE classe_matiere_professeur MODIFY professeur_id BIGINT UNSIGNED NOT NULL');
    }
};
