<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    use HasFactory;

    protected $fillable = [
        'specialite_id', 'libelle',
    ];

    public function specialite()
    {
        return $this->belongsTo(Specialite::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
