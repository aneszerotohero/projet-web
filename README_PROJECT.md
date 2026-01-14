# 🎓 Plateforme de Gestion Académique Intégrée

> **Une application web complète pour gérer les notes, absences et classements académiques avec calcul automatique et interface intuitive.**

![Laravel](https://img.shields.io/badge/Laravel-10-red?logo=laravel)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?logo=mysql)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités Clés](#fonctionnalités-clés)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Démarrage Rapide](#démarrage-rapide)
- [Documentation](#documentation)
- [Structure du Projet](#structure-du-projet)
- [Contribuer](#contribuer)
- [License](#license)

---

## 🎯 Vue d'ensemble

Cette plateforme automatise la gestion académique complète :
- **Gestion des notes** : Saisie unitaire ou en masse (CSV)
- **Calcul automatique** : Moyennes pondérées recalculées en temps réel via Observer
- **Classement dynamique** : Rankings actualisés après chaque modification
- **Gestion des absences** : Enregistrement avec justification et suppression logique
- **Détection du semestre** : Calcul automatique basé sur le calendrier académique
- **Contrôle d'accès** : RBAC (Admin / Élève) avec middleware sécurisé
- **Recherche & Filtres** : Recherche avancée et filtrage multi-critères
- **UI Moderne** : React + Inertia avec animations Framer Motion

---

## ✨ Fonctionnalités Clés

### 📊 Gestion des Notes
- Saisie unitaire avec validation instantanée
- Saisie en masse (CSV) avec transaction
- Modification et suppression with observer trigger
- Historique complet (timestamps)

### 🎯 Calcul Automatique des Moyennes
```
Moyenne_pondérée = Σ(note_i × coef_i) / Σ(coef_i)
```
- Recalcul **automatique** après chaque modification (NoteObserver)
- Pondération configurable par type d'évaluation
- Stockage en BD pour requêtes rapides

### 🏆 Classement Automatique
- Podium (Top 3) avec animations
- Classement complet par option/semestre
- Rang personnel visible pour chaque étudiant
- Cache Redis (TTL 1h)

### 📝 Gestion des Absences
- Enregistrement avec justification
- Suppression logique (SoftDelete) avec motif
- Affichage des absences supprimées pour élève
- Filtrage par module/date

### 📅 Détection Automatique du Semestre
```
Sept-Déc  → S1 (Semestre 1)
Janv-Juin → S2 (Semestre 2)
Juil-Août → S2 (fin d'année)
```
- Calcul absolu si cohort_start_year connu
- Injection via middleware

### 🔐 Sécurité & Contrôle d'Accès
- **Admin** : Accès complet (CRUD toutes ressources)
- **Élève** : Accès limité à ses données
- Middleware `auth`, `auth.admin`, `auth.eleve`
- Validation côté serveur + client

### 🔍 Recherche & Filtres Avancés
- Recherche par nom/prénom/matricule
- Filtres multi-critères (spécialité, option, semestre, moyennes, etc.)
- Tri dynamique (moyenne DESC, nom ASC)
- Pagination (50 élèves/page admin, 100 absences/page)

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (React)                  │
│  Pages | Composants | Hooks | Animations (Framer)       │
├──────────────────────────────────────────────────────────┤
│            BUSINESS LOGIC LAYER (Laravel)                │
│  Controllers | Services | Middleware | Observers         │
├──────────────────────────────────────────────────────────┤
│           DATA ACCESS LAYER (Eloquent ORM)               │
│  Models | Queries | Transactions | Redis Cache          │
├──────────────────────────────────────────────────────────┤
│                MySQL Database                            │
│  10 Tables | Indexes | Cascades | Soft-deletes          │
└──────────────────────────────────────────────────────────┘
```

**3 couches + 10 tables**. Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour détails complets.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework** : Laravel 10
- **Database** : MySQL 8
- **ORM** : Eloquent
- **Cache** : Redis
- **API** : RESTful JSON
- **Testing** : PHPUnit

### **Frontend**
- **Framework** : React 18
- **Routing** : Inertia.js (Server-side rendering)
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **Forms** : React Hook Form
- **HTTP** : Axios
- **Testing** : Jest + React Testing Library

### **DevOps**
- **Version Control** : Git
- **CI/CD** : GitHub Actions (optional)
- **Containerization** : Docker (optional)
- **Monitoring** : Sentry (optional)

---

## 📦 Installation

### **Prérequis**
- PHP 8.1+
- Node.js 16+
- MySQL 8
- Composer
- npm

### **Étapes**

#### 1. Cloner le repo
```bash
git clone https://github.com/aneszerotohero/projet-web.git
cd projet-web
```

#### 2. Installer dépendances PHP
```bash
composer install
cp .env.example .env
php artisan key:generate
```

#### 3. Configurer BD
```env
# .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_academique
DB_USERNAME=root
DB_PASSWORD=
```

#### 4. Migrer BD
```bash
php artisan migrate
```

#### 5. Installer dépendances JS
```bash
npm install
```

#### 6. Compiler assets
```bash
npm run dev    # Development mode (watch)
npm run build  # Production mode
```

#### 7. Lancer serveur
```bash
php artisan serve       # Backend (http://localhost:8000)
npm run dev             # Frontend + Vite (dans autre terminal)
```

---

## 🚀 Démarrage Rapide

### **Créer Compte Admin**
```bash
php artisan tinker
>>> \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@local.com',
    'password' => bcrypt('password'),
    'matricule' => 'ADM001',
    'role' => 'admin'
]);
```

### **Ajouter Spécialité**
```bash
>>> \App\Models\Specialite::create(['libelle' => 'Informatique', 'annee' => 1]);
>>> \App\Models\Option::create(['specialite_id' => 1, 'libelle' => 'Data Science']);
```

### **Créer Étudiant**
```bash
>>> $student = \App\Models\Student::create([
    'option_id' => 1,
    'nom' => 'Ahmed',
    'prenom' => 'Ali',
    'date_naissance' => '2005-03-15',
    'cadet' => false
]);
>>> \App\Models\User::create([
    'student_id' => $student->id,
    'name' => 'Ali Ahmed',
    'email' => 'ali@student.com',
    'password' => bcrypt('pass123'),
    'matricule' => 'DS001',
    'role' => 'eleve'
]);
```

### **Ajouter Note** (Observer recalculera moyenne)
```bash
>>> \App\Models\Note::create([
    'student_id' => 1,
    'module_id' => 1,
    'coef_id' => 1,
    'note' => 15
]);

# Observer déclenché automatiquement → Moyenne recalculée
>>> \App\Models\Moyenne::find(1); # Vérifier
```

---

## 📚 Documentation

Consultez la documentation détaillée :

| Fichier | Contenu | Public |
|---------|---------|--------|
| **[PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md)** | Vue d'ensemble générale | Tous |
| **[REQUIREMENTS.md](./REQUIREMENTS.md)** | Besoins Fonctionnels/Non-Fonctionnels | Devs, QA |
| **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** | Schéma BD complet (10 tables) | Backend, DBA |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Architecture 3-couches avec diagrammes | Architects, Devs |
| **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** | Roadmap + Checklist implémentation | Devs, PM |
| **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** | Index + Matrice de lecture | Tous |
| **[BACKEND_SUMMARY.md](./BACKEND_SUMMARY.md)** | Résumé des changements backend | Backend |
| **[FRONTEND_SUMMARY.md](./FRONTEND_SUMMARY.md)** | Résumé des changements frontend | Frontend |

### **Démarrage Rapide Documentation**

👤 **Backend Developer** ?  
→ Lire : PROJECT_DESCRIPTION → REQUIREMENTS → DATABASE_SCHEMA → ARCHITECTURE

👨‍💼 **Product Manager** ?  
→ Lire : PROJECT_DESCRIPTION → REQUIREMENTS (overview) → IMPLEMENTATION_GUIDE (roadmap)

🎨 **Frontend Developer** ?  
→ Lire : ARCHITECTURE (Couche 1) → FRONTEND_SUMMARY → IMPLEMENTATION_GUIDE (checklist)

---

## 📁 Structure du Projet

```
projet-web/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── StudentDashboardController.php
│   │   │   ├── AdminDashboardController.php
│   │   │   ├── NoteController.php
│   │   │   ├── AbsenceController.php
│   │   │   └── Api/FilterController.php
│   │   └── Middleware/
│   │       ├── AuthAdmin.php
│   │       ├── AuthEleve.php
│   │       └── CurrentSemester.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Student.php
│   │   ├── Specialite.php
│   │   ├── Option.php
│   │   ├── Module.php
│   │   ├── Coef.php
│   │   ├── ModuleCoef.php
│   │   ├── Note.php
│   │   ├── Absence.php
│   │   └── Moyenne.php
│   ├── Observers/
│   │   └── NoteObserver.php
│   ├── Services/                    # À créer
│   │   ├── RankingService.php
│   │   ├── NoteService.php
│   │   ├── FilterService.php
│   │   └── AcademicService.php
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── migrations/                  # 10 migrations
│   └── seeders/                     # Données de test
├── resources/
│   ├── js/
│   │   ├── Pages/
│   │   │   ├── Auth/Login.jsx
│   │   │   ├── Eleve/Dashboard.jsx
│   │   │   ├── Eleve/Absences.jsx
│   │   │   └── Admin/Dashboard.jsx
│   │   ├── Components/              # Composants réutilisables
│   │   ├── Hooks/                   # Custom hooks
│   │   ├── Layouts/
│   │   │   └── AppLayout.jsx
│   │   └── app.jsx
│   ├── css/
│   │   └── app.css                  # Tailwind
│   └── views/
│       └── app.blade.php            # Root Inertia view
├── routes/
│   ├── web.php                      # Web routes (protected)
│   └── api.php                      # API routes (JSON)
├── tests/
│   ├── Feature/
│   │   ├── NoteObserverTest.php
│   │   └── ...
│   └── Unit/
├── config/
│   └── app.php
├── storage/
│   └── logs/
├── public/
├── vendor/                          # Dépendances PHP
├── node_modules/                    # Dépendances JS
├── .env
├── composer.json
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── phpunit.xml
├── README.md                        # Ce fichier
├── PROJECT_DESCRIPTION.md
├── REQUIREMENTS.md
├── DATABASE_SCHEMA.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_GUIDE.md
├── DOCUMENTATION_INDEX.md
├── BACKEND_SUMMARY.md
└── FRONTEND_SUMMARY.md
```

---

## 🧪 Testing

### **PHPUnit**
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/NoteObserverTest.php

# Run with coverage
php artisan test --coverage --coverage-html coverage/
```

### **Jest (React)**
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### **E2E (Cypress)**
```bash
# Open Cypress
npm run cypress:open

# Run headless
npm run cypress:run
```

---

## 📊 Endpoints API

### **Admin**
```
GET    /api/admin/rankings              # Classements par option/semestre
POST   /api/admin/filter                # Filtres avancés
```

### **Utilisateur**
```
GET    /api/students/search?q=term      # Recherche étudiants
```

### **Web**
```
GET    /eleve/dashboard                 # Dashboard étudiant
GET    /eleve/absences                  # Absences étudiant
GET    /admin/dashboard                 # Dashboard admin
POST   /admin/notes                     # Créer note
POST   /admin/notes/bulk                # Bulk import notes
PUT    /admin/notes/{id}                # Modifier note
DELETE /admin/notes/{id}                # Supprimer note
POST   /admin/absences                  # Créer absence
```

Voir [REQUIREMENTS.md](./REQUIREMENTS.md) section "BF 10" pour détails complets.

---

## 🔄 Flux Principal : Ajouter une Note

```
1. Admin → POST /admin/notes (form)
   ↓
2. NoteController::storeSingle()
   ├─ Validation input
   ├─ Note::create()
   └─ NoteObserver::created() DÉCLENCHÉ
       ↓
3. Observer recalcule moyenne
   ├─ Fetch all notes for student + semester
   ├─ Calculate weighted average
   ├─ Moyenne::updateOrCreate()
   └─ Cache::forget() invalidate rankings
       ↓
4. Frontend updates
   ├─ Dashboard : Moyenne mise à jour
   ├─ Podium : Classement changé
   └─ Toast : "Note ajoutée ✓"
```

**Temps total** : < 500ms

---

## 🚀 Performance

| Métrique | Target | Actuel |
|----------|--------|--------|
| Dashboard load | < 200ms | ⏳ À mesurer |
| API response | < 300ms | ⏳ À mesurer |
| Search | < 100ms | ⏳ À mesurer |
| Bulk import 1000 notes | < 5s | ⏳ À mesurer |

**Optimisations**
- ✅ Indexation BD (composite indexes)
- ✅ Pagination (50-100 items/page)
- ✅ Caching (Redis, TTL=3600s)
- ⏳ Lazy loading React
- ⏳ Query optimization

---

## 🔐 Sécurité

- ✅ RBAC (Role-Based Access Control)
- ✅ Middleware authentication
- ✅ Input validation (server + client)
- ✅ SQL injection prevention (Eloquent)
- ✅ CSRF protection (Laravel)
- ✅ Password hashing (Bcrypt)
- ✅ Soft-deletes (data safety)
- ⏳ Rate limiting (optional)

---

## 🤝 Contribuer

### **Workflow Git**
```bash
# Feature branch
git checkout -b feature/add-ranking

# Commit
git commit -m "feat: add ranking calculation with cache"

# Push
git push origin feature/add-ranking

# Pull request
# → Demander review
# → Merge après approval
```

### **Code Standards**
- **PHP** : PSR-12 (Laravel conventions)
- **JS** : ESLint (airbnb config)
- **Commits** : Conventional Commits

### **Avant PR**
- [ ] Tests passent (`php artisan test`)
- [ ] Linting OK (`composer lint`, `npm run lint`)
- [ ] Documentation à jour
- [ ] Checklist IMPLEMENTATION_GUIDE complétée

---

## 📞 Support

**Questions ?**
1. Consultez la documentation (voir [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md))
2. Cherchez dans les issues GitHub
3. Posez une question dans les discussions

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) file.

---

## 👥 Équipe

**Développement**
- Backend : [À compléter]
- Frontend : [À compléter]

**Architecture**
- Lead Dev : [À compléter]

---

## 🗓️ Timeline

- **Phase 1** (Sem 1-2) : Fondations ✅ Partiellement
- **Phase 2** (Sem 2-3) : Business Logic ⏳
- **Phase 3** (Sem 3-4) : Testing ⏳
- **Phase 4** (Sem 4-5) : Frontend ⏳
- **Phase 5** (Sem 5-6) : Polish & Deploy ⏳

Voir [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) pour détails.

---

**Last Updated** : 14 janvier 2026  
**Version** : 1.0.0  
**Status** : 🟡 In Development  

