<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('evaluations_formation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['simple','detaillee'])->default('simple');
            $table->integer('score_motivation')->nullable();
            $table->integer('score_objectifs')->nullable();
            $table->integer('score_contenu')->nullable();
            $table->integer('score_techniques')->nullable();
            $table->integer('score_exercices')->nullable();
            $table->integer('score_formateur_comm')->nullable();
            $table->integer('score_formateur_rythme')->nullable();
            $table->integer('score_connaissance')->nullable();
            $table->integer('score_application')->nullable();
            $table->integer('score_recommandation')->nullable();
            $table->json('objectifs_session')->nullable();
            $table->text('pedagogie')->nullable();
            $table->text('formateurs_avis')->nullable();
            $table->text('moyens_environnement')->nullable();
            $table->text('logistique')->nullable();
            $table->text('benefices')->nullable();
            $table->text('commentaires_suggestions')->nullable();
            $table->boolean('formation_repondu_attentes')->nullable();
            $table->text('competences_pratique')->nullable();
            $table->boolean('emploi_trouve')->nullable();
            $table->text('nature_emploi')->nullable();
            $table->string('annee_scolaire')->default('2025-2026');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('evaluations_formation');
    }
};
