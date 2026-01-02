<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coef extends Model
{
    use HasFactory;

    protected $table = 'coef';

    protected $fillable = [
        'libelle', 'coef',
    ];

    public function moduleCoefs()
    {
        return $this->hasMany(ModuleCoef::class, 'coef_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'coef_id');
    }
}
