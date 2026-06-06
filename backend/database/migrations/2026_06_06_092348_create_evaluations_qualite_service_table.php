<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('evaluations_qualite_service', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->cascadeOnDelete();
            $table->enum('secretariat', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('direction', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('direction_etudes', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('documentation', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('salle_pratique', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('connexion', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('securite', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('toilettes', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('restaurant', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->enum('cadre_general', ['tres_satisfait','satisfait','peu_satisfait','pas_satisfait','pas_du_tout'])->nullable();
            $table->boolean('recommande')->nullable();
            $table->text('commentaire')->nullable();
            $table->string('annee_scolaire')->default('2025-2026');
            $table->timestamps();
            $table->unique(['etudiant_id','annee_scolaire'], 'eval_qualite_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('evaluations_qualite_service');
    }
};
