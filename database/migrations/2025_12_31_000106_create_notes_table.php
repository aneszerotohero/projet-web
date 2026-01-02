<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('coef_id')->constrained('coef')->cascadeOnDelete();
            $table->float('note');
            $table->timestamps();
            $table->index(['student_id','module_id','coef_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
