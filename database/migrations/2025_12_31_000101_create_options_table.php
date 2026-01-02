<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('specialite_id')->constrained('specialite')->cascadeOnDelete();
            $table->string('libelle');
            $table->timestamps();
            $table->index('specialite_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('options');
    }
};
