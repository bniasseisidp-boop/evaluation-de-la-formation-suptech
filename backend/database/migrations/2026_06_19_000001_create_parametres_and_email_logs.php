<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parametres', function (Blueprint $table) {
            $table->string('cle', 100)->primary();
            $table->text('valeur')->nullable();
            $table->timestamps();
        });

        Schema::create('prof_email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professeur_id')->constrained('professeurs')->cascadeOnDelete();
            $table->unsignedBigInteger('cmp_id');
            $table->string('annee_scolaire', 20)->default('2025-2026');
            $table->integer('nb_evaluations')->default(0);
            $table->decimal('score_moyen', 5, 2)->nullable();
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();

            $table->foreign('cmp_id')->references('id')->on('classe_matiere_professeur')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prof_email_logs');
        Schema::dropIfExists('parametres');
    }
};
