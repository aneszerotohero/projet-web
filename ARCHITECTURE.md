# 🏛️ Architecture Système : 3 Couches

## 📐 Vue d'ensemble architecture

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         PRESENTATION LAYER (UI)                              ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                 React Components (Inertia)                              │ ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ ║
║  │  │Dashboard Page│  │NoteForm Modal│  │Ranking Podium│                 │ ║
║  │  │              │  │              │  │              │                 │ ║
║  │  │ - Tables     │  │ - Validation │  │ - Animations │                 │ ║
║  │  │ - Filters    │  │ - Upload CSV │  │ - Top 3 Data │                 │ ║
║  │  │ - Pagination │  │ - Error msgs │  │              │                 │ ║
║  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                    ↓ HTTP (REST API / Inertia Props)                         ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                      BUSINESS LOGIC LAYER (Backend)                           ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                    Laravel Controllers                                   │ ║
║  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │ ║
║  │  │NoteController    │  │AbsenceController │  │FilterController  │     │ ║
║  │  │ - storeSingle    │  │ - index          │  │ - rankings       │     │ ║
║  │  │ - storeBulk      │  │ - store          │  │ - searchStudents │     │ ║
║  │  │ - update         │  │ - destroy        │  │ - filter (AJAX)  │     │ ║
║  │  │ - destroy        │  │ - filter         │  │                  │     │ ║
║  │  └──────────────────┘  └──────────────────┘  └──────────────────┘     │ ║
║  │                                                                          │ ║
║  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │ ║
║  │  │StudentController │  │AdminController   │  │API\FilterControl │     │ ║
║  │  │ - dashboard      │  │ - dashboard      │  │ - rankings (JSON)│     │ ║
║  │  │ - absences       │  │ - listStudents   │  │                  │     │ ║
║  │  └──────────────────┘  └──────────────────┘  └──────────────────┘     │ ║
║  │                                                                          │ ║
║  │  ┌─────────────────────────────────────────────────────────────┐       │ ║
║  │  │           Service Layer (Business Logic)                    │       │ ║
║  │  │  ┌──────────────────────────────────────────────────────┐  │       │ ║
║  │  │  │RankingService                                        │  │       │ ║
║  │  │  │ - calculateRanking(option_id, semestre)             │  │       │ ║
║  │  │  │ - getPodium(option_id, semestre)                    │  │       │ ║
║  │  │  │ - cacheInvalidate()                                 │  │       │ ║
║  │  │  └──────────────────────────────────────────────────────┘  │       │ ║
║  │  │  ┌──────────────────────────────────────────────────────┐  │       │ ║
║  │  │  │NoteService                                           │  │       │ ║
║  │  │  │ - createBulk(notes_array, transaction)              │  │       │ ║
║  │  │  │ - validate(note_data)                               │  │       │ ║
║  │  │  └──────────────────────────────────────────────────────┘  │       │ ║
║  │  │  ┌──────────────────────────────────────────────────────┐  │       │ ║
║  │  │  │FilterService                                        │  │       │ ║
║  │  │  │ - applyFilters(query, filters_array)                │  │       │ ║
║  │  │  │ - sort(query, sort_by)                              │  │       │ ║
║  │  │  │ - paginate(query, page, limit)                      │  │       │ ║
║  │  │  └──────────────────────────────────────────────────────┘  │       │ ║
║  │  └─────────────────────────────────────────────────────────────┘       │ ║
║  │                                                                          │ ║
║  │  ┌─────────────────────────────────────────────────────────┐           │ ║
║  │  │           Middleware Layer                             │           │ ║
║  │  │  ┌──────────────────────────────────────────────────┐  │           │ ║
║  │  │  │AuthMiddleware  : user auth check                │  │           │ ║
║  │  │  │AuthAdmin       : user.role == 'admin'           │  │           │ ║
║  │  │  │AuthEleve       : user.role == 'élève'           │  │           │ ║
║  │  │  │CurrentSemester : inject current_semestre        │  │           │ ║
║  │  │  └──────────────────────────────────────────────────┘  │           │ ║
║  │  └─────────────────────────────────────────────────────────┘           │ ║
║  │                                                                          │ ║
║  │  ┌─────────────────────────────────────────────────────────┐           │ ║
║  │  │           Observers & Events                           │           │ ║
║  │  │  ┌──────────────────────────────────────────────────┐  │           │ ║
║  │  │  │NoteObserver                                      │  │           │ ║
║  │  │  │ - created(Note) → recalc Moyenne                │  │           │ ║
║  │  │  │ - updated(Note) → recalc Moyenne                │  │           │ ║
║  │  │  │ - deleted(Note) → recalc/delete Moyenne         │  │           │ ║
║  │  │  │ - EVENT: Moyenne updated → Cache invalidated    │  │           │ ║
║  │  │  └──────────────────────────────────────────────────┘  │           │ ║
║  │  └─────────────────────────────────────────────────────────┘           │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                ↓ Query Builder / Eloquent ORM                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                       DATA ACCESS LAYER (ORM/DB)                             ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                     Eloquent Models                                      │ ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ ║
║  │  │Student Model │  │Note Model    │  │Moyenne Model │                 │ ║
║  │  │              │  │              │  │              │                 │ ║
║  │  │Relations:    │  │Relations:    │  │Relations:    │                 │ ║
║  │  │-option()     │  │-student()    │  │-student()    │                 │ ║
║  │  │-notes()      │  │-module()     │  │              │                 │ ║
║  │  │-moyennes()   │  │-coef()       │  │              │                 │ ║
║  │  │-absences()   │  │              │  │              │                 │ ║
║  │  │              │  │              │  │              │                 │ ║
║  │  │Scopes:       │  │              │  │              │                 │ ║
║  │  │-search()     │  │              │  │              │                 │ ║
║  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ ║
║  │                                                                          │ ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ ║
║  │  │Option Model  │  │Absence Model │  │Module Model  │                 │ ║
║  │  │              │  │              │  │              │                 │ ║
║  │  │Relations:    │  │Relations:    │  │Relations:    │                 │ ║
║  │  │-specialite() │  │-student()    │  │-notes()      │                 │ ║
║  │  │-students()   │  │-module()     │  │-absences()   │                 │ ║
║  │  │              │  │              │  │-moduleCoefs()│                 │ ║
║  │  │              │  │Traits:       │  │              │                 │ ║
║  │  │              │  │-SoftDeletes  │  │              │                 │ ║
║  │  │              │  │              │  │              │                 │ ║
║  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ ║
║  │                                                                          │ ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ ║
║  │  │Specialite    │  │Coef Model    │  │ModuleCoef    │                 │ ║
║  │  │              │  │              │  │(Pivot)       │                 │ ║
║  │  │Relations:    │  │Relations:    │  │Relations:    │                 │ ║
║  │  │-options()    │  │-moduleCoefs()│  │-module()     │                 │ ║
║  │  │              │  │-notes()      │  │-coef()       │                 │ ║
║  │  │              │  │              │  │              │                 │ ║
║  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ ║
║  │                                                                          │ ║
║  │  ┌────────────────────────────────────────────────────────┐            │ ║
║  │  │                   Query Scopes                         │            │ ║
║  │  │  • Student::search($term)                              │            │ ║
║  │  │  • Note::whereHas('module', fn => $q->where(...))     │            │ ║
║  │  │  • Absence::withTrashed() / onlyTrashed()             │            │ ║
║  │  │  • Cache decorators pour Rankings                      │            │ ║
║  │  └────────────────────────────────────────────────────────┘            │ ║
║  │                                                                          │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
║                       ↓ SQL Query (Eloquent Builder)                        ║
║  ┌─────────────────────────────────────────────────────────────────────────┐ ║
║  │                        MySQL Database                                    │ ║
║  │   ┌──────┬─────────┬───────────┬────────┬──────────┬──────────┐        │ ║
║  │   │users │students │specialite │options │notes     │moyennes  │...    │ ║
║  │   │      │         │           │        │          │          │        │ ║
║  │   └──────┴─────────┴───────────┴────────┴──────────┴──────────┘        │ ║
║  │                        ↓ Transactions, Indexes                          │ ║
║  │   [Redis Cache Layer] - Rankings TTL=3600s, Search TTL=300s            │ ║
║  └─────────────────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Détail des 3 Couches

### **COUCHE 1 : PRESENTATION (Frontend)**

#### **Responsabilités**
- Affichage des données à l'utilisateur (React)
- Collecte et validation input utilisateur (côté client)
- Interactions utilisateur (clics, soumission formulaires)
- Gestion de l'état UI (loading, errors, modals)
- Animations et UX (Framer Motion)

#### **Composants Clés**

##### **Pages React**
```
resources/js/Pages/
├── Auth/
│   └── Login.jsx                    # Form login, POST /login
├── Eleve/
│   ├── Dashboard.jsx                # Tableau notes, moyennes, classement
│   └── Absences.jsx                 # Liste absences personnelles
└── Admin/
    ├── Dashboard.jsx                # Vue globale, filtres, podium
    ├── Notes/
    │   ├── IndexNotes.jsx            # Liste notes
    │   ├── CreateSingle.jsx          # Form ajout une note
    │   └── CreateBulk.jsx            # Upload CSV notes
    ├── Absences/
    │   ├── IndexAbsences.jsx         # Liste toutes absences
    │   └── CreateAbsence.jsx         # Form absence
    └── Students/
        ├── IndexStudents.jsx         # Liste étudiants
        └── ShowStudent.jsx           # Détail étudiant
```

##### **Composants Réutilisables**
```
resources/js/Components/
├── Table.jsx                        # Table générique (notes, étudiants, absences)
├── Card.jsx                         # Card container
├── Modal.jsx                        # Modal générique (form, confirmation)
├── Filter.jsx                       # Filtres avancés (multi-select, range)
├── Podium.jsx                       # Top 3 avec animations (🥇🥈🥉)
├── Button.jsx                       # Button styles (primary, danger, etc.)
├── Form/
│   ├── TextInput.jsx
│   ├── SelectInput.jsx
│   ├── DateInput.jsx
│   ├── Checkbox.jsx
│   └── TextArea.jsx
├── Alert/
│   ├── Toast.jsx                    # Notifications success/error
│   └── ErrorMessage.jsx             # Messages validation
└── Loading.jsx                      # Spinner / Skeleton
```

##### **Hooks Personnalisés**
```
resources/js/Hooks/
├── useFetch.js                      # GET requests + caching
├── useForm.js                       # Form state management
├── useFilter.js                     # Filtres dynamiques (debounce AJAX)
├── useRanking.js                    # Classements (cache local)
└── usePagination.js                 # Pagination state
```

#### **Communication Backend**
- **Framework** : Inertia.js (Server-side rendering)
  - Props passées du contrôleur au composant
  - Formulaires -> POST/PUT/DELETE requests
- **APIs JSON** (pour actions complexes) :
  - `POST /api/admin/filter` → Filtres AJAX
  - `GET /api/admin/rankings` → Classements
  - `GET /api/students/search` → Search autocomplete

#### **Validation Côté Client**
```javascript
// Exemple React
import { useForm } from "react-hook-form";

export default function CreateNote() {
  const { register, handleSubmit, errors } = useForm({
    defaultValues: { note: "", studentId: "" }
  });

  const onSubmit = async (data) => {
    // Validation locale
    if (data.note < 0 || data.note > 20) {
      setError("Note doit être entre 0 et 20");
      return;
    }
    
    // POST au backend
    const res = await axios.post("/admin/notes", data);
    if (res.status === 201) toast.success("Note ajoutée");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("note")} placeholder="Note (0-20)" />
      {errors.note && <span>{errors.note.message}</span>}
      <button type="submit">Ajouter</button>
    </form>
  );
}
```

---

### **COUCHE 2 : BUSINESS LOGIC (Backend - Laravel)**

#### **Responsabilités**
- Validation métier (règles fonctionnelles)
- Calcul des moyennes, classements
- Gestion des transactions BD
- Application des middlewares et observateurs
- Génération des réponses (JSON, Inertia props)

#### **Structure**

##### **Controllers**
```php
app/Http/Controllers/
├── StudentDashboardController.php
│   └── index()                      # Dashboard étudiant (ses notes + moyennes + rang)
├── AdminDashboardController.php
│   ├── index()                      # Dashboard admin (filtres, podium, paginated list)
│   └── listStudents()               # JSON pour AJAX
├── NoteController.php
│   ├── storeSingle()                # POST /admin/notes (1 note)
│   ├── storeBulk()                  # POST /admin/notes/bulk (CSV)
│   ├── update()                     # PUT /admin/notes/{id}
│   ├── destroy()                    # DELETE /admin/notes/{id}
│   └── index()                      # GET /admin/notes
├── AbsenceController.php
│   ├── index()                      # GET /eleve/absences (ou /admin/absences)
│   ├── store()                      # POST /admin/absences
│   ├── update()                     # PUT /admin/absences/{id}
│   ├── destroy()                    # DELETE /admin/absences/{id} (soft delete)
│   └── filter()                     # POST /admin/absences/filter (AJAX)
├── Api/FilterController.php
│   ├── rankings()                   # GET /api/admin/rankings (JSON)
│   ├── searchStudents()             # GET /api/students/search (autocomplete)
│   └── filter()                     # POST /api/admin/filter (advanced filters)
└── StudentController.php
    ├── index()                      # Liste étudiants (admin)
    └── show()                       # Détail étudiant
```

##### **Services**
```php
app/Services/
├── RankingService.php
│   ├── calculateRanking($optionId, $semestre) : Collection
│   ├── getPodium($optionId, $semestre) : array [top3]
│   └── cacheInvalidate()
├── NoteService.php
│   ├── createBulk($notes, $transaction)
│   ├── validate($noteData) : bool
│   └── handleObserverTrigger()
├── FilterService.php
│   ├── applyFilters($query, $filters)
│   ├── sort($query, $sortBy)
│   └── paginate($query, $page, $limit)
└── AcademicService.php
    ├── getCurrentSemester() : int
    └── getStudentCohort($student) : int
```

##### **Middleware**
```php
app/Http/Middleware/
├── AuthAdmin.php
│   └── handle($request) → check role === 'admin'
├── AuthEleve.php
│   └── handle($request) → check role === 'élève'
├── CurrentSemester.php
│   └── handle($request) → inject $request->current_semestre
└── ValidateRequest.php (optionnel)
    └── handle($request) → validate input
```

##### **Observers**
```php
app/Observers/
└── NoteObserver.php
    ├── created(Note $note)          # Déclenché après INSERT
    │   └── $this->recalc($note)    # Recalc moyenne
    ├── updated(Note $note)          # Déclenché après UPDATE
    │   └── $this->recalc($note)
    └── deleted(Note $note)          # Déclenché après DELETE
        └── $this->recalc($note)     # Ou delete moyenne si pas de notes
        
    Enregistré dans : AppServiceProvider::boot()
    Note::observe(NoteObserver::class);
```

##### **Validation Rules**
```php
// Exemple NoteController@storeSingle
$validated = $request->validate([
    'student_id'  => 'required|exists:students,id',
    'module_id'   => 'required|exists:modules,id',
    'coef_id'     => 'required|exists:coef,id',
    'note'        => 'required|numeric|between:0,20',
]);

// Exemple BulkCreate
foreach ($notes as $n) {
    $validator->validate([
        'matricule' => 'required|exists:users,matricule',
        'note'      => 'numeric|between:0,20',
    ]);
}
```

##### **Error Handling**
```php
try {
    DB::transaction(function () {
        // Bulk create notes
        foreach ($notes as $n) {
            Note::create($n);
            // Observer::created() déclenché
        }
    });
    return response()->json(['message' => 'Succès'], 201);
} catch (Exception $e) {
    Log::error('Note creation failed', ['error' => $e->getMessage()]);
    return response()->json(['message' => 'Erreur serveur'], 500);
}
```

#### **Request/Response Flow**

```
Frontend (React)
    ↓ POST /admin/notes { student_id, module_id, coef_id, note }
    ↓ Inertia / Axios
    ↓
Backend (Laravel)
    ├─ Route → NoteController@storeSingle()
    ├─ Middleware : [auth, auth.admin, current.semester]
    │
    ├─ Validation :
    │   └─ $request->validate([...])
    │
    ├─ Service layer :
    │   └─ NoteService::validate($data)
    │
    ├─ Model::create() :
    │   └─ DB INSERT into notes
    │
    ├─ Observer::created() :
    │   ├─ Fetch notes for student+semestre
    │   ├─ Calculate weighted average
    │   ├─ Moyenne::updateOrCreate()
    │   └─ Cache::forget('ranking:...')  # Invalidate cache
    │
    └─ Response :
        ├─ JSON 201 : { message: "Note ajoutée", note: {...}, moyenne: {...} }
        └─ OR Inertia redirect + toast
    ↓
Frontend (React)
    └─ Update UI, show success toast
```

---

### **COUCHE 3 : DATA ACCESS (ORM / Database)**

#### **Responsabilités**
- Requêtes BD (SELECT, INSERT, UPDATE, DELETE)
- Relations entre modèles
- Transactions ACID
- Caching (Redis)
- Indexation BD

#### **Models (Eloquent)**

##### **Model Relationships**
```php
namespace App\Models;

class Student extends Model {
    public function option() {
        return $this->belongsTo(Option::class);
    }
    
    public function notes() {
        return $this->hasMany(Note::class);
    }
    
    public function moyennes() {
        return $this->hasMany(Moyenne::class);
    }
    
    public function absences() {
        return $this->hasMany(Absence::class);
    }
    
    public function user() {
        return $this->hasOne(User::class, 'student_id');
    }
    
    // Scopes
    public function scopeSearch($query, $term) {
        return $query->where('nom', 'like', "%$term%")
                     ->orWhere('prenom', 'like', "%$term%");
    }
}

class Note extends Model {
    public function student() {
        return $this->belongsTo(Student::class);
    }
    
    public function module() {
        return $this->belongsTo(Module::class);
    }
    
    public function coef() {
        return $this->belongsTo(Coef::class);
    }
}

class Moyenne extends Model {
    public function student() {
        return $this->belongsTo(Student::class);
    }
}

class Absence extends Model {
    use SoftDeletes;  // ← Soft delete support
    
    public function student() {
        return $this->belongsTo(Student::class);
    }
    
    public function module() {
        return $this->belongsTo(Module::class);
    }
}
```

##### **Query Examples**

```php
// Moyenne d'Ali (student_id=1) en S1
$moyenne = Moyenne::where('student_id', 1)
                   ->where('semestre', 1)
                   ->first();

// Top 3 dans Option Data Science (option_id=2)
$podium = Moyenne::join('students', 'moyennes.student_id', '=', 'students.id')
                  ->where('students.option_id', 2)
                  ->where('moyennes.semestre', 1)
                  ->orderBy('moyenne', 'desc')
                  ->limit(3)
                  ->get();

// Tous les étudiants avec moyenne calculée (non NULL)
$withAverage = Student::join('moyennes', 'students.id', '=', 'moyennes.student_id')
                       ->where('moyennes.semestre', 1)
                       ->select('students.*', 'moyennes.moyenne')
                       ->orderBy('moyennes.moyenne', 'desc')
                       ->paginate(50);

// Absences d'un étudiant (inclut soft-deleted)
$allAbsences = Absence::where('student_id', 1)
                       ->withTrashed()
                       ->orderBy('date_absence', 'desc')
                       ->get();

// Absences non supprimées
$activeAbsences = Absence::where('student_id', 1)
                          ->orderBy('date_absence', 'desc')
                          ->get();
```

#### **Database Operations**

##### **Transactions (Bulk Insert)**
```php
DB::transaction(function () {
    foreach ($notesArray as $noteData) {
        Note::create($noteData);
        // NoteObserver::created() déclenché DANS la transaction
    }
    // Si une exception → rollback automatique
    // Toutes moyennes recalculées ou aucune
});
```

##### **Indexation**
```sql
-- Critical indexes (MANDATORY)
CREATE INDEX idx_notes_student_id ON notes(student_id);
CREATE INDEX idx_notes_student_semestre ON notes(student_id, module_id);
CREATE INDEX idx_moyennes_student_id_semestre ON moyennes(student_id, semestre);
CREATE INDEX idx_moyennes_moyenne ON moyennes(moyenne DESC);
CREATE INDEX idx_absence_student_id ON absence(student_id);
CREATE INDEX idx_students_option_id ON students(option_id);
```

#### **Caching Strategy**

```php
// Exemple : Cache des classements
use Illuminate\Support\Facades\Cache;

public function getPodium($optionId, $semestre) {
    $cacheKey = "ranking:podium:{$optionId}:{$semestre}";
    
    return Cache::remember($cacheKey, 3600, function () use ($optionId, $semestre) {
        return Moyenne::join('students', ...)
                      ->where('students.option_id', $optionId)
                      ->where('moyennes.semestre', $semestre)
                      ->orderBy('moyennes.moyenne', 'desc')
                      ->limit(3)
                      ->get();
    });
}

// Invalidation après modif
// Dans NoteObserver::recalc()
Cache::forget("ranking:podium:{$optionId}:{$semestre}");
```

#### **Soft Deletes**

```php
// Eloquent SoftDeletes trait
use Illuminate\Database\Eloquent\SoftDeletes;

class Absence extends Model {
    use SoftDeletes;
    
    protected $dates = ['deleted_at'];
}

// Requêtes
Absence::where(...)->get();              // Exclut soft-deleted
Absence::where(...)->withTrashed()->get();   // Inclut soft-deleted
Absence::where(...)->onlyTrashed()->get();   // SEULEMENT soft-deleted

// Restore
$absence->restore();

// Hard delete
$absence->forceDelete();
```

---

## 🔄 Flux d'Exécution : Exemple Complet

### **Cas : Ajout d'une note → Recalcul moyenne → Classement mis à jour**

```
1. FRONTEND (React)
   ├─ User clicks "Ajouter Note"
   ├─ Modal form : Student=Ali, Module=Math, Coef=Exam, Note=15
   ├─ POST /admin/notes { student_id: 1, module_id: 1, coef_id: 4, note: 15 }
   └─ Submit via axios (or Inertia.post)

2. BACKEND (Laravel)
   ├─ Route: POST /admin/notes → NoteController@storeSingle()
   ├─ Middleware chain:
   │  ├─ Auth : user logged in? ✓
   │  ├─ AuthAdmin : user.role == 'admin'? ✓
   │  └─ CurrentSemester : inject current_semestre = 1 (or 4)
   │
   ├─ NoteController::storeSingle():
   │  ├─ Validate input:
   │  │  ├─ student_id exists? ✓
   │  │  ├─ module_id exists? ✓
   │  │  ├─ coef_id exists? ✓
   │  │  ├─ note between 0-20? ✓
   │  │  └─ Pass validation
   │  │
   │  ├─ NoteService::validate($data) ✓
   │  │
   │  ├─ Note::create($validated)
   │  │  └─ INSERT into notes (student_id=1, module_id=1, coef_id=4, note=15)
   │  │
   │  └─ NoteObserver::created() triggered:
   │     │
   │     └─ recalc(Note $note):
   │        ├─ module = Module::find(1) → semestre=1
   │        ├─ Fetch all notes for Ali in S1:
   │        │  └─ Notes: [
   │        │       {module_id:1, coef_id:1, note:13},  // TD
   │        │       {module_id:1, coef_id:2, note:14},  // TP
   │        │       {module_id:1, coef_id:4, note:15}   // EXAM (NEW)
   │        │     ]
   │        │
   │        ├─ Fetch coefs:
   │        │  └─ coef_values: [1, 1, 2]  // TD=1, TP=1, Exam=2
   │        │
   │        ├─ Calculate average:
   │        │  ├─ sum = 13*1 + 14*1 + 15*2 = 56
   │        │  ├─ weights = 1+1+2 = 4
   │        │  └─ moyenne = 56/4 = 14.00
   │        │
   │        ├─ Moyenne::updateOrCreate(
   │        │    ['student_id' => 1, 'semestre' => 1],
   │        │    ['moyenne' => 14.00]
   │        │  )
   │        │  └─ UPDATE moyennes SET moyenne=14.00, updated_at=NOW()
   │        │     WHERE student_id=1 AND semestre=1
   │        │
   │        └─ Cache::forget("ranking:*:1:1")  // Invalidate all rankings for S1
   │
   ├─ Response: HTTP 201 Created
   │  └─ JSON: {
   │       "message": "Note ajoutée avec succès",
   │       "note": { id, student_id, module_id, coef_id, note },
   │       "moyenne": { id, student_id, semestre, moyenne }
   │     }

3. FRONTEND (React)
   ├─ Receive response status 201
   ├─ Show success toast : "Note ajoutée ✓"
   ├─ Refresh dashboard
   │  └─ Moyenne S1 : 14.00 (updated from 13.50)
   └─ Ranking updated:
      ├─ Ali now rank 3 (was rank 5)
      └─ Podium updated: 🥇 Fatima (14.50) 🥈 Karim (14.20) 🥉 Ali (14.00)

4. DATABASE STATE (FINAL)
   ├─ notes table:
   │  └─ (1, 1, 1, 13) [TD]
   │     (1, 1, 2, 14) [TP]
   │     (1, 1, 4, 15) [EXAM - NEW]
   │
   ├─ moyennes table:
   │  └─ (1, 1, 14.00) [UPDATED]
   │
   └─ Cache (Redis):
      └─ ranking:podium:2:1 = [Fatima, Karim, Ali]
```

---

## 🏛️ Principes Architecturaux

### **1. Separation of Concerns (SoC)**
- **Presentation** : UI logic, forms, state
- **Business** : Validations, calculations, business rules
- **Data** : BD queries, ORM, cache

### **2. DRY (Don't Repeat Yourself)**
- Services pour logic réutilisable
- Scopes pour queries communes
- Components for UI repetition

### **3. SOLID Principles**
- **Single Responsibility** : Each class has one job
- **Open/Closed** : Open for extension (Observers), closed for modification
- **Liskov** : Models follow contracts (relationships)
- **Interface Segregation** : Focused interfaces
- **Dependency Inversion** : Inject services, not hardcode

### **4. Atomicity**
- Observer runs WITHIN transaction
- Moyenne always consistent with notes
- Cache invalidation automatic

### **5. Error Handling**
- Try/Catch around DB operations
- Meaningful error messages
- Logging for debugging

---

## 📊 Scalability Considerations

### **Performance Optimizations**
1. **Indexes** : Critical indexes on FK, semestre, moyenne
2. **Pagination** : Always paginate large results
3. **Caching** : Redis for rankings, search results
4. **Lazy Loading** : Don't fetch all relations by default
5. **Eager Loading** : Use `with()` for known relations

### **Concurrency**
- DB Transactions for bulk operations
- Optimistic locking (optional)
- Queue for heavy operations (bulk import)

### **Future Enhancements**
1. **Jobs Queue** : Process bulk uploads asynchronously
2. **API Rate Limiting** : Prevent abuse
3. **Monitoring** : Sentry, New Relic
4. **Load Balancing** : Horizontal scaling
5. **Microservices** : Separate auth, notes, rankings services

