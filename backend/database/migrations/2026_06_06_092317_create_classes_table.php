<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('filiere_id')->constrained('filieres')->cascadeOnDelete();
            $table->string('nom');
            $table->enum('niveau', ['BT1','BT2','BT3','L1','L2','L3','M1','M2','FC_L1','FC_L2','FC_L3']);
            $table->string('annee_scolaire')->default('2025-2026');
            $table->integer('effectif')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('classes');
    }
};
