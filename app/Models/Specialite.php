<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialite extends Model
{
    use HasFactory;

    protected $table = 'specialite';

    protected $fillable = [
        'libelle', 'annee',
    ];

    public function options()
    {
        return $this->hasMany(Option::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }
}
