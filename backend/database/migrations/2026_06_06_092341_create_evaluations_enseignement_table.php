<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('evaluations_enseignement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('cmp_id')->constrained('classe_matiere_professeur')->cascadeOnDelete();
            $table->enum('q1', ['A','B','C'])->nullable();
            $table->enum('q2', ['A','B','C'])->nullable();
            $table->enum('q3', ['A','B','C'])->nullable();
            $table->enum('q4', ['A','B','C'])->nullable();
            $table->enum('q5', ['A','B','C'])->nullable();
            $table->enum('q6', ['A','B','C'])->nullable();
            $table->enum('q7', ['A','B','C'])->nullable();
            $table->enum('q8', ['A','B','C'])->nullable();
            $table->enum('q9', ['A','B','C'])->nullable();
            $table->enum('q10', ['A','B','C'])->nullable();
            $table->text('commentaire')->nullable();
            $table->decimal('score_total', 5, 2)->nullable();
            $table->timestamps();
            $table->unique(['etudiant_id','cmp_id'], 'eval_ens_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('evaluations_enseignement');
    }
};
