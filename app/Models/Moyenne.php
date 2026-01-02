<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Moyenne extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'semestre', 'moyenne',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
