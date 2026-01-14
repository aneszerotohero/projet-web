# 📋 Cahier des charges : Besoins fonctionnels & Non-fonctionnels

## 📌 Partie 1 : Besoins Fonctionnels (BF)

### **BF 1 : Authentification et Gestion des Rôles**

#### BF 1.1 - Connexion Utilisateur
- **Acteur** : Tout utilisateur (admin ou élève)
- **Préalable** : Utilisateur enregistré dans la base de données
- **Actions** :
  1. Entrer email et mot de passe
  2. Système valide les credentials
  3. Session créée, utilisateur redirigé selon son rôle
     - Admin → `/admin/dashboard`
     - Élève → `/eleve/dashboard`
- **Sortie** : Token de session, rôle de l'utilisateur injecté
- **Erreur** : Message "Identifiants invalides"

#### BF 1.2 - Contrôle d'accès par Rôle
- **Middleware** : `AuthAdmin`, `AuthEleve`
- **Règles** :
  - Admin peut accéder à `/admin/*`
  - Élève peut accéder à `/eleve/*`
  - Non-authentifié redirigé vers `/login`
  - Rôle incorrect → Erreur 403 "Unauthorized"
- **Détails** : Injection du rôle dans `User::$role` (enum: 'admin', 'eleve')

#### BF 1.3 - Déconnexion
- Suppression de la session
- Redirection vers page login

---

### **BF 2 : Gestion des Structures Académiques**

#### BF 2.1 - Gestion des Spécialités
- **Admin uniquement**
- **CRUD** :
  - **Créer** : libellé (ex: "Informatique"), année (ex: 2024)
    - Contrainte unique : (libelle, annee)
  - **Lire** : Liste des spécialités, filtrable par année
  - **Modifier** : Changer libellé/année
  - **Supprimer** : Suppression en cascade (options, modules liés)
- **Validation** : libellé non vide, année ≥ 2000

#### BF 2.2 - Gestion des Options
- **Admin uniquement**
- **Lien** : Option appartient à une Spécialité
- **CRUD** :
  - Créer : libellé (ex: "Data Science"), spécialité_id
  - Lire : Lister par spécialité ou tous
  - Modifier : libellé, spécialité_id
  - Supprimer : Cascade sur students
- **Validation** : libellé non vide, spécialité_id existe

#### BF 2.3 - Gestion des Modules
- **Admin uniquement**
- **Attributs** : libellé, semestre (S1=1, S2=2, etc.)
- **CRUD** :
  - Créer module pour un semestre donné
  - Lire : Lister par semestre ou tous
  - Modifier : libellé, semestre
  - Supprimer : Cascade sur notes/absences
- **Validation** : libellé non vide, semestre ≥ 1

#### BF 2.4 - Gestion des Coefficients
- **Admin uniquement**
- **Types** : Coef=1 (TD), Coef=1.5 (TP), Coef=2 (Examen), Coef=3 (Examen final)
- **CRUD** :
  - Créer : libellé (ex: "Examen"), valeur coef
  - Lire : Lister tous
  - Modifier : libellé, valeur
  - Supprimer : Cascade
- **Validation** : coef > 0, libellé unique

#### BF 2.5 - Association Module-Coefficient (ModuleCoef)
- **Admin uniquement**
- **Objectif** : Un module peut avoir plusieurs types d'évaluation (ex: Math a Examen et TD)
- **CRUD** :
  - Créer : module_id, coef_id, optionnel: ordre d'affichage
  - Lire : Afficher tous les coefs pour un module
  - Modifier/Supprimer : maj table pivot
- **Validation** : module_id et coef_id existent, pas de doublon

---

### **BF 3 : Gestion des Étudiants**

#### BF 3.1 - Création d'Étudiant
- **Admin uniquement**
- **Données** :
  - Nom, Prénom, Date de naissance, Adresse
  - Option (liste déroulante)
  - Statut cadet (booléen)
  - Email (pour création de compte User)
- **Validation** :
  - Nom/Prénom non vides
  - Date naissance valide (< aujourd'hui, > 1950)
  - Option existe
  - Email unique
- **Output** : Étudiant créé, User lié avec rôle='eleve', matricule généré

#### BF 3.2 - Liste des Étudiants
- **Admin et Élève (sa propre fiche)**
- **Admin voit** :
  - Tous les étudiants de toutes les options
  - Filtres : spécialité, option, année, année naissance
  - Colonnes : Matricule, Nom, Prénom, Option, Moyennes S1/S2, Rang
  - Recherche : Nom, Prénom, Matricule (scope `search`)
  - Pagination : 50 par page
  - Sort : Moyenne (desc), Nom (asc), Rang (asc)

#### BF 3.3 - Détail Étudiant
- **Admin et l'étudiant lui-même**
- **Affichage** :
  - Infos perso (nom, prenom, date naiss, adresse, statut cadet)
  - Option, Spécialité
  - Notes par semestre (tableau)
  - Moyennes par semestre
  - Rang dans l'option (par semestre)
  - Absences (nombre justifiées/injustifiées)

#### BF 3.4 - Modification Données Étudiant
- **Admin uniquement** (sauf mot de passe = l'étudiant lui-même)
- **Champs modifiables** : Nom, Prénom, Adresse, Statut cadet, Option
- **Non modifiable** : Date naissance (historique)

#### BF 3.5 - Suppression Étudiant
- **Admin uniquement**
- **Cascade** : User lié, Notes, Absences, Moyennes supprimés
- **Confirmation** : Dialog de confirmation

---

### **BF 4 : Saisie et Gestion des Notes**

#### BF 4.1 - Saisie Unitaire de Note
- **Admin uniquement**
- **Formulaire** :
  - Sélectionner étudiant (autocomplete/recherche)
  - Sélectionner module (liste par semestre)
  - Sélectionner type d'évaluation (ex: Examen via coef_id)
  - Entrer note (0-20)
  - Validation : Tous les champs requis
- **Action** :
  - `POST /admin/notes` → NoteController@storeSingle
  - BD : Insérer dans `notes` (student_id, module_id, coef_id, note)
  - **Observer déclenché** : NoteObserver::created() → recalcul Moyenne S1
  - Réponse : "Note ajoutée, moyenne mise à jour"

#### BF 4.2 - Saisie en Masse (Bulk)
- **Admin uniquement**
- **Scénario** : Ajouter les notes d'examen pour une classe (ex: 45 étudiants en Math)
- **Interface** :
  - Sélectionner module
  - Sélectionner type d'évaluation
  - CSV ou tableau editable avec colonnes : Matricule, Nom, Note
  - Valider (check notes 0-20, matricules existent)
- **Action** :
  - `POST /admin/notes/bulk` → NoteController@storeBulk
  - BD::transaction() → Insérer toutes les notes (ou rollback si erreur)
  - **Observer déclenché pour chaque note** → Moyennes mises à jour
  - Réponse : "45 notes ajoutées, 45 moyennes mises à jour"

#### BF 4.3 - Modification de Note
- **Admin uniquement**
- **Formulaire** : Form pré-rempli avec note actuelle
- **Action** :
  - `PUT /admin/notes/{id}` → NoteController@update
  - BD : Mettre à jour note (uniquement colonne `note`)
  - **Observer déclenché** : NoteObserver::updated() → recalcul Moyenne
  - Réponse : "Note modifiée, moyenne mise à jour"

#### BF 4.4 - Suppression de Note
- **Admin uniquement**
- **Action** :
  - `DELETE /admin/notes/{id}` → NoteController@destroy
  - BD : Supprimer la ligne de `notes`
  - **Observer déclenché** : NoteObserver::deleted() → recalcul Moyenne (ou suppression si plus de notes en S1)
  - Réponse : "Note supprimée, moyenne recalculée"

#### BF 4.5 - Consultation des Notes
- **Élève** : Voir ses propres notes
  - `GET /eleve/dashboard` → StudentDashboardController@index
  - Affichage : Tableau par semestre, colonnes (Module, TD, TP, Examen, Moy.Module)
  - Si note manquante → affichage " — "
- **Admin** : Voir notes de tous les étudiants
  - Liste + filtre par option, module, semestre
  - Recherche par étudiant

---

### **BF 5 : Calcul Automatique des Moyennes**

#### BF 5.1 - Moyenne Pondérée par Semestre
- **Déclencheur** : NoteObserver (created, updated, deleted)
- **Formule** :
  ```
  Moyenne_S1 = Σ(note_i × coef_i) / Σ(coef_i)
  où i parcourt toutes les notes du student en S1
  coef_i = coef du type d'évaluation (ex: 2 pour Examen)
  ```
- **Exemple** :
  ```
  Math S1 :
    - TD (coef=1) : note=13
    - Examen (coef=2) : note=15
  Moy Math = (13×1 + 15×2) / (1+2) = 43/3 = 14.33
  
  Si Math, Physics, English en S1 :
  Moyenne_S1 = (14.33 + 16.5 + 12.0) / 3 = 14.28
  ```
- **Stockage** : Table `moyennes` (id, student_id, semestre, moyenne, created_at, updated_at)
- **Mise à jour** : `Moyenne::updateOrCreate(['student_id'=>$sid, 'semestre'=>$sem], ['moyenne'=>$moy])`

#### BF 5.2 - Moyenne de Cycle (Optionnel)
- **Calcul** : Moy.Cycle = (Moyenne_S1 + Moyenne_S2) / 2
- **Utilisé pour** : Classement annuel, validation année

#### BF 5.3 - Recalcul en Cascade
- **Scénario** : Modifier une note d'Examen (coef=2) → recalc Moyenne_S1 → recalc Moy.Cycle
- **Implémentation** : NoteObserver dans sa méthode `recalc()` ne recalcule que le semestre affecté (lecture du `module->semestre`)

#### BF 5.4 - Gestion des Cas Limites
- **Pas de notes en S1** → Moyenne_S1 = 0 ou NULL ? → Moyenne = NULL, pas d'entrée en BD (delete si existait)
- **Une seule note** → Moyenne = note (coef divisé par lui-même)
- **Coef absent** → Coef par défaut = 1

---

### **BF 6 : Gestion des Absences**

#### BF 6.1 - Enregistrement d'Absence
- **Admin uniquement**
- **Formulaire** :
  - Étudiant (autocomplete)
  - Module (list par semestre)
  - Date absence (date picker)
  - Justifiée (booléen)
  - Motif absence (text, optionnel)
- **Validation** : Tous requis sauf motif
- **Action** :
  - `POST /admin/absences` → AbsenceController@store
  - BD : Insérer (student_id, module_id, date_absence, motif_absence, justifie)
  - Réponse : "Absence enregistrée"

#### BF 6.2 - Liste des Absences
- **Élève** : Ses propres absences
  - `GET /eleve/absences` → AbsenceController@index
  - **Important** : `withTrashed()` pour afficher absences supprimées avec motif
  - Tri : date_absence DESC (plus récent d'abord)
  - Affichage : Module | Date | Justifiée | Motif absence | **Motif suppression (si supprimée)**
  - Filtrage : Par module, plage date
- **Admin** : Toutes les absences de tous étudiants
  - Liste + Filtre (étudiant, module, date, justifiée)
  - Pagination : 100 par page
  - Affichage des suppressions

#### BF 6.3 - Modification d'Absence
- **Admin uniquement**
- **Champs modifiables** : Date, Module, Justifiée, Motif absence
- **Action** :
  - `PUT /admin/absences/{id}` → AbsenceController@update
  - BD : UPDATE (pas de recalcul unlike notes)
  - Réponse : "Absence modifiée"

#### BF 6.4 - Suppression d'Absence (SoftDelete)
- **Admin uniquement**
- **Action** :
  - `DELETE /admin/absences/{id}` → AbsenceController@destroy
  - BD : Soft-delete (set deleted_at = NOW(), motif_suppression = "raison")
  - **Élève voit** : Absence marquée "Supprimée (raison)" avec badge rouge
  - **Admin peut** : Restore (PUT /admin/absences/{id}/restore) ou hardDelete

#### BF 6.5 - Statistiques Absences
- **Affichage** :
  - Nombre d'absences justifiées / injustifiées par étudiant
  - % d'absences / total de séances
  - Absences par module (les modules avec plus absences)

---

### **BF 7 : Calcul du Classement Automatique**

#### BF 7.1 - Classement par Option
- **Déclencheur** : Après recalc Moyenne (via NoteObserver)
- **Algorithme** :
  1. Récupérer tous les étudiants de l'option
  2. Trier par moyenne_semestre DESC
  3. Assigner rang (1, 2, 3, ... n)
  4. Générer podium (Top 3)
- **Stockage** : Pas de table rangement, calculé à la demande (cached)

#### BF 7.2 - Podium (Top 3)
- **Format** :
  ```
  Rang 1 (🥇) : Ali Ahmed (14.50)
  Rang 2 (🥈) : Fatima Hassan (14.30)
  Rang 3 (🥉) : Karim Ismail (14.10)
  ```
- **Données** : student.nom, student.prenom, moyenne.moyenne
- **Utilisation** : Dashboard admin + Dashboard élève (voir sa position)

#### BF 7.3 - Classement Dynamique (Filtrés)
- **Endpoint** : `GET /api/admin/rankings` (JSON)
- **Params** (query) :
  - `option_id` (obligatoire)
  - `semestre` (défaut = current_semestre)
  - `year` (défaut = year actuelle)
  - `limit` (défaut = 50)
- **Retour** :
  ```json
  {
    "podium": [
      {"rank": 1, "name": "Ali Ahmed", "moyenne": 14.50},
      {"rank": 2, "name": "Fatima", "moyenne": 14.30},
      {"rank": 3, "name": "Karim", "moyenne": 14.10}
    ],
    "list": [
      {"rank": 4, "name": "...", "moyenne": "..."},
      ...
    ]
  }
  ```
- **Cache** : Redis (TTL=3600s), invalidé après Update/Delete Moyenne

#### BF 7.4 - Mise à Jour Implicite
- **Automatique** : À chaque changement de note → Observer → Moyenne changée → Classement change
- **Pas de lag** : Classement toujours à jour (pas de job asynchrone)

---

### **BF 8 : Gestion du Semestre Académique**

#### BF 8.1 - Détection Automatique du Semestre
- **Middleware** : `CurrentSemester`
- **Règles** :
  - Sept-Déc (mois 9-12) → Semestre 1 dans l'année (semInYear=1)
  - Janv-Juin (mois 1-6) → Semestre 2 dans l'année (semInYear=2)
  - Juil-Août (mois 7-8) → Semestre 2 (fin d'année, avant rentrée)
- **Calcul** : À partir de `now()->month`

#### BF 8.2 - Semestre Absolu (avec Cohort)
- **Input** : `cohort_start_year` (année de début cohorte, ex: 2024)
- **Calcul** :
  ```
  academicYearStart = (month >= 9) ? year : year-1
  academicYearNumber = academicYearStart - cohort_start_year + 1
  absoluteSemester = (academicYearNumber - 1) * 2 + semInYear
  ```
- **Exemple** : Cohorte 2024, aujourd'hui 2026-01-14
  ```
  month=1 → semInYear=2, academicYearStart=2025
  academicYearNumber = 2025 - 2024 + 1 = 2
  absoluteSemester = (2-1)*2 + 2 = 4 (S4 = 2e année, 2e semestre)
  ```
- **Injection** : Middleware ajoute `$request->attributes->set('current_semestre', 4)`

#### BF 8.3 - Utilisation dans Requêtes
- **Exemple** : Étudiant Ali en Jan 2026, cohorte=2024
  - Consultation dashboard → `current_semestre=4`
  - Affichage automatique notes de S4
  - Si notes de S1-S3 existent, affichage en onglets/sections

#### BF 8.4 - Override Semestre
- **URL param** : `?semestre=2` → afficher les notes de S2 (même si on est en S4)
- **Priorité** : URL > Middleware > Défaut

---

### **BF 9 : Recherche et Filtrage Avancés**

#### BF 9.1 - Recherche d'Étudiants
- **Scope** : `Student::search($term)`
- **Champs** : Nom, Prénom, Matricule (User.matricule)
- **Type** : Recherche partielle (like '%term%')
- **Utilisée dans** : Admin dashboard, autocomplete saisie note

#### BF 9.2 - Filtrage Avancé (Admin Dashboard)
- **Filtres** :
  1. **Spécialité** : Dropdown multi-select
  2. **Option** : Dropdown dépendant de Spécialité
  3. **Semestre** : Radio (S1, S2) ou auto (current)
  4. **Année de cohorte** : Dropdown (2020-2026)
  5. **Statut cadet** : Checkbox (inclure/exclure)
  6. **Plage de moyennes** : Slider min/max (0-20)
  7. **Statut présence** : Dropdown (Tous, 0 absences, < 5 abs, etc.)
- **Comportement** :
  - Filtres cumulatifs (AND)
  - Appel API AJAX → `/api/admin/filter` (POST)
  - Résultat en temps réel (avec debounce 300ms)

#### BF 9.3 - Tri Dynamique
- **Options** :
  - Moyenne (asc/desc)
  - Nom (asc/desc)
  - Matricule (asc/desc)
  - Date inscription (asc/desc)
- **Défaut** : Moyenne DESC

#### BF 9.4 - Pagination
- **Admin** :
  - 50 étudiants/page (tunable)
  - Affichage : 1..5/150 pages
- **API** : Accept `limit` + `offset` params

---

### **BF 10 : Endpoints API (Backend for Frontend)**

#### BF 10.1 - Rankings API
- **Endpoint** : `GET /api/admin/rankings`
- **Auth** : Middleware `auth.admin`
- **Params** :
  - `option_id` (int, required)
  - `semestre` (int, optional, default = current)
  - `year` (int, optional, default = current)
  - `limit` (int, optional, default = 50)
- **Response** (200 OK) :
  ```json
  {
    "option_id": 1,
    "option": "Data Science",
    "semestre": 4,
    "count": 45,
    "podium": [
      {"rank": 1, "student_id": 5, "name": "Ali Ahmed", "moyenne": 14.50, "matricule": "DS001"},
      ...
    ],
    "list": [
      {"rank": 4, "student_id": 8, "name": "..."},
      ...
    ]
  }
  ```

#### BF 10.2 - Students Search API
- **Endpoint** : `GET /api/students/search`
- **Auth** : Middleware `auth` (any logged in)
- **Params** :
  - `q` (string, search term)
  - `limit` (int, optional, default = 20)
- **Response** (200 OK) :
  ```json
  [
    {"id": 5, "name": "Ali Ahmed", "matricule": "DS001", "option_id": 2},
    ...
  ]
  ```

#### BF 10.3 - Filter API
- **Endpoint** : `POST /api/admin/filter`
- **Auth** : Middleware `auth.admin`
- **Body** :
  ```json
  {
    "specialite_id": 1,
    "option_id": 2,
    "semestre": 1,
    "year": 2025,
    "cadet": null,
    "moyenne_min": 10,
    "moyenne_max": 20,
    "page": 1,
    "limit": 50
  }
  ```
- **Response** (200 OK) :
  ```json
  {
    "data": [
      {"id": 5, "nom": "Ahmed", "prenom": "Ali", "matricule": "DS001", "moyenne": 14.50, "rang": 3, ...},
      ...
    ],
    "pagination": {
      "total": 150,
      "per_page": 50,
      "current_page": 1,
      "last_page": 3
    }
  }
  ```

---

## 📌 Partie 2 : Besoins Non-Fonctionnels (BNF)

### **BNF 1 : Performance & Scalabilité**

#### BNF 1.1 - Temps de Réponse
- Dashboard étudiant : < 200ms (cached)
- Dashboard admin : < 500ms (paginated)
- Endpoint API : < 300ms
- Search : < 100ms (avec index)

#### BNF 1.2 - Pagination
- Admin dashboard : 50 étudiants/page
- Absences : 100/page
- Classement : 50 étudiants max par page
- API : support offset + limit

#### BNF 1.3 - Caching
- Classements : Redis TTL=3600s (1h), invalidé après UpdateOrCreate Moyenne
- Search results : Redis TTL=300s (5min)
- User role/permissions : Redis TTL=3600s
- **Invalidation** : Automatique via Model observers

#### BNF 1.4 - Indexation BD
- `notes` : INDEX (student_id, module_id, semestre)
- `moyennes` : PRIMARY (id), UNIQUE (student_id, semestre)
- `absences` : INDEX (student_id, module_id, date_absence)
- `students` : INDEX (option_id), UNIQUE (user_id)
- `users` : PRIMARY email, UNIQUE matricule

#### BNF 1.5 - Scalabilité
- Support : jusqu'à 1000 étudiants/option
- Concurrence : 100 requêtes/sec (benchmark)
- Bulk operations : Traiter 1000 notes en < 5s

---

### **BNF 2 : Sécurité & Conformité**

#### BNF 2.1 - Authentification
- Protocole : Session Laravel (cookie HttpOnly, Secure, SameSite)
- Optionnel : Sanctum pour API
- MFA : Non requis (future enhancement)
- Timeout : 2h inactivité

#### BNF 2.2 - Autorisation (RBAC)
- Rôles : admin, élève
- Middleware : `auth.admin`, `auth.eleve`, `current.semester`
- Permission matrix :
  | Ressource | Admin | Élève | Public |
  |-----------|-------|-------|--------|
  | `/admin/*` | ✅ | ❌ | ❌ |
  | `/eleve/*` | ❌ | ✅ | ❌ |
  | `/login` | ✅ | ✅ | ✅ |
  | `/api/admin/*` | ✅ | ❌ | ❌ |
  | `/api/students/*` | ✅ | ✅ | ❌ |

#### BNF 2.3 - Validation Données
- **Serveur (Laravel)** :
  - Notes : 0-20, student/module/coef existent
  - Dates : valides, format DATE
  - Emails : RFC 5322, unique
  - Recherche : sanitize input (strip_tags, htmlspecialchars)
- **Client (React)** :
  - Type checking (TypeScript optionnel)
  - Validation pre-submit (formik/react-hook-form)
  - Feedback utilisateur en temps réel

#### BNF 2.4 - Données Sensibles
- **Date naissance** : Optionnel chiffrement AES-256 (Laravel Encryptable)
- **Mot de passe** : Bcrypt (cost=12)
- **Logs** : Pas de données sensibles (PII)
- **Session** : Pas de données perso dans logs

#### BNF 2.5 - Audit & Traçabilité
- **Timestamps** : created_at, updated_at sur tous modèles
- **Soft-deletes** : Absences (deleted_at, motif_suppression)
- **Logs** : Log crétions/modif/suppression de notes (optionnel Activity log package)
- **IP tracking** : Logs connexions (optionnel)

#### BNF 2.6 - HTTPS & Transport
- **Production** : HTTPS obligatoire (TLS 1.2+)
- **Dev** : HTTP accepté (http://localhost)
- **CORS** : Configuré pour domaine(s) frontend

---

### **BNF 3 : Fiabilité & Qualité**

#### BNF 3.1 - Consistency Données
- **ACID** : Transactions BD pour bulk operations
- **Observer** : Atomique (pas de race condition sur calcul Moyenne)
- **Soft-deletes** : Pas de données orphelines
- **Foreign Keys** : cascade delete/update où approprié

#### BNF 3.2 - Gestion d'Erreurs
- **HTTP Status Codes** :
  - 200 : Success
  - 201 : Created
  - 204 : No Content (DELETE)
  - 400 : Bad Request (validation)
  - 401 : Unauthorized (no auth)
  - 403 : Forbidden (wrong role)
  - 404 : Not Found
  - 422 : Unprocessable Entity (validation detail)
  - 500 : Server Error
- **Error Response** :
  ```json
  {
    "message": "Erreur description",
    "errors": {
      "email": ["Email invalide"],
      "note": ["Note doit être entre 0 et 20"]
    }
  }
  ```
- **Logging** : Tous les erreurs 5xx loggées (avec stack trace)

#### BNF 3.3 - Fallback & Degradation
- Observer échoue → Log + réessai manuel / Admin notification
- Cache miss → Recalcul à la demande (pas d'impact UX)
- BD indisponible → Page 503 "Service Unavailable"

#### BNF 3.4 - Testing
- **PHPUnit** :
  - NoteObserver::created/updated/deleted (9 tests)
  - AbsenceController (8 tests)
  - Middleware AuthAdmin/AuthEleve/CurrentSemester (6 tests)
  - Endpoint API (10 tests)
  - Coverage : > 70%
- **Front-end** :
  - Jest : Composants Dashboard, Table, Modal
  - React Testing Library : User interactions
  - E2E (Cypress) : Login → Create Note → Check Rankings

#### BNF 3.5 - Documentation
- Inline comments (français/anglais)
- API docs : OpenAPI/Swagger (optionnel)
- README : Setup + commands
- BACKEND_SUMMARY.md, FRONTEND_SUMMARY.md (maintenance)

---

### **BNF 4 : Accessibilité & UX**

#### BNF 4.1 - Responsive Design
- **Mobile** (320px) :
  - Single column
  - Stacked forms
  - Touch-friendly buttons (48px min)
- **Tablet** (768px) :
  - 2-column layouts
  - Horizontal tables (scroll)
- **Desktop** (1440px+) :
  - Multi-column
  - Nested menus
  - Rich tables

#### BNF 4.2 - Accessibilité WCAG 2.1 Level AA
- **Contrast** : Minimum 4.5:1 pour text normal, 3:1 pour large text
- **Labels** : Tous inputs ont `<label>` ou `aria-label`
- **Focus** : Keyboard navigation visible (outline, focus ring)
- **ARIA** : `role`, `aria-live` pour toasts, `aria-expanded` pour dropdowns
- **Alt text** : Images et icons
- **Semantic HTML** : `<button>`, `<form>`, `<nav>`, `<main>`, `<table>`
- **Color** : Pas info uniquement par couleur (icon + couleur)

#### BNF 4.3 - Animations & Performance
- **Framer Motion** :
  - Entrance animations (fade in, scale, slide)
  - Transition (300ms par défaut)
  - Podium entrance avec stagger
- **Performance** :
  - GPU-accelerated (transform, opacity)
  - No animation on `prefers-reduced-motion`
- **Web Vitals** :
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

#### BNF 4.4 - User Feedback
- **Toasts/Notifications** :
  - Success : vert, "Note ajoutée avec succès"
  - Error : rouge, "Erreur : Email invalide"
  - Warning : orange, "Confirmation requise"
  - Duration : 3-5s
- **Loading states** :
  - Spinner pendant requête
  - Disable button pour prévenir double-submit
- **Empty states** :
  - Icon + message si liste vide
  - Suggestion d'action (ex: "Créer première absence")
- **Validation** :
  - Inline error messages (sous champ)
  - Red border sur champ invalide
  - Tick green si valide

#### BNF 4.5 - Theme & Branding
- **Couleurs** :
  - Primary : Bleu (ex: #0066CC)
  - Success : Vert (#00AA00)
  - Error : Rouge (#CC0000)
  - Warning : Orange (#FF9900)
  - Neutral : Gris (variations #F5F5F5 → #333333)
- **Typography** :
  - Font : Inter ou System font (-apple-system, BlinkMacSystemFont, etc.)
  - Sizes : 12px (small) → 32px (H1)
  - Line height : 1.5 (body), 1.2 (headings)
- **Spacing** : 4px base unit (4, 8, 12, 16, 24, 32, 48px)

---

### **BNF 5 : Maintenabilité & DevOps**

#### BNF 5.1 - Architecture & Patterns
- **Backend** :
  - MVC clair (Model, Controller, Observer, Middleware)
  - Repository pattern (optionnel pour requêtes complexes)
  - Service layer pour business logic complexe
- **Frontend** :
  - Composants réutilisables
  - Custom hooks (useFilter, useFetch)
  - State management (Context ou Redux si nécessaire)
  - Separation of concerns (UI ≠ Logic)

#### BNF 5.2 - Code Quality
- **Linting** :
  - PHP : PHP CS Fixer, PSR-12
  - JS : ESLint (airbnb config)
- **Formatting** :
  - Prettier pour JS/JSX
  - PHP formatter dans IDE
- **Type Safety** :
  - PHP : Type hints (7.4+)
  - JS : TypeScript (optionnel) ou JSDoc
- **Comments** :
  - Expliquer le "pourquoi", pas le "quoi"
  - Docblocks pour functions publiques

#### BNF 5.3 - Versioning & Git
- **Branches** :
  - `main` : Production ready
  - `develop` : Integration branch
  - `feature/xxx` : Feature branches
  - `bugfix/xxx` : Bug fixes
- **Commits** : Messages clairs, conventional commits (feat:, fix:, docs:)
- **Tags** : v0.1.0, v0.2.0, etc. (semver)

#### BNF 5.4 - Dépendances
- **Composer** : Lock file (composer.lock) commité
- **npm** : Lock file (package-lock.json) commité
- **Updates** : Montées de version trimestrielles, avec tests

#### BNF 5.5 - CI/CD (Futur)
- **Pipeline** :
  1. Lint (ESLint, PHP CS Fixer)
  2. Tests (PHPUnit, Jest)
  3. Build (Vite, Artisan)
  4. Deploy (staging → production)
- **Tools** : GitHub Actions, GitLab CI, ou Jenkins
- **Frequency** : Push to main = auto-deploy to prod (after tests pass)

#### BNF 5.6 - Monitoring & Logging
- **Logs** :
  - File : `storage/logs/laravel.log`
  - Structured : JSON logging (optionnel)
  - Levels : DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Monitoring** (optionnel) :
  - Sentry pour error tracking
  - New Relic / DataDog pour APM
  - Uptime robot pour health checks

---

### **BNF 6 : Documentation & Support**

#### BNF 6.1 - Documentation
- **README.md** :
  - Quick start (install, setup, run)
  - Project structure
  - Technologies stack
- **API Docs** :
  - OpenAPI spec (optionnel)
  - Postman collection
- **Inline Docs** :
  - Docblocks PHP
  - Component comments React
- **Architecture Docs** :
  - Database schema
  - Workflow diagrams (Observer, Middleware)
  - API endpoints list

#### BNF 6.2 - Error Messages
- **Utilisateur-friendly** : Pas de stack traces en prod
- **Français** : Messages localisés (Laravel localization)
- **Actionnable** : "Email déjà utilisé, veuillez vous connecter" au lieu de "Error 400"

#### BNF 6.3 - Training & Onboarding
- **Pour devs** :
  - Docs architecture
  - Setup guide (1h)
- **Pour admins** :
  - User manual (comment ajouter notes, etc.)
  - Video tutorials (optionnel)
- **Pour étudiants** :
  - Intro page
  - FAQ (comment voir mes notes, etc.)

---

## 📊 Tableau Résumé : Traçabilité BF/BNF

| ID | Description | Priorité | Status |
|----|-------------|----------|--------|
| BF 1.1 | Connexion utilisateur | 🔴 Critique | ✅ Partiellement |
| BF 1.2 | Contrôle d'accès (RBAC) | 🔴 Critique | ✅ Implémenté |
| BF 2.1-2.5 | Gestion structures académiques | 🔴 Critique | ✅ Partiellement |
| BF 3.1-3.5 | Gestion étudiants | 🔴 Critique | ✅ Partiellement |
| BF 4.1-4.5 | Saisie & gestion notes | 🔴 Critique | ✅ Implémenté |
| BF 5.1-5.4 | Calcul auto moyennes | 🔴 Critique | ✅ Implémenté |
| BF 6.1-6.5 | Gestion absences | 🔴 Critique | ✅ Implémenté |
| BF 7.1-7.4 | Classement automatique | 🟡 Haute | ⏳ À faire |
| BF 8.1-8.4 | Gestion semestre | 🟡 Haute | ✅ Implémenté |
| BF 9.1-9.4 | Recherche & filtrage | 🟡 Haute | ⏳ À faire |
| BF 10.1-10.3 | Endpoints API | 🟡 Haute | ⏳ À faire |
| BNF 1 | Performance & Scalabilité | 🟡 Haute | ⏳ À faire |
| BNF 2 | Sécurité | 🔴 Critique | ✅ Implémenté |
| BNF 3 | Fiabilité & Tests | 🟡 Haute | ⏳ À faire |
| BNF 4 | Accessibilité & UX | 🟡 Haute | ⏳ À faire |
| BNF 5 | Maintenabilité | 🟡 Haute | ⏳ À faire |
| BNF 6 | Documentation | 🟡 Moyenne | ⏳ À faire |

