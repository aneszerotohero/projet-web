<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleCoef extends Model
{
    use HasFactory;

    protected $table = 'module_coef';

    protected $fillable = [
        'module_id', 'coef_id', 'coef',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function coef()
    {
        return $this->belongsTo(Coef::class);
    }
}
