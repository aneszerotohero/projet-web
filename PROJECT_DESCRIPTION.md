# 📚 Description du Projet : Gestion Académique Intégrée

## 🎯 Vue d'ensemble générale

**Nom du projet :** Plateforme de Gestion Académique Intégrée  
**Type :** Application Web Full-Stack (Laravel + React/Inertia)  
**Objectif principal :** Automatiser la gestion des notes, absences et moyennes académiques pour un établissement d'enseignement supérieur (école d'ingénieurs, classe prépa, etc.)

---

## 📖 Contexte & Justification

Cette application répond aux besoins d'une institution académique de gérer efficacement :
- **Les données étudiantes** : Profils complets, affiliations à options/spécialités
- **L'évaluation académique** : Notes par module, types d'évaluation (contrôle, examen, TD)
- **Le suivi des présences** : Enregistrement et justification des absences
- **Le calcul automatique** : Moyennes pondérées par semestre et classements
- **La consultation des résultats** : Accès sécurisé pour étudiants et administrateurs

### Acteurs principaux
1. **Administrateurs (Admin)** : Gestion complète (CRUD notes/absences, visualisation de tous les étudiants, génération de rapports)
2. **Étudiants (Élève)** : Consultation personnelle (notes, absences, classement, moyennes)
3. **Système** : Calcul automatique des moyennes après chaque modification de note

---

## 🏆 Objectifs fonctionnels

### 1. **Gestion des structures académiques**
- Créer et maintenir les **spécialités** (ex: "Informatique", "Génie Civil") avec année d'étude
- Organiser les **options** au sein d'une spécialité (ex: "Option Data Science", "Option Web")
- Définir les **modules** (matières) avec leur semestre d'appartenance (S1, S2, S3, etc.)
- Établir les **coefficients** de pondération pour les types d'évaluation (ex: Coef=2 pour Examen, Coef=1 pour TD)
- Créer les associations **module-coefficient** pour une pondération modulaire

### 2. **Gestion des données étudiantes**
- Enregistrer les **étudiants** avec informations personnelles (nom, prénom, date de naissance, adresse, statut cadet)
- Affecter les étudiants à une **option** (et indirectement une spécialité)
- Lier chaque étudiant à un compte **utilisateur** (compte de connexion) avec rôle `élève`

### 3. **Saisie et gestion des notes**
- **Saisie unitaire** : Ajouter une note pour un étudiant, un module, et un type d'évaluation
- **Saisie en masse** : Importer/créer plusieurs notes en une opération (ex: notes d'examen pour une classe)
- **Modification** : Corriger une note existante
- **Suppression** : Retirer une note (avec traçabilité optionnelle)

### 4. **Calcul automatique des moyennes**
- **Observer NoteObserver** : À chaque création/modification/suppression de note, recalculer automatiquement :
  - **Moyenne pondérée par semestre** = Σ(note_i × coef_i) / Σ(coef_i)
  - Stockage dans la table `moyennes` (student_id, semestre, moyenne)
- **Moyenne de cycle** (optionnel) = Moyenne(S1, S2) pour une année complète
- **Moyenne générale** (optionnel) = Moyenne de tous les semestres

### 5. **Gestion des absences**
- Enregistrement des **absences** (date, module, justification)
- Marquage des absences comme **justifiées/injustifiées**
- **Suppression logique** (SoftDelete) des absences avec motif de suppression
- Récupération des absences supprimées avec affichage du motif

### 6. **Calcul du classement automatique**
- **Classement par option** : Trier les étudiants d'une option par moyenne décroissante
- **Génération du podium** (Top 3) : 1ère place (🥇), 2ème place (🥈), 3ème place (🥉)
- **Actualisation** : Le classement se met à jour après chaque modification de moyenne
- **Filtres dynamiques** : Classement par année, spécialité, option, semestre

### 7. **Gestion du semestre académique**
- **Détection automatique** : Middleware `CurrentSemester` qui calcule le semestre courant en fonction de la date du calendrier
  - Sept-Déc → S1 | Janv-Juin → S2 | Juil-Août → S2 (fin d'année)
- **Support des cohorts** : Calcul du semestre absolu si année de début de cohorte connue
  - Ex: Cohorte 2024, année académique actuelle = 2025 → S3 (1ère semestre 2ème année)
- **Semestre dynamique** : Le middleware injecte `current_semestre` dans chaque requête

### 8. **Contrôle d'accès basé sur les rôles (RBAC)**
- **Admin** : Accès complet à toutes les ressources (admin.dashboard, CRUD)
- **Élève** : Accès limité à ses propres données (dashboard personnel, absences personnelles)
- **Middleware** : 
  - `AuthAdmin` : Restreint à `role='admin'`
  - `AuthEleve` : Restreint à `role='élève'`
  - `CurrentSemester` : Injecte le semestre actuel

### 9. **Recherche et filtrage**
- **Recherche d'étudiants** : Par nom, prénom ou matricule (scope `search`)
- **Filtrage avancé** :
  - Par année académique / spécialité / option
  - Par semestre / module
  - Par plage de notes (min-max)
  - Par statut de présence (absences)
- **Tri dynamique** : Par moyenne (ascendant/descendant), par nom, par matricule

### 10. **Génération de rapports**
- **Dashboard étudiant** : Tableau des notes par module, moyenne par semestre, rang dans l'option
- **Dashboard admin** : Liste complète avec filtres, podium, statistiques par option
- **Endpoint API** : `/api/admin/rankings` pour classement (JSON)

---

## 💼 Besoins non-fonctionnels

### Performance & Scalabilité
- **Pagination** : Max 50 étudiants par page en dashboard admin
- **Cache** : Mise en cache des classements (TTL 1 heure) pour ne pas recalculer à chaque requête
- **Indexation BD** : Index sur `student_id`, `module_id`, `semestre` dans `notes` et `moyennes`
- **Support** : Jusqu'à 1000 étudiants par option

### Sécurité & Conformité
- **Authentification** : Session Laravel (Sanctum pour API optionnel)
- **Autorisation** : Middleware role-based (`auth.admin`, `auth.eleve`)
- **Validation** : Côté serveur (Laravel Validation) et côté client (React)
- **Données sensibles** : Chiffrement de la date de naissance en BDD (optionnel, AES-256)
- **Audit** : Logs des modifications via timestamps et soft-deletes

### Qualité & Fiabilité
- **Tests** : PHPUnit pour NoteObserver, AbsenceController, endpoints API
- **Observer atomique** : Garantir que les moyennes sont toujours à jour après chaque opération
- **Gestion d'erreurs** : Try-catch pour observer, réponses HTTP standardisées (200, 422, 403, 404, 500)
- **Transactions BD** : Utiliser DB::transaction() pour les opérations bulk

### Accessibilité & UX
- **Responsive** : Support mobile (320px) / tablet (768px) / desktop (1440px)
- **Accessibilité WCAG 2.1** : Labels ARIA, contraste des couleurs
- **Animations** : Framer Motion pour transitions fluides (entrée/podium)
- **Feedback utilisateur** : Toasts, messages d'erreur, chargement

### Maintenabilité
- **Code** : Architecture MVC claire (Laravel) + composants réutilisables (React)
- **Documentation** : Inline comments, README, API documentation (OpenAPI)
- **Versioning** : Git avec branches (`main`, `develop`, `front`, `back`)
- **Dépendances** : Versions pinnées (composer.lock, package-lock.json)

---

## 📊 Données & Cas d'usage

### Exemple de flux : Ajout et recalcul de note

```
1. Admin ajoute note (Math, étudiant Ali, S1, note=15, coef_id=2)
   → POST /admin/notes (store, NoteController@storeSingle)
   
2. Note créée en BD
   → NoteObserver::created($note) déclenché
   
3. Observer recalcule moyenne S1 pour Ali
   → Moyenne = (15 × 2 + 12 × 1 + 14 × 1) / (2 + 1 + 1) = 13.25
   → Moyenne::updateOrCreate(['student_id'=>Ali, 'semestre'=>1], ['moyenne'=>13.25])
   
4. Admin consulte classement
   → GET /admin/dashboard (filtre option=Ali's option, semestre=1)
   → Tri par Moyenne.moyenne DESC
   → Ali passe de rang 5 à rang 3 (podium généré)
   
5. Étudiant Ali consulte son dashboard
   → GET /eleve/dashboard (middleware auth.eleve, current.semester)
   → Affichage : "Moyenne S1 : 13.25" (rang 3/45 étudiants)
```

### Cas d'usage : Gestion des absences

```
1. Professeur enregistre absence (Math, 2026-01-14, Ali, justifiée=false)
   → POST /admin/absences (store, AbsenceController@store)
   
2. Absence créée (soft-delete enabled)
   
3. Admin supprime l'absence (motif: "Erreur de saisie")
   → DELETE /admin/absences/{id} (destroy, AbsenceController@destroy)
   → Soft-delete : absence.deleted_at = NOW()
   → absence.motif_suppression = "Erreur de saisie"
   
4. Étudiant Ali consulte ses absences
   → GET /eleve/absences (withTrashed() dans query)
   → Affichage : Absence Math marquée comme "Supprimée (Erreur de saisie)"
```

---

## 🔄 Interactions entre systèmes

```
┌─────────────────┐
│   Étudiant      │ (accès limité)
└────────┬────────┘
         │ GET /eleve/dashboard
         │ GET /eleve/absences
         ↓
    [Auth Middleware]
    [CurrentSemester Middleware]
         ↓
    ┌──────────────────┐
    │  Contrôleur      │
    │  Étudiant        │
    └────────┬─────────┘
             ↓
        [Model Query]
        [Cache Layer]
             ↓
    ┌──────────────────┐
    │   Base de        │
    │   Données        │
    └────────┬─────────┘
             ↑
             │ (Calcul auto)
             │
    ┌─────────────────┐
    │  NoteObserver   │ (événement created/updated/deleted)
    │  (Middleware)   │ → Recalcul Moyenne
    └────────┬────────┘
             ↑
    ┌──────────────────────┐
    │   Admin              │ (accès complet)
    │   (POST/PUT/DELETE)  │
    └──────────────────────┘
```

---

## 📋 Résumé des fichiers clés

| Fichier | Rôle | Détails |
|---------|------|---------|
| `app/Models/Student.php` | Modèle étudiant | Relations + méthode `moyenneParSemestre()` |
| `app/Models/Note.php` | Modèle note | Lien student-module-coef |
| `app/Models/Moyenne.php` | Modèle moyenne | Calcul stocké (student_id, semestre, moyenne) |
| `app/Models/Absence.php` | Modèle absence | SoftDeletes, motif_suppression |
| `app/Observers/NoteObserver.php` | Observer | Recalcul auto après modif note |
| `app/Http/Middleware/CurrentSemester.php` | Middleware | Injection semestre actuel |
| `app/Http/Middleware/AuthAdmin.php` | Middleware | Restreint à admin |
| `app/Http/Middleware/AuthEleve.php` | Middleware | Restreint à élève |
| `app/Http/Controllers/StudentDashboardController.php` | Contrôleur | Dashboard étudiant (notes, moyennes, classement) |
| `app/Http/Controllers/AdminDashboardController.php` | Contrôleur | Dashboard admin (filtres, podium, pagination) |
| `app/Http/Controllers/NoteController.php` | Contrôleur | CRUD notes (déclench NoteObserver) |
| `app/Http/Controllers/AbsenceController.php` | Contrôleur | CRUD absences (avec SoftDeletes) |
| `database/migrations/` | Migrations | Tables specialite, options, students, modules, notes, moyennes, absences |

---

## 🚀 Prochaines étapes

1. ✅ Structures de base en place (modèles, migrations, observers)
2. ⏳ **À faire** : Tester observer NoteObserver avec PHPUnit
3. ⏳ **À faire** : Compléter endpoints API (filtrage avancé, recherche)
4. ⏳ **À faire** : Construire UI React complète (Dashboard + Tables + Modals)
5. ⏳ **À faire** : Cache Redis pour classements
6. ⏳ **À faire** : E2E tests (Cypress)

