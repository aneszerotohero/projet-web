<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AdminDashboardExportController extends Controller
{
    public function export(Request $request)
    {
        $filters = $request->only(['annee', 'specialite_id', 'option_id', 'search', 'semester']);
        $annee = $filters['annee'] ?? null;
        $specialite = $filters['specialite_id'] ?? null;
        $option = $filters['option_id'] ?? null;
        $search = $filters['search'] ?? null;
        $semestre = $request->get('semester');

        $query = Student::with(['option.specialite', 'user']);

        if ($option) {
            $query->where('option_id', $option);
        }
        if ($specialite) {
            $query->whereHas('option', function ($q) use ($specialite) {
                $q->where('specialite_id', $specialite);
            });
        }
        if ($annee) {
            $query->whereHas('option.specialite', function ($q) use ($annee) {
                $q->where('annee', $annee);
            });
        }
        if ($search) {
            $query->search($search);
        }

        $students = $query->get()->map(function ($s) use ($semestre) {
            $s->matricule = $s->user?->matricule ?? 'N/A';
            
            if ($semestre && $semestre !== 'cycle') {
                $sem = (int) $semestre;
                $s->moyenne_semestre = $s->moyenneParSemestre($sem);
                $s->moyenne_cycle = $s->moyenne_semestre;
            } else {
                $moyennes = [];
                for ($i = 1; $i <= 6; $i++) {
                    $moy = $s->moyenneParSemestre($i);
                    if ($moy > 0) {
                        $moyennes[] = $moy;
                    }
                }
                $s->moyenne_cycle = count($moyennes) > 0 ? array_sum($moyennes) / count($moyennes) : 0;
            }
            
            return $s;
        });

        $sortKey = ($semestre && $semestre !== 'cycle') ? 'moyenne_semestre' : 'moyenne_cycle';
        $students = $students->sortByDesc($sortKey)->values();

        // Generate CSV
        $filename = 'dashboard_export_' . date('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($students) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, ['Rank', 'Matricule', 'Nom', 'Prénom', 'Option', 'Moyenne Cycle', 'Status']);
            
            // Data
            foreach ($students as $index => $student) {
                $status = $student->moyenne_cycle >= 10 ? 'Passing' : 'Failing';
                fputcsv($file, [
                    $index + 1,
                    $student->matricule,
                    $student->nom,
                    $student->prenom,
                    $student->option?->libelle ?? 'N/A',
                    number_format($student->moyenne_cycle, 2),
                    $status
                ]);
            }
            
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
