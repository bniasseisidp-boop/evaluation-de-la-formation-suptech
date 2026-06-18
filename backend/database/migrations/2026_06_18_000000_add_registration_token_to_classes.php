<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->string('registration_token', 40)->nullable()->unique()->after('is_active');
        });

        // Génère un token unique pour chaque classe existante
        DB::table('classes')->orderBy('id')->get()->each(function ($classe) {
            DB::table('classes')->where('id', $classe->id)->update([
                'registration_token' => Str::random(40),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('registration_token');
        });
    }
};
