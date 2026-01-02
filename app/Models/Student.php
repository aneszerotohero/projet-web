<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'option_id', 'nom', 'prenom', 'date_naissance', 'adresse', 'cadet',
    ];

    public function option()
    {
        return $this->belongsTo(Option::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    public function moyennes()
    {
        return $this->hasMany(Moyenne::class);
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }

    /**
     * Calculer la moyenne pondérée pour un semestre donné.
     */
    public function moyenneParSemestre(int $semestre): float
    {
        $notes = $this->notes()->whereHas('module', function ($q) use ($semestre) {
            $q->where('semestre', $semestre);
        })->with('coef')->get();

        if ($notes->isEmpty()) {
            return 0.0;
        }

        $sum = 0.0;
        $weights = 0.0;

        foreach ($notes as $n) {
            $w = $n->coef?->coef ?? 1;
            $sum += ($n->note * $w);
            $weights += $w;
        }

        return $weights > 0 ? ($sum / $weights) : 0.0;
    }

    /**
     * Moyenne par module pour un semestre (collection module_id => moyenne)
     */
    public function moyennesParModule(int $semestre)
    {
        $modules = $this->notes()->whereHas('module', function ($q) use ($semestre) {
            $q->where('semestre', $semestre);
        })->with(['module','coef'])->get()->groupBy('module_id');

        return $modules->map(function ($notes, $moduleId) {
            $sum = 0.0;
            $weights = 0.0;
            foreach ($notes as $n) {
                $w = $n->coef?->coef ?? 1;
                $sum += ($n->note * $w);
                $weights += $w;
            }
            return $weights > 0 ? ($sum / $weights) : 0.0;
        });
    }

    /**
     * Scope pour recherche par nom, prenom ou matricule
     */
    public function scopeSearch($query, ?string $term)
    {
        if (! $term) return $query;

        $term = "%{$term}%";
        return $query->where(function ($q) use ($term) {
            $q->where('nom', 'like', $term)
              ->orWhere('prenom', 'like', $term)
              ->orWhereHas('user', function ($q2) use ($term) {
                  $q2->where('matricule', 'like', $term);
              });
        });
    }
}
