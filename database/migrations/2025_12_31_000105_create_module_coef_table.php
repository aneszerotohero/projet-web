<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_coef', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('coef_id')->constrained('coef')->cascadeOnDelete();
            $table->timestamps();
            $table->index(['module_id','coef_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_coef');
    }
};
