<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CurrentSemester
{
    public function handle(Request $request, Closure $next)
    {
        // Academic year starting in September:
        // months 9-12 => semestre 1 (S1), months 1-6 => semestre 2 (S2)
        // months 7-8 (summer) are treated as S2 (end of academic year)
        $month = now()->month;

        if ($month >= 9 && $month <= 12) {
            $semInYear = 1;
            $academicYearStart = now()->year; // academic year starts this calendar year
        } elseif ($month >= 1 && $month <= 6) {
            $semInYear = 2;
            $academicYearStart = now()->year - 1; // academic year started last calendar year
        } else {
            // July-August -> treat as end of S2 of the academic year
            $semInYear = 2;
            $academicYearStart = now()->year - 1;
        }

        // If a cohort start year is provided (via request or env), compute absolute semester number:
        // e.g. cohort_start_year = 2024 and current academic year start = 2025 -> academic year number = 2
        // absolute semester = (academicYearNumber - 1) * 2 + semInYear
        $cohortStart = $request->get('cohort_start_year') ?? env('ACADEMIC_COHORT_START_YEAR');

        if ($cohortStart) {
            $academicYearNumber = ($academicYearStart - (int) $cohortStart) + 1;
            if ($academicYearNumber < 1) {
                $academicYearNumber = 1; // clamp to 1 as fallback
            }
            $absoluteSem = (($academicYearNumber - 1) * 2) + $semInYear;
            $request->attributes->set('current_semestre', $absoluteSem);
            $request->attributes->set('current_semestre_label', 'S' . $absoluteSem);
        } else {
            // Without cohort start, expose semester within current academic year (1 or 2)
            $request->attributes->set('current_semestre', $semInYear);
            $request->attributes->set('current_semestre_label', 'S' . $semInYear);
        }

        return $next($request);
    }
}
