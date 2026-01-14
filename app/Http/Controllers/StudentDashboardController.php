<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Note;
use App\Models\Absence;
use App\Models\Coef;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentDashboardController extends Controller
{
    /**
     * Calcule le classement en traversant les relations du schéma
     */
    private function calculateRanking($student, $scope, $semestre)
    {
        // 1. Définir la requête de base pour récupérer les "pairs" (camarades)
        $query = Student::query();

        // 2. Filtrer selon le scope demandé en suivant ton schéma BDD
        switch ($scope) {
            case 'option':
                // Les étudiants de la même option
                $query->where('option_id', $student->option_id);
                break;

            case 'specialite':
                // Schema: students -> options -> specialite
                // On cherche les étudiants dont l'option appartient à la même spécialité
                $specialiteId = $student->option->specialite_id;
                $query->whereHas('option', function ($q) use ($specialiteId) {
                    $q->where('specialite_id', $specialiteId);
                });
                break;

            case 'annee':
                // Schema: students -> options -> specialite -> annee
                // On cherche les étudiants dont l'option->specialite a la même année
                $annee = $student->option->specialite->annee;
                $query->whereHas('option.specialite', function ($q) use ($annee) {
                    $q->where('annee', $annee);
                });
                break;
        }

        $peers = $query->get();

        if ($peers->isEmpty()) {
            return ['rank' => '-', 'total' => 0, 'top_score' => 0];
        }

        // 3. Calculer les moyennes de ce groupe
        // Note: Idéalement, la moyenne par semestre devrait être stockée dans la table 'moyennes'
        // pour éviter de recalculer à chaque fois, mais ici on recalcule pour être sûr.
        $scores = $peers->map(function ($peer) use ($semestre) {
            return [
                'id' => $peer->id,
                'moyenne' => $peer->moyenneParSemestre((int)$semestre)
            ];
        });

        // 4. Trier et trouver le rang
        $sorted = $scores->sortByDesc('moyenne')->values();

        $rankIndex = $sorted->search(function ($item) use ($student) {
            return $item['id'] == $student->id;
        });

        return [
            'rank' => $rankIndex !== false ? $rankIndex + 1 : '-',
            'total' => $sorted->count(),
            'top_score' => $sorted->first()['moyenne'] ?? 0
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->student_id) {
            return redirect()->route('login');
        }

        // Récupérer le semestre (par défaut 1)
        $sem = $request->get('semestre') ?? 1;

        // Charger l'étudiant avec le chemin complet vers l'année
        // Student -> Option -> Specialite
        $student = Student::with(['option.specialite', 'notes.module', 'notes.coef', 'absences'])
            ->find($user->student_id);

        if (!$student) {
            return abort(404, 'Dossier étudiant introuvable.');
        }

        // --- 1. CALCULS DES NOTES & MOYENNES ---

        // Calcul de la moyenne du semestre (Logique métier)
        $moyenneSem = $student->moyenneParSemestre((int) $sem);

        // Récupérer les notes du semestre actif
        // On filtre les notes dont le module appartient au semestre demandé
        $notes = $student->notes()
            ->whereHas('module', function ($q) use ($sem) {
                $q->where('semestre', $sem);
            })
            ->with(['module', 'coef'])
            ->get();

        // Grouper par module
        $moyennesParModule = $notes->groupBy('module_id')->map(function ($moduleNotes) {
            $module = $moduleNotes->first()->module;
            if (!$module) return null;

            // Récupérer les types de notes via la table 'coef'
            // Attention: Il faut que les libellés en base correspondent exactement ('DS', 'Exam', etc.)
            $dsNote = $moduleNotes->first(fn($n) => $n->coef && $n->coef->libelle === 'DS')?->note;
            $examNote = $moduleNotes->first(fn($n) => $n->coef && $n->coef->libelle === 'Exam')?->note;

            // Calcul moyenne pondérée du module
            $sum = 0.0;
            $weights = 0.0;

            foreach ($moduleNotes as $note) {
                // Le poids de la note vient de la table 'coef' (ex: Exam = coef 2)
                $w = $note->coef ? $note->coef->coef : 1;
                $sum += ($note->note * $w);
                $weights += $w;
            }

            $moyenneModule = $weights > 0 ? ($sum / $weights) : 0.0;

            return [
                'id' => $module->id,
                'module' => $module->libelle,
                'code' => substr($module->libelle, 0, 4),
                'coef' => $module->coef ?? 1, // Coef du module (table modules)
                'ds' => $dsNote,
                'exam' => $examNote,
                'moyenne' => round($moyenneModule, 2),
            ];
        })->filter()->values();

        // --- 2. STATS & ABSENCES ---

        // Calcul simple moyenne générale (tous semestres confondus)
        // Pour être précis, il faudrait parcourir tous les semestres possibles
        $moyenneGenerale = ($moyenneSem > 0) ? $moyenneSem : 0;

        $absences = $student->absences;
        $absencesStats = [
            'total' => $absences->count(),
            'justified' => $absences->where('justifie', 1)->count(),
            'unjustified' => $absences->where('justifie', 0)->count(),
        ];

        // --- 3. GRAPHIQUE (MOI vs PROMO) ---

        // Pour le graphe, on compare avec les gens de la même OPTION (ta classe directe)
        $optionId = $student->option_id;
        $classAverages = [];

        foreach ($moyennesParModule as $mod) {
            // Moyenne de ce module pour tous les élèves de l'option
            $avg = Note::where('module_id', $mod['id'])
                ->whereHas('student', fn($q) => $q->where('option_id', $optionId))
                ->avg('note');

            $classAverages[] = round($avg ?? 0, 2);
        }

        $chartData = [
            'labels' => $moyennesParModule->pluck('code')->toArray(),
            'student' => $moyennesParModule->pluck('moyenne')->toArray(),
            'class_avg' => $classAverages,
        ];

        // --- 4. CLASSEMENTS (CORRIGÉ SELON SCHEMA) ---

        // Récupération sécurisée de l'année (Student -> Option -> Specialite -> annee)
        $anneeScolaire = $student->option->specialite->annee ?? 'N/A';

        $rankings = [
            'option' => $this->calculateRanking($student, 'option', $sem),
            'specialite' => $this->calculateRanking($student, 'specialite', $sem),
            'annee' => $this->calculateRanking($student, 'annee', $sem),
        ];

        return Inertia::render('Student/Dashboard', [
            'student' => $student,
            'semestre' => (int) $sem,
            'annee' => (string) $anneeScolaire,
            'moyenne_semestre' => round($moyenneSem, 2),
            'moyenne_generale' => round($moyenneGenerale, 2),
            'progression_semestre' => 0,
            'progression_generale' => 0,
            'moyennes_par_module' => $moyennesParModule,
            'absences_stats' => $absencesStats,
            'chart_data' => $chartData,
            'rankings' => $rankings,
        ]);
    }

    public function notes(Request $request)
    {
        $user = $request->user();
        $notes = Note::where('student_id', $user->student_id)
            ->with(['module', 'coef'])
            ->latest()
            ->get();

        return Inertia::render('Student/Notes', ['notes' => $notes]);
    }

    public function absences(Request $request)
    {
        $user = $request->user();
        $absences = Absence::where('student_id', $user->student_id)
            ->with('module')
            ->orderBy('date_absence', 'desc')
            ->get();

        return Inertia::render('Student/Absences', ['absences' => $absences]);
    }

    public function requestCorrection()
    {
        return to_route('eleve.notes')->with('success', 'Demande envoyée');
    }

    public function requestJustification()
    {
        return to_route('eleve.absences')->with('success', 'Justificatif envoyé');
    }
}
