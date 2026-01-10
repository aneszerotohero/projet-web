<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminStudentTranscriptExportController extends Controller
{
    public function export(Request $request, $studentId)
    {
        $student = Student::with(['option.specialite', 'user', 'notes.module', 'notes.coef', 'moyennes'])
            ->findOrFail($studentId);

        $semester = $request->get('semester');

        // Get notes filtered by semester if provided
        $notes = $student->notes()->with(['module', 'coef']);
        if ($semester && $semester !== 'all') {
            $notes->whereHas('module', function ($q) use ($semester) {
                $q->where('semestre', $semester);
            });
        }
        $notes = $notes->orderBy('module_id')->orderBy('created_at', 'desc')->get();

        // Get averages by semester
        $moyennes = [];
        for ($i = 1; $i <= 6; $i++) {
            $moy = $student->moyenneParSemestre($i);
            if ($moy > 0) {
                $moyennes[$i] = $moy;
            }
        }

        // Generate PDF using DomPDF
        $pdf = Pdf::loadView('pdf.student-transcript', [
            'student' => $student,
            'notes' => $notes,
            'moyennes' => $moyennes,
            'selected_semester' => $semester,
        ]);
        
        // Set PDF options
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOption('enable-local-file-access', true);
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('defaultFont', 'DejaVu Sans');
        
        $filename = 'releve_notes_' . ($student->user?->matricule ?? $student->id) . '_' . date('Y-m-d') . '.pdf';
        return $pdf->download($filename);
    }
}
