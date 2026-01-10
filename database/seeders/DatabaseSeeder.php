<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Specialite;
use App\Models\Option;
use App\Models\Student;
use App\Models\Module;
use App\Models\Coef;
use App\Models\ModuleCoef;
use App\Models\Note;
use App\Models\Absence;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Début du seeding de la base de données...');

        // 1. Créer les spécialités
        $this->command->info('📚 Création des spécialités...');
        $specialites = $this->createSpecialites();
        
        // 2. Créer les options
        $this->command->info('🎯 Création des options...');
        $options = $this->createOptions($specialites);
        
        // 3. Créer les coefficients
        $this->command->info('⚖️ Création des coefficients...');
        $coefs = $this->createCoefs();
        
        // 4. Créer les modules
        $this->command->info('📖 Création des modules...');
        $modules = $this->createModules();
        
        // 5. Créer les associations Module-Coef
        $this->command->info('🔗 Création des associations Module-Coef...');
        $this->createModuleCoefs($modules, $coefs);
        
        // 6. Créer les étudiants
        $this->command->info('👥 Création des étudiants...');
        $students = $this->createStudents($options);
        
        // 7. Créer les utilisateurs (élèves + admin)
        $this->command->info('👤 Création des utilisateurs...');
        $this->createUsers($students);
        
        // 8. Créer les notes
        $this->command->info('📝 Création des notes...');
        $this->createNotes($students, $modules, $coefs);
        
        // 9. Créer les absences
        $this->command->info('🚫 Création des absences...');
        $this->createAbsences($students, $modules);
        
        $this->command->info('✅ Seeding terminé avec succès!');
        $this->command->info('👤 Connexion admin: matricule=ADMIN001, password=password');
        $this->command->info('👤 Connexion élève: matricule=STU001, password=password (et autres STU002, STU003...)');
    }

    /**
     * Créer les spécialités.
     * Chaque spécialité a exactement 3 années (annee = 1, 2, 3)
     */
    private function createSpecialites(): array
    {
        $specialitesLibelles = ['Informatique', 'Électronique', 'Mécanique'];
        $specialites = [];

        foreach ($specialitesLibelles as $libelle) {
            // Créer les 3 années pour chaque spécialité
            for ($annee = 1; $annee <= 3; $annee++) {
                $specialites[] = Specialite::create([
                    'libelle' => $libelle,
                    'annee' => $annee,
                ]);
            }
        }

        return $specialites;
    }

    /**
     * Créer les options.
     * Chaque option correspond à (spécialité + année)
     */
    private function createOptions(array $specialites): array
    {
        $optionsConfig = [
            'Informatique' => ['Génie Logiciel', 'Réseaux et Télécommunications'],
            'Électronique' => ['Électronique Analogique', 'Électronique Numérique'],
            'Mécanique' => ['Conception Mécanique'],
        ];

        $options = [];
        
        foreach ($specialites as $specialite) {
            $libelles = $optionsConfig[$specialite->libelle] ?? [];
            
            foreach ($libelles as $libelle) {
                $options[] = Option::create([
                    'specialite_id' => $specialite->id,
                    'libelle' => $libelle,
                ]);
            }
        }

        return $options;
    }

    /**
     * Créer les coefficients.
     */
    private function createCoefs(): array
    {
        $coefsData = [
            ['libelle' => 'DS', 'coef' => 2.0],
            ['libelle' => 'TP', 'coef' => 1.0],
            ['libelle' => 'Exam', 'coef' => 3.0],
            ['libelle' => 'Contrôle Continu', 'coef' => 1.5],
            ['libelle' => 'Projet', 'coef' => 2.5],
        ];

        $coefs = [];
        foreach ($coefsData as $data) {
            $coefs[] = Coef::create($data);
        }

        return $coefs;
    }

    /**
     * Créer les modules.
     * Modules pour S1-S6 selon la logique métier :
     * S1 = 1ère année - 1er semestre
     * S2 = 1ère année - 2e semestre
     * S3 = 2e année - 1er semestre
     * S4 = 2e année - 2e semestre
     * S5 = 3e année - 1er semestre
     * S6 = 3e année - 2e semestre
     */
    private function createModules(): array
    {
        $modulesData = [
            // S1 - 1ère année - 1er semestre
            ['libelle' => 'Mathématiques I', 'semestre' => 1],
            ['libelle' => 'Physique I', 'semestre' => 1],
            ['libelle' => 'Algorithmique', 'semestre' => 1],
            ['libelle' => 'Base de données I', 'semestre' => 1],
            ['libelle' => 'Programmation I', 'semestre' => 1],
            ['libelle' => 'Anglais I', 'semestre' => 1],
            ['libelle' => 'Économie', 'semestre' => 1],
            
            // S2 - 1ère année - 2e semestre
            ['libelle' => 'Réseaux I', 'semestre' => 2],
            ['libelle' => 'Systèmes d\'exploitation I', 'semestre' => 2],
            ['libelle' => 'Gestion de projet I', 'semestre' => 2],
            ['libelle' => 'Statistiques I', 'semestre' => 2],
            ['libelle' => 'Mathématiques II', 'semestre' => 2],
            ['libelle' => 'Communication', 'semestre' => 2],
            
            // S3 - 2e année - 1er semestre
            ['libelle' => 'Mathématiques III', 'semestre' => 3],
            ['libelle' => 'Base de données avancées', 'semestre' => 3],
            ['libelle' => 'Programmation avancée', 'semestre' => 3],
            ['libelle' => 'Architecture des systèmes', 'semestre' => 3],
            ['libelle' => 'Anglais II', 'semestre' => 3],
            ['libelle' => 'Gestion d\'entreprise', 'semestre' => 3],
            
            // S4 - 2e année - 2e semestre
            ['libelle' => 'Réseaux avancés', 'semestre' => 4],
            ['libelle' => 'Systèmes d\'exploitation avancés', 'semestre' => 4],
            ['libelle' => 'Sécurité informatique', 'semestre' => 4],
            ['libelle' => 'Statistiques II', 'semestre' => 4],
            ['libelle' => 'Intelligence artificielle', 'semestre' => 4],
            ['libelle' => 'Droit informatique', 'semestre' => 4],
            
            // S5 - 3e année - 1er semestre
            ['libelle' => 'Projet de fin d\'études I', 'semestre' => 5],
            ['libelle' => 'Architecture logicielle', 'semestre' => 5],
            ['libelle' => 'Cloud Computing', 'semestre' => 5],
            ['libelle' => 'Big Data', 'semestre' => 5],
            ['libelle' => 'Management de projet', 'semestre' => 5],
            ['libelle' => 'Anglais technique', 'semestre' => 5],
            
            // S6 - 3e année - 2e semestre
            ['libelle' => 'Projet de fin d\'études II', 'semestre' => 6],
            ['libelle' => 'Stage en entreprise', 'semestre' => 6],
            ['libelle' => 'Innovation et entrepreneuriat', 'semestre' => 6],
            ['libelle' => 'Éthique professionnelle', 'semestre' => 6],
        ];

        $modules = [];
        foreach ($modulesData as $data) {
            $modules[] = Module::create([
                'libelle' => $data['libelle'],
                'semestre' => $data['semestre'],
            ]);
        }

        return $modules;
    }

    /**
     * Créer les associations Module-Coef.
     */
    private function createModuleCoefs(array $modules, array $coefs): void
    {
        $dsCoef = collect($coefs)->firstWhere('libelle', 'DS');
        $tpCoef = collect($coefs)->firstWhere('libelle', 'TP');
        $examCoef = collect($coefs)->firstWhere('libelle', 'Exam');
        $ccCoef = collect($coefs)->firstWhere('libelle', 'Contrôle Continu');
        $projetCoef = collect($coefs)->firstWhere('libelle', 'Projet');

        foreach ($modules as $module) {
            // Chaque module a généralement DS, TP et Exam
            if ($dsCoef) {
                ModuleCoef::create([
                    'module_id' => $module->id,
                    'coef_id' => $dsCoef->id,
                ]);
            }

            // Pour les modules techniques, ajouter TP
            if ($tpCoef && in_array($module->libelle, ['Programmation', 'Base de données', 'Réseaux', 'Systèmes d\'exploitation'])) {
                ModuleCoef::create([
                    'module_id' => $module->id,
                    'coef_id' => $tpCoef->id,
                ]);
            }

            // Tous les modules ont un examen
            if ($examCoef) {
                ModuleCoef::create([
                    'module_id' => $module->id,
                    'coef_id' => $examCoef->id,
                ]);
            }

            // Certains modules ont du contrôle continu
            if ($ccCoef && in_array($module->libelle, ['Anglais', 'Communication', 'Économie'])) {
                ModuleCoef::create([
                    'module_id' => $module->id,
                    'coef_id' => $ccCoef->id,
                ]);
            }

            // Certains modules ont un projet
            if ($projetCoef && in_array($module->libelle, ['Gestion de projet', 'Programmation'])) {
                ModuleCoef::create([
                    'module_id' => $module->id,
                    'coef_id' => $projetCoef->id,
                ]);
            }
        }
    }

    /**
     * Créer les étudiants.
     */
    private function createStudents(array $options): array
    {
        $students = [];

        // Créer environ 5-6 étudiants par option
        foreach ($options as $option) {
            for ($i = 0; $i < 6; $i++) {
                $students[] = Student::create([
                    'option_id' => $option->id,
                    'nom' => fake()->lastName(),
                    'prenom' => fake()->firstName(),
                    'date_naissance' => fake()->dateTimeBetween('-25 years', '-18 years'),
                    'adresse' => fake()->address(),
                    'cadet' => fake()->boolean(20), // 20% sont cadets
                ]);
            }
        }

        return $students;
    }

    /**
     * Créer les utilisateurs.
     */
    private function createUsers(array $students): void
    {
        // Créer un admin
        User::create([
            'matricule' => 'ADMIN001',
            'role' => 'admin',
            'password' => Hash::make('password'),
            'student_id' => null,
        ]);

        // Créer un utilisateur pour chaque étudiant
        $counter = 1;
        foreach ($students as $student) {
            User::create([
                'matricule' => 'STU' . str_pad($counter, 3, '0', STR_PAD_LEFT),
                'role' => 'eleve',
                'password' => Hash::make('password'),
                'student_id' => $student->id,
            ]);
            $counter++;
        }
    }

    /**
     * Créer les notes.
     */
    private function createNotes(array $students, array $modules, array $coefs): void
    {
        $dsCoef = collect($coefs)->firstWhere('libelle', 'DS');
        $tpCoef = collect($coefs)->firstWhere('libelle', 'TP');
        $examCoef = collect($coefs)->firstWhere('libelle', 'Exam');
        $ccCoef = collect($coefs)->firstWhere('libelle', 'Contrôle Continu');
        $projetCoef = collect($coefs)->firstWhere('libelle', 'Projet');

        foreach ($students as $student) {
            foreach ($modules as $module) {
                // Créer une note DS pour chaque module
                if ($dsCoef) {
                    Note::create([
                        'student_id' => $student->id,
                        'module_id' => $module->id,
                        'coef_id' => $dsCoef->id,
                        'note' => fake()->randomFloat(2, 8, 18),
                    ]);
                }

                $moduleLibelle = $module->libelle;
                
                // Créer une note TP pour les modules techniques
                $isTechnical = str_contains($moduleLibelle, 'Programmation') || 
                              str_contains($moduleLibelle, 'Base de données') || 
                              str_contains($moduleLibelle, 'Réseaux') || 
                              str_contains($moduleLibelle, 'Systèmes') ||
                              str_contains($moduleLibelle, 'Cloud') ||
                              str_contains($moduleLibelle, 'Big Data');
                if ($tpCoef && $isTechnical) {
                    Note::create([
                        'student_id' => $student->id,
                        'module_id' => $module->id,
                        'coef_id' => $tpCoef->id,
                        'note' => fake()->randomFloat(2, 10, 20),
                    ]);
                }

                // Créer une note Exam pour chaque module
                if ($examCoef) {
                    Note::create([
                        'student_id' => $student->id,
                        'module_id' => $module->id,
                        'coef_id' => $examCoef->id,
                        'note' => fake()->randomFloat(2, 8, 18),
                    ]);
                }

                // Créer une note Contrôle Continu pour certains modules
                $isLanguage = str_contains($moduleLibelle, 'Anglais') || 
                             str_contains($moduleLibelle, 'Communication') || 
                             str_contains($moduleLibelle, 'Économie');
                if ($ccCoef && $isLanguage) {
                    Note::create([
                        'student_id' => $student->id,
                        'module_id' => $module->id,
                        'coef_id' => $ccCoef->id,
                        'note' => fake()->randomFloat(2, 12, 20),
                    ]);
                }

                // Créer une note Projet pour certains modules
                $isProject = str_contains($moduleLibelle, 'Projet') || 
                            str_contains($moduleLibelle, 'Stage') ||
                            str_contains($moduleLibelle, 'Gestion de projet');
                if ($projetCoef && $isProject) {
                    Note::create([
                        'student_id' => $student->id,
                        'module_id' => $module->id,
                        'coef_id' => $projetCoef->id,
                        'note' => fake()->randomFloat(2, 10, 20),
                    ]);
                }
            }
        }
    }

    /**
     * Créer les absences.
     */
    private function createAbsences(array $students, array $modules): void
    {
        $motifsJustifies = [
            'Maladie',
            'Rendez-vous médical',
            'Urgence familiale',
            'Décès dans la famille',
        ];

        $motifsNonJustifies = [
            'Absence non justifiée',
            'Problème de transport',
        ];

        // Créer quelques absences pour environ 30% des étudiants
        $studentsWithAbsences = collect($students)->random((int) (count($students) * 0.3));

        foreach ($studentsWithAbsences as $student) {
            // Chaque étudiant avec absences a 1-5 absences
            $nbAbsences = fake()->numberBetween(1, 5);
            $studentModules = collect($modules)->random($nbAbsences);

            foreach ($studentModules as $module) {
                $isJustified = fake()->boolean(70); // 70% justifiées
                
                Absence::create([
                    'student_id' => $student->id,
                    'module_id' => $module->id,
                    'date_absence' => fake()->dateTimeBetween('-6 months', 'now'),
                    'motif_absence' => $isJustified 
                        ? fake()->randomElement($motifsJustifies)
                        : fake()->randomElement($motifsNonJustifies),
                    'justifie' => $isJustified,
                ]);
            }
        }
    }
}
