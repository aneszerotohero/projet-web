<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    use HasFactory;
    protected $fillable = [
        'matricule', 'role', 'password', 'student_id',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Relation avec l'élève (student).
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

}
