# Résumé des changements backend ✅

## Vue d'ensemble
Ce document résume toutes les modifications backend effectuées dans le projet (migrations, modèles, relations, observer, middleware, contrôleurs, routes et vues).

---

## Migrations ajoutées 🔧
- `2025_12_31_000100_create_specialites_table.php` (table `specialite`)  
- `2025_12_31_000101_create_options_table.php` (table `options`)  
- `2025_12_31_000102_create_students_table.php` (table `students`)  
- `2025_12_31_000103_create_modules_table.php` (table `modules`)  
- `2025_12_31_000104_create_coefs_table.php` (table `coef`)  
- `2025_12_31_000105_create_module_coef_table.php` (table `module_coef`)  
- `2025_12_31_000106_create_notes_table.php` (table `notes`)  
- `2025_12_31_000107_create_absences_table.php` (table `absence`, avec `softDeletes`)  
- `2025_12_31_000108_create_moyennes_table.php` (table `moyennes`)  
- `2025_12_31_000109_alter_users_add_student_matricule_role.php` (ajout `student_id`, `matricule`, `role` à `users`)

Notes :
- Toutes les FK sont créées avec `foreignId()->constrained()->cascadeOnDelete()`.
- Index et contrainte unique `specialite(libelle, annee)` ajoutés.

---

## Modèles Eloquent & relations 🧩
- `App\Models\Student`
  - `$fillable`: `option_id, nom, prenom, date_naissance, adresse, cadet`
  - Relations : `option()`, `notes()`, `absences()`, `moyennes()`, `user()`
  - Methods : `moyenneParSemestre($semestre)`, `moyennesParModule($semestre)`, `scopeSearch($term)`

- `App\Models\Option` : `specialite()`, `students()`
- `App\Models\Specialite` : table `specialite`, `options()`
- `App\Models\Module` : `moduleCoefs()`, `notes()`, `absences()`
- `App\Models\Coef` (`table: coef`) : `moduleCoefs()`, `notes()`
- `App\Models\ModuleCoef` (`table: module_coef`) : `module()`, `coef()`
- `App\Models\Note` : `student()`, `module()`, `coef()`
- `App\Models\Absence` (`table: absence`) (SoftDeletes) : `student()`, `module()`
- `App\Models\Moyenne` (`table: moyennes`) : `student()`
- `App\Models\User` : mise à jour `$fillable` (`student_id, matricule, role`) et `student()` relation

---

## Observer 🛠️
- `App\Observers\NoteObserver`
  - Événements surveillés : `created`, `updated`, `deleted` sur le modèle `Note`.
  - Action : recalcul automatique de la moyenne pondérée (`Moyenne::updateOrCreate`) par `student_id` et `semestre`.
  - Pondération utilisée : `coef.coef` (poids par type de note). Si le `coef` est absent, poids par défaut = 1.
- Enregistré dans `App\Providers\AppServiceProvider::boot()` : `Note::observe(NoteObserver::class)`

> Remarque : on peut adapter l'observer pour utiliser `module_coef` si la pondération dépend du module.

---

## Middleware 🔐
- `App\Http\Middleware\AuthAdmin` : restreint aux utilisateurs `role = 'admin'`.
- `App\Http\Middleware\AuthEleve` : restreint aux utilisateurs `role = 'eleve'`.
- `App\Http\Middleware\CurrentSemester` : injecte `current_semestre` dans la requête (heuristique : mois 9-12 => S1, 1-6 => S2; mois 7-8 traités comme fin de S2). Si une `cohort_start_year` est fournie via la requête ou la variable d'environnement `ACADEMIC_COHORT_START_YEAR`, le middleware calcule le semestre absolu (S1, S2, S3...). Par exemple, S3 correspond au premier semestre de la 2ème année.
- Aliases enregistrés dans `AppServiceProvider` : `auth.admin`, `auth.eleve`, `current.semester`

---

## Contrôleurs & Endpoints principaux 🚀
- `App\Http\Controllers\StudentDashboardController@index`
  - Récupère l'élève connecté, ses notes, moyennes et calculs de classement dans l'option.

- `App\Http\Controllers\AdminDashboardController@index`
  - Filtrage (année, spécialité, option), calcul S1/S2, `moyenne_cycle`, podium (top 3) et liste paginée.

- `App\Http\Controllers\NoteController`
  - `storeSingle`, `storeBulk`, `update`, `destroy` (utilise `updateOrCreate` et déclenche l'observer).

- `App\Http\Controllers\AbsenceController`
  - `index` (nouveau) : récupère toutes les absences d'un élève connecté `auth()->user()->student_id` avec relation `module`, triées par `date_absence` décroissante, inclut `withTrashed()` pour afficher les supprimées avec `motif_suppression`.
  - `store`, `update`, `destroy`, `filter` (filtrage par module/date)

- `App\Http\Controllers\Api\FilterController`
  - Endpoints JSON pour classement (`/api/admin/rankings`) et recherche d'élèves (`/api/students/search`) utilisés pour AJAX.

---

## Routes ajoutées 📍
- Web
  - `GET /eleve/dashboard` → `StudentDashboardController@index` (middleware `auth, auth.eleve, current.semester`)
  - `GET /eleve/absences` → `AbsenceController@index` (middleware `auth, auth.eleve`)
  - Admin routes pour gestion notes/absences (`/admin/*`), protégées par `auth.admin`

- API
  - `GET /api/admin/rankings` → `Api\FilterController@rankings` (middleware `auth.admin`)
  - `GET /api/students/search` → `Api\FilterController@searchStudents` (accessible par `auth`)

---

## Vues Blade ajoutées 🖼️
- `resources/views/eleve/absences/index.blade.php`
  - Liste des absences, badge pour supprimées et affichage `motif_suppression` si présent.

---

## Commandes utiles & test rapide ▶️
- Recharger autoload et exécuter migrations :
```bash
composer dump-autoload
php artisan migrate
```
- Tester observer (tinker) :
```bash
php artisan tinker
>>> $note = App\Models\Note::create([...]); # observer recalculera moyennes
>>> App\Models\Moyenne::where('student_id', ...)->get();
```
- Appeler l'endpoint Eleve (auth nécessaire) :
```bash
# via HTTP client / navigateur
GET https://your-app.local/eleve/absences
```

---

## Tests & Documentation 🔍
- Actions recommandées (non encore ajoutées) :
  - Écrire des tests PHPUnit pour : création de notes (observer), endpoint `/eleve/absences`, et middleware d'accès.
  - Ajouter des tests d'intégration API pour le filtrage/tri/pagination.

---

## Améliorations possibles / Points à valider ✨
- Utiliser `module_coef.coef` (si la pondération dépend du module) au lieu de `coef.coef` pour le calcul des moyennes.
- Ajouter pagination et cache pour résultats de classement.
- Ajouter validations supplémentaires côté fronts (AJAX) et gestion d'erreurs HTTP standardisées.

---

Si vous voulez, j'ajoute :
- des tests PHPUnit basiques pour `AbsenceController@index` et `NoteObserver` ✅
- ou une page d'administration plus complète (CRUD JS/AJAX) ✅

Indiquez ce que vous préférez comme prochaine étape.