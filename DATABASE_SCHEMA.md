# 📊 Schéma de la Base de Données

## 🏗️ Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GESTION ACADÉMIQUE                       │
│                      (9 tables)                              │
└─────────────────────────────────────────────────────────────┘

                          UTILISATEURS
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
            [users]        [admins]      [students]
             (auth)      (inherits)      (data perso)
                            ↑
                            │ student_id FK
                            │
                    ┌───────┴────────┐
                    ↓                ↓
              [options]        [specialites]
            (curriculum)       (specialties)
                    ↑
                    │ option_id
                    │
    ┌───────────────┴────────────────┐
    ↓                                ↓
[notes]                        [absences]
(evaluations)              (attendance)
    │                            │
    ├──→ student_id FK           ├──→ student_id FK
    ├──→ module_id FK            └──→ module_id FK
    ├──→ coef_id FK
    ↑
    │ module_id
    ├──────────────────→ [modules]
    │
    ├──→ coef_id FK
    ├──────────────────→ [coef]
                              ↑
                              │
                        ┌─────┴──────┐
                        ↓            ↓
                    [module_coef]  (Weights)
                    (Pivot table)

            RÉSULTATS AUTOMATIQUES
                    ↓
                [moyennes]
            (weighted averages)
                    │
                    ├──→ student_id FK
                    ├──→ semestre
                    └──→ moyenne (calculée auto par NoteObserver)
```

---

## 📋 Tables Détaillées

### **1. TABLE: `users`**

**Rôle** : Authentification et comptes utilisateurs (admins + étudiants)

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Ajouts pour le projet
    student_id BIGINT UNSIGNED NULL UNIQUE,
    matricule VARCHAR(50) NOT NULL UNIQUE,  -- e.g., "DS001", "IGE2025001"
    role ENUM('admin', 'eleve') NOT NULL DEFAULT 'eleve',
    
    -- Timestamps
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_users_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
```

**Colonnes clés** :
- `id` : ID unique
- `email` : Email unique (login)
- `password` : Hash Bcrypt
- `student_id` : Lien vers Student (NULL pour admin)
- `matricule` : Code unique (ex: DS001, IGE2025001)
- `role` : Enum (admin OU élève)

**Exemple d'insertion** :
```sql
-- Admin
INSERT INTO users (name, email, password, matricule, role) 
VALUES ('Admin User', 'admin@school.com', bcrypt('password'), 'ADM001', 'admin');

-- Élève
INSERT INTO users (name, email, password, student_id, matricule, role) 
VALUES ('Ali Ahmed', 'ali@student.com', bcrypt('pass123'), 1, 'DS001', 'eleve');
```

---

### **2. TABLE: `specialites`**

**Rôle** : Spécialités / programmes d'études (ex: Informatique, Génie Civil)

```sql
CREATE TABLE specialite (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(255) NOT NULL,
    annee INT NOT NULL,  -- Année d'étude (1, 2, 3, etc.)
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Contrainte unique
    UNIQUE KEY uniq_specialite_libelle_annee (libelle, annee)
);

-- Indices
CREATE INDEX idx_specialite_annee ON specialite(annee);
```

**Colonnes clés** :
- `id` : ID unique
- `libelle` : Nom de la spécialité (ex: "Informatique")
- `annee` : Année d'étude (1 = 1ère année, 2 = 2ème année, etc.)

**Contrainte** : (libelle, annee) doit être unique
- Raison : Peut y avoir "Informatique" année 1 ET "Informatique" année 2 en tant que structures différentes

**Exemple d'insertion** :
```sql
INSERT INTO specialite (libelle, annee) VALUES 
('Informatique', 1),
('Informatique', 2),
('Génie Civil', 1),
('Génie Civil', 2);
```

---

### **3. TABLE: `options`**

**Rôle** : Options spécialisées dans une spécialité

```sql
CREATE TABLE options (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    specialite_id BIGINT UNSIGNED NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_options_specialite FOREIGN KEY (specialite_id) 
        REFERENCES specialite(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices
CREATE INDEX idx_options_specialite_id ON options(specialite_id);
```

**Colonnes clés** :
- `id` : ID unique
- `specialite_id` : FK vers Specialite
- `libelle` : Nom de l'option (ex: "Data Science", "Web Development", "Infrastructure")

**Hiérarchie** :
```
Specialite (Informatique, Année 1)
    └─ Option 1: Data Science
    └─ Option 2: Web Development
    └─ Option 3: Infrastructure
```

**Exemple d'insertion** :
```sql
INSERT INTO options (specialite_id, libelle) VALUES 
(1, 'Data Science'),           -- Informatique Y1
(1, 'Web Development'),
(1, 'Infrastructure'),
(2, 'Cloud Computing'),        -- Informatique Y2
(2, 'Cybersecurity');
```

---

### **4. TABLE: `students`**

**Rôle** : Données étudiants (profils, affiliation option)

```sql
CREATE TABLE students (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    option_id BIGINT UNSIGNED NOT NULL,
    
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    date_naissance DATE NOT NULL,
    adresse VARCHAR(500),
    cadet BOOLEAN DEFAULT FALSE,  -- Statut cadet (ex: frère/sœur d'ancien)
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_students_option FOREIGN KEY (option_id) 
        REFERENCES options(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices
CREATE INDEX idx_students_option_id ON students(option_id);
CREATE INDEX idx_students_nom ON students(nom);
CREATE INDEX idx_students_prenom ON students(prenom);
```

**Colonnes clés** :
- `id` : ID unique
- `option_id` : FK vers Option (détermine Spécialité via JOIN)
- `nom`, `prenom` : Identité
- `date_naissance` : DOB (validée > 1950 et < aujourd'hui)
- `adresse` : Adresse postale
- `cadet` : Booléen (pour statistiques)

**Relation au User** : Un-à-Un via `User.student_id = Student.id`

**Exemple d'insertion** :
```sql
INSERT INTO students (option_id, nom, prenom, date_naissance, adresse, cadet) VALUES 
(1, 'Ahmed', 'Ali', '2005-03-15', '123 Rue Paris', FALSE),
(1, 'Hassan', 'Fatima', '2004-07-22', '456 Bd Lyon', TRUE),
(2, 'Ismail', 'Karim', '2005-01-10', '789 Ave Marseille', FALSE);
```

---

### **5. TABLE: `modules`**

**Rôle** : Matières/cours enseignées

```sql
CREATE TABLE modules (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(255) NOT NULL,
    semestre INT NOT NULL,  -- S1=1, S2=2, S3=3, etc.
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX idx_modules_semestre ON modules(semestre);
CREATE INDEX idx_modules_libelle ON modules(libelle);
```

**Colonnes clés** :
- `id` : ID unique
- `libelle` : Nom du module (ex: "Mathématiques", "Physique", "Programmation Web")
- `semestre` : Numéro semestre (1=S1, 2=S2, 3=S3, etc.)

**Exemple d'insertion** :
```sql
INSERT INTO modules (libelle, semestre) VALUES 
('Mathématiques', 1),
('Physique', 1),
('Programmation Python', 1),
('Base de Données', 2),
('Développement Web', 2),
('Anglais', 1);
```

---

### **6. TABLE: `coef` (Coefficients)**

**Rôle** : Types d'évaluation et leur pondération

```sql
CREATE TABLE coef (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(255) NOT NULL UNIQUE,
    coef DECIMAL(5, 2) NOT NULL DEFAULT 1.00,  -- Pondération (1.0, 1.5, 2.0, etc.)
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Colonnes clés** :
- `id` : ID unique
- `libelle` : Type d'évaluation (ex: "TD", "TP", "Examen", "Examen Final")
- `coef` : Coefficient de pondération (DECIMAL pour précision)

**Pondération typique** :
```
TD       → coef = 1.0
TP       → coef = 1.0
Contrôle → coef = 1.5
Examen   → coef = 2.0
Examen Final → coef = 3.0
```

**Exemple d'insertion** :
```sql
INSERT INTO coef (libelle, coef) VALUES 
('TD', 1.00),
('TP', 1.00),
('Contrôle', 1.50),
('Examen', 2.00),
('Examen Final', 3.00);
```

---

### **7. TABLE: `module_coef` (Pivot - Module × Coefficient)**

**Rôle** : Associer les types d'évaluation aux modules

```sql
CREATE TABLE module_coef (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    module_id BIGINT UNSIGNED NOT NULL,
    coef_id BIGINT UNSIGNED NOT NULL,
    
    ordre INT DEFAULT 0,  -- Optionnel : ordre d'affichage
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_module_coef_module FOREIGN KEY (module_id) 
        REFERENCES modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_module_coef_coef FOREIGN KEY (coef_id) 
        REFERENCES coef(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Contrainte d'unicité
    UNIQUE KEY uniq_module_coef (module_id, coef_id)
);

-- Indices
CREATE INDEX idx_module_coef_module_id ON module_coef(module_id);
CREATE INDEX idx_module_coef_coef_id ON module_coef(coef_id);
```

**Colonnes clés** :
- `id` : ID unique (pivot)
- `module_id` : FK vers Module
- `coef_id` : FK vers Coef
- `ordre` : Ordre d'affichage (optionnel)

**Exemple d'insertion** :
```sql
-- Math a TD, TP, Examen
INSERT INTO module_coef (module_id, coef_id, ordre) VALUES 
(1, 1, 1),  -- Module 1 (Math) + Coef 1 (TD)
(1, 2, 2),  -- Module 1 (Math) + Coef 2 (TP)
(1, 4, 3);  -- Module 1 (Math) + Coef 4 (Examen)

-- Physics a TD, Examen
INSERT INTO module_coef (module_id, coef_id, ordre) VALUES 
(2, 1, 1),  -- Module 2 (Physics) + Coef 1 (TD)
(2, 4, 2);  -- Module 2 (Physics) + Coef 4 (Examen)
```

---

### **8. TABLE: `notes`**

**Rôle** : Notes (évaluations) des étudiants

```sql
CREATE TABLE notes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    module_id BIGINT UNSIGNED NOT NULL,
    coef_id BIGINT UNSIGNED NOT NULL,
    
    note DECIMAL(5, 2) NOT NULL,  -- 0-20
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_notes_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notes_module FOREIGN KEY (module_id) 
        REFERENCES modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notes_coef FOREIGN KEY (coef_id) 
        REFERENCES coef(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices (CRITICAL)
CREATE INDEX idx_notes_student_id ON notes(student_id);
CREATE INDEX idx_notes_module_id ON notes(module_id);
CREATE INDEX idx_notes_coef_id ON notes(coef_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Performance : composite index pour requêtes récurrentes
CREATE INDEX idx_notes_student_semestre ON notes(student_id, module_id);
```

**Colonnes clés** :
- `id` : ID unique
- `student_id` : FK vers Student
- `module_id` : FK vers Module (détermine semestre)
- `coef_id` : FK vers Coef (type d'évaluation + pondération)
- `note` : Valeur de la note (0-20, DECIMAL pour précision)

**Validation** : note BETWEEN 0 AND 20

**Exemple d'insertion** :
```sql
-- Ali (student_id=1) a TD=13, TP=14, Examen=15 en Mathématiques (module_id=1)
INSERT INTO notes (student_id, module_id, coef_id, note) VALUES 
(1, 1, 1, 13),  -- TD
(1, 1, 2, 14),  -- TP
(1, 1, 4, 15);  -- Examen

-- Calcul auto par NoteObserver :
-- Moyenne_Math = (13*1 + 14*1 + 15*2) / (1+1+2) = 56/4 = 14.00
```

---

### **9. TABLE: `absences` (avec SoftDeletes)**

**Rôle** : Enregistrement des absences (avec suppression logique)

```sql
CREATE TABLE absence (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    module_id BIGINT UNSIGNED NOT NULL,
    
    date_absence DATE NOT NULL,
    justifie BOOLEAN DEFAULT FALSE,
    motif_absence VARCHAR(500),
    motif_suppression VARCHAR(500) NULL,  -- Raison de la suppression
    
    -- Soft Delete
    deleted_at TIMESTAMP NULL,
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_absence_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_absence_module FOREIGN KEY (module_id) 
        REFERENCES modules(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices
CREATE INDEX idx_absence_student_id ON absence(student_id);
CREATE INDEX idx_absence_module_id ON absence(module_id);
CREATE INDEX idx_absence_date ON absence(date_absence);
CREATE INDEX idx_absence_deleted_at ON absence(deleted_at);  -- Pour SoftDelete queries
```

**Colonnes clés** :
- `id` : ID unique
- `student_id` : FK vers Student
- `module_id` : FK vers Module
- `date_absence` : Date de l'absence
- `justifie` : Booléen (justifiée ou pas)
- `motif_absence` : Raison de l'absence (ex: "Maladie", "Transport")
- `motif_suppression` : Raison de suppression (ex: "Erreur de saisie")
- `deleted_at` : Timestamp pour soft delete (NULL = non supprimée, NOT NULL = supprimée)

**Exemple d'insertion** :
```sql
-- Absence non supprimée
INSERT INTO absence (student_id, module_id, date_absence, justifie, motif_absence) 
VALUES (1, 1, '2026-01-14', TRUE, 'Maladie');

-- Absence supprimée (soft delete)
UPDATE absence SET deleted_at = NOW(), motif_suppression = 'Erreur de saisie' 
WHERE id = 1;

-- Étudiant consulte ses absences (avec SoftDelete) :
SELECT * FROM absence WHERE student_id = 1 AND deleted_at IS NULL;  -- Non-supprimées

-- Admin consulte TOUTES (y compris supprimées) :
SELECT * FROM absence WHERE student_id = 1;  -- À utiliser avec withTrashed() en Eloquent
```

---

### **10. TABLE: `moyennes` (Calculated)**

**Rôle** : Stockage des moyennes pondérées (calculées auto par NoteObserver)

```sql
CREATE TABLE moyennes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    semestre INT NOT NULL,
    
    moyenne DECIMAL(5, 2) NOT NULL,  -- 0-20
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_moyennes_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint
    UNIQUE KEY uniq_moyennes_student_semestre (student_id, semestre)
);

-- Indices
CREATE INDEX idx_moyennes_student_id ON moyennes(student_id);
CREATE INDEX idx_moyennes_semestre ON moyennes(semestre);
CREATE INDEX idx_moyennes_moyenne ON moyennes(moyenne DESC);  -- Pour classements
```

**Colonnes clés** :
- `id` : ID unique
- `student_id` : FK vers Student
- `semestre` : Numéro du semestre
- `moyenne` : Moyenne pondérée (DECIMAL 5,2 = 0-20)

**Contrainte** : (student_id, semestre) unique
- Raison : Un étudiant ne peut avoir qu'une moyenne par semestre

**Exemple d'insertion** :
```sql
-- Ali (student_id=1) a moyenne 14.25 en S1
INSERT INTO moyennes (student_id, semestre, moyenne) VALUES (1, 1, 14.25);

-- Mise à jour auto (via NoteObserver::updateOrCreate)
UPDATE moyennes SET moyenne = 14.50, updated_at = NOW() 
WHERE student_id = 1 AND semestre = 1;

-- Classement par semestre (SELECT + JOIN) :
SELECT s.id, s.nom, s.prenom, m.moyenne,
       ROW_NUMBER() OVER (ORDER BY m.moyenne DESC) as rang
FROM moyennes m
JOIN students s ON m.student_id = s.id
WHERE s.option_id = 1 AND m.semestre = 1
ORDER BY m.moyenne DESC;
```

---

## 📐 Diagramme Entité-Relation (ER)

```sql
USERS (admin, auth)
    │ email PK
    ├─ student_id (FK) ──→ STUDENTS (1:1 pour élèves)
    └─ role (admin | élève)

SPECIALITES
    │ id PK
    ├─ libelle
    └─ annee
        ↓ (1:N)
    OPTIONS
        │ id PK
        ├─ specialite_id (FK)
        └─ libelle
            ↓ (1:N)
        STUDENTS
            │ id PK
            ├─ option_id (FK)
            ├─ nom, prenom, date_naissance, adresse, cadet
            └─ user_id (1:1 inverse)
                ↓ (1:N)
            NOTES
                │ id PK
                ├─ student_id (FK)
                ├─ module_id (FK) ──→ MODULES (1:N) ──→ semestre
                ├─ coef_id (FK) ──→ COEF (1:N) ──→ pondération
                └─ note (0-20)
                    ↓ (Observer)
                MOYENNES (1:1 per semestre)
                    │ id PK
                    ├─ student_id (FK)
                    ├─ semestre
                    └─ moyenne (calculée)

            ABSENCES (SoftDelete)
                │ id PK
                ├─ student_id (FK)
                ├─ module_id (FK)
                ├─ date_absence
                ├─ justifie
                ├─ motif_absence
                ├─ motif_suppression
                └─ deleted_at (NULL = actif)

MODULES
    │ id PK
    ├─ libelle
    └─ semestre
        ↓ (1:N pivot)
    MODULE_COEF (Pivot)
        │ id PK
        ├─ module_id (FK)
        └─ coef_id (FK)

COEF
    │ id PK
    ├─ libelle (unique)
    └─ coef (pondération)
```

---

## 🔄 Cascades & Intégrité Référentielle

| FK | Parent | Enfant | On Delete | On Update |
|----|--------|--------|-----------|-----------|
| `users.student_id` | `students` | `users` | CASCADE | CASCADE |
| `options.specialite_id` | `specialite` | `options` | CASCADE | CASCADE |
| `students.option_id` | `options` | `students` | CASCADE | CASCADE |
| `notes.student_id` | `students` | `notes` | CASCADE | CASCADE |
| `notes.module_id` | `modules` | `notes` | CASCADE | CASCADE |
| `notes.coef_id` | `coef` | `notes` | CASCADE | CASCADE |
| `absence.student_id` | `students` | `absence` | CASCADE | CASCADE |
| `absence.module_id` | `modules` | `absence` | CASCADE | CASCADE |
| `moyennes.student_id` | `students` | `moyennes` | CASCADE | CASCADE |
| `module_coef.module_id` | `modules` | `module_coef` | CASCADE | CASCADE |
| `module_coef.coef_id` | `coef` | `module_coef` | CASCADE | CASCADE |

**Impact** :
- Supprimer Specialite → Cascade sur Options, puis Students, Notes, Absences, Moyennes
- Supprimer Student → Cascade sur Notes, Absences, Moyennes (logique)
- Supprimer Module → Notes/Absences orphelines

---

## 🎯 Performances & Optimisations

### **Indexes Critiques**

```sql
-- MUST-HAVE pour recherches fréquentes
CREATE INDEX idx_notes_student_id ON notes(student_id);
CREATE INDEX idx_notes_student_semestre ON notes(student_id, module_id);
CREATE INDEX idx_moyennes_student_id_semestre ON moyennes(student_id, semestre);
CREATE INDEX idx_absence_student_id ON absence(student_id);
CREATE INDEX idx_students_option_id ON students(option_id);

-- Optionnel mais recommandé pour tri/recherche
CREATE INDEX idx_moyennes_moyenne DESC ON moyennes(moyenne DESC);
CREATE INDEX idx_students_nom ON students(nom);
CREATE INDEX idx_absence_date_absence ON absence(date_absence);
```

### **Query Optimization Examples**

```sql
-- ❌ LENT (MANY JOINs, pas d'index)
SELECT students.nom, AVG(notes.note) as moy
FROM students
JOIN notes ON students.id = notes.student_id
WHERE students.option_id = 1
GROUP BY students.id;

-- ✅ OPTIMISÉ (utilise table moyennes + index)
SELECT s.nom, m.moyenne
FROM students s
JOIN moyennes m ON s.id = m.student_id
WHERE s.option_id = 1 AND m.semestre = 1
ORDER BY m.moyenne DESC;
-- Temps: 5ms vs 500ms
```

---

## 📝 Contrats de Données

### **Note Constraint**
```
note BETWEEN 0 AND 20
type DECIMAL(5, 2)
```

### **Moyenne Constraint**
```
moyenne BETWEEN 0 AND 20
type DECIMAL(5, 2)
```

### **Coefficient Constraint**
```
coef > 0
type DECIMAL(5, 2)
```

### **Semestre Constraint**
```
semestre >= 1 (S1, S2, S3, S4, ...)
```

---

## 🔐 Sécurité & Audit

### **Immutable Columns**
```
notes.created_at : jamais modifié
students.date_naissance : jamais modifié (historique)
users.matricule : unique, immutable
```

### **Audit Trail** (optionnel)
```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(50),  -- CREATE, UPDATE, DELETE
    table_name VARCHAR(100),
    record_id BIGINT,
    old_value JSON,
    new_value JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

