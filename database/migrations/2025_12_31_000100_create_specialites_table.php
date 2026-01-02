<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specialite', function (Blueprint $table) {
            $table->id();
            $table->string('libelle');
            $table->integer('annee');
            $table->timestamps();
            $table->unique(['libelle','annee']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('specialite');
    }
};
