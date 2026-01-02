<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->date('date_absence');
            $table->string('motif_absence');
            $table->string('motif_suppression')->nullable();
            $table->boolean('justifie')->default(false);
            $table->softDeletes();
            $table->timestamps();
            $table->index(['student_id','module_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absence');
    }
};
