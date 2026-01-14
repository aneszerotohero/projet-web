import React, { useState, useCallback, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Download, Plus, Search, Filter, Calendar, FileText, X,
    MoreHorizontal, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, Trash2, Pencil, ChevronDown
} from 'lucide-react';

export default function NotesAdmin({ meta = {}, res = {}, stats = {}, filters: initialFilters = {}, available_filters = {} }) {
    const { flash } = usePage().props;

    // Safe defaults
    const safeMeta = meta || {};
    const safeRes = res || {};
    const safeStats = stats || {};
    const notes = safeRes.data || [];
    const modules = safeMeta.modules || [];
    const coefs = safeMeta.coefs || [];
    const students = safeMeta.students || [];
    const safeAvailableFilters = available_filters || {};
    const specialitesByLibelle = safeAvailableFilters.specialites_by_libelle || {};
    const specialites = safeAvailableFilters.specialites || [];
    const options = safeAvailableFilters.options || [];
    const years = safeAvailableFilters.years || [1, 2, 3];

    // Format notes for display
    const formattedNotes = notes.map(note => {
        const student = note.student || {};
        const module = note.module || {};
        const coef = note.coef || {};
        const createdAt = note.created_at ? new Date(note.created_at) : new Date();

        return {
            id: note.id,
            student_id: student.id,
            module_id: module.id,
            coef_id: coef.id,
            student: {
                name: `${student.prenom || ''} ${student.nom || ''}`.trim() || 'N/A',
                id: student.id || 'N/A',
                avatar: null
            },
            module: module.libelle || 'N/A',
            type: coef.libelle || 'N/A',
            grade: note.note || 0,
            coeff: coef.coef || 0,
            date: createdAt.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' }),
            rawNote: note // Keep original for editing
        };
    });

    const [filters, setFilters] = useState(initialFilters || { search: '', module_id: '', semester: '', coef_id: '', annee: '', specialite_id: '', option_id: '' });
    const [openDropdown, setOpenDropdown] = useState(null);
    const currentYear = filters.annee || null;
    const currentSpecialiteId = filters.specialite_id || null;
    const currentOptionId = filters.option_id || null;

    // Get filtered options based on selected specialite
    const filteredOptions = currentSpecialiteId
        ? options.filter(opt => {
            const specialite = specialites.find(s => s.id == currentSpecialiteId);
            return specialite && opt.specialite_id == currentSpecialiteId;
        })
        : options;
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ student_id: '', module_id: '', coef_id: '', note: '' });
    const [errors, setErrors] = useState({});
    const [studentSearch, setStudentSearch] = useState('');
    const [studentSearchResults, setStudentSearchResults] = useState([]);
    const [showStudentResults, setShowStudentResults] = useState(false);
    const [studentSearchTimeout, setStudentSearchTimeout] = useState(null);
    const [availableModules, setAvailableModules] = useState(modules); // Modules filtered by student

    // Handle filter changes
    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Build query params
        const params = {};
        if (newFilters.search) params.search = newFilters.search;
        if (newFilters.module_id) params.module_id = newFilters.module_id;
        if (newFilters.semester) params.semester = newFilters.semester;
        if (newFilters.coef_id) params.coef_id = newFilters.coef_id;
        if (newFilters.annee) params.annee = newFilters.annee;
        if (newFilters.specialite_id) params.specialite_id = newFilters.specialite_id;
        if (newFilters.option_id) params.option_id = newFilters.option_id;

        router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
    }, [filters]);

    // Handle search with debounce
    const [searchTimeout, setSearchTimeout] = useState(null);
    const handleSearch = useCallback((value) => {
        const newFilters = { ...filters, search: value };
        setFilters(newFilters);

        if (searchTimeout) clearTimeout(searchTimeout);

        const timeout = setTimeout(() => {
            const params = {};
            if (newFilters.search) params.search = newFilters.search;
            if (newFilters.module_id) params.module_id = newFilters.module_id;
            if (newFilters.semester) params.semester = newFilters.semester;
            if (newFilters.coef_id) params.coef_id = newFilters.coef_id;
            if (newFilters.annee) params.annee = newFilters.annee;
            if (newFilters.specialite_id) params.specialite_id = newFilters.specialite_id;
            if (newFilters.option_id) params.option_id = newFilters.option_id;
            router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
        }, 500);

        setSearchTimeout(timeout);
    }, [filters, searchTimeout]);

    // Handle student search
    const handleStudentSearch = useCallback((value) => {
        setStudentSearch(value);
        setShowStudentResults(value.length >= 2);

        if (studentSearchTimeout) clearTimeout(studentSearchTimeout);

        if (value.length < 2) {
            setStudentSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/students/search?q=${encodeURIComponent(value)}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                });
                if (response.ok) {
                    const data = await response.json();
                    setStudentSearchResults(data);
                }
            } catch (error) {
                console.error('Error searching students:', error);
                setStudentSearchResults([]);
            }
        }, 300);

        setStudentSearchTimeout(timeout);
    }, [studentSearchTimeout]);

    // Select student from search results
    const selectStudent = async (student) => {
        setFormData({ ...formData, student_id: student.id, module_id: '' }); // Reset module when student changes
        setStudentSearch(`${student.prenom} ${student.nom} (${student.matricule})`);
        setShowStudentResults(false);

        // Load modules for this student
        try {
            const response = await fetch(`/api/students/${student.id}/modules`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableModules(data.modules || []);
            } else {
                setAvailableModules(modules); // Fallback to all modules
            }
        } catch (error) {
            console.error('Error loading modules for student:', error);
            setAvailableModules(modules); // Fallback to all modules
        }
    };

    // Open modal for create
    const openCreateModal = () => {
        setEditingNote(null);
        setFormData({ student_id: '', module_id: '', coef_id: '', note: '' });
        setStudentSearch('');
        setStudentSearchResults([]);
        setShowStudentResults(false);
        setErrors({});
        setAvailableModules(modules); // Reset to all modules
        setShowModal(true);
    };

    // Open modal for edit
    const openEditModal = async (note) => {
        setEditingNote(note.rawNote);
        const student = students.find(s => s.id === note.student_id);
        setFormData({
            student_id: note.student_id || '',
            module_id: note.module_id || '',
            coef_id: note.coef_id || '',
            note: note.grade || ''
        });
        setStudentSearch(student ? `${student.prenom} ${student.nom}` : '');
        setStudentSearchResults([]);
        setShowStudentResults(false);
        setErrors({});

        // Load modules for this student
        if (note.student_id) {
            try {
                const response = await fetch(`/api/students/${note.student_id}/modules`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                });
                if (response.ok) {
                    const data = await response.json();
                    setAvailableModules(data.modules || []);
                } else {
                    setAvailableModules(modules);
                }
            } catch (error) {
                console.error('Error loading modules for student:', error);
                setAvailableModules(modules);
            }
        } else {
            setAvailableModules(modules);
        }

        setShowModal(true);
    };

    const handleSubmit = (e) => {
        // 1. Bloquer TOUT comportement par défaut
        e.preventDefault();
        e.stopPropagation();

        setErrors({});

        // DEBUG : On vérifie ce qui est calculé JUSTE avant l'appel
        const isEdit = editingNote && editingNote.id;
        const targetUrl = isEdit ? `/admin/notes/${editingNote.id}` : '/admin/notes/single';

        console.log("--- LOG DE DÉBOGAGE ---");
        console.log("Mode:", isEdit ? "ÉDITION" : "CRÉATION");
        console.log("URL Cible:", targetUrl);
        console.log("Payload:", formData);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Succès Inertia !");
                setShowModal(false);
                setEditingNote(null);
                setFormData({ student_id: '', module_id: '', coef_id: '', note: '' });
                setStudentSearch('');
                setStudentSearchResults([]);
                setShowStudentResults(false);
            },
            onError: (errs) => {
                console.error("Erreurs Inertia:", errs);
                setErrors(errs);
                if (errs?.message?.includes('419')) window.location.reload();
            }
        };

        // 2. Exécution des appels
        if (isEdit) {
            // On utilise l'URL en dur calculée au-dessus
            router.patch(targetUrl, formData, options);
        } else {
            router.post('/admin/notes/single', formData, options);
        }
    };
    // Handle delete
    const handleDelete = (noteId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

        router.delete(`/admin/notes/${noteId}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // No need to reload - the redirect from server will handle it
            },
            onError: (errs) => {
                // If CSRF error, reload the page to get a new token
                if (errs.message && (errs.message.includes('419') || errs.message.includes('CSRF'))) {
                    window.location.reload();
                } else {
                    alert('Erreur lors de la suppression: ' + (errs.message || 'Erreur inconnue'));
                }
            }
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({ search: '', module_id: '', semester: '', coef_id: '', annee: '', specialite_id: '', option_id: '' });
        router.get('/admin/notes/manage', {}, { preserveState: true });
    };

    // Apply filters helper
    const applyFilters = useCallback((newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        const params = {};
        // Build params avoiding collisions
        if (updatedFilters.search) params.search = updatedFilters.search;
        if (updatedFilters.module_id) params.module_id = updatedFilters.module_id;
        if (updatedFilters.semester) params.semester = updatedFilters.semester;
        if (updatedFilters.coef_id) params.coef_id = updatedFilters.coef_id;

        // Year filter (independent)
        if (updatedFilters.annee !== undefined && updatedFilters.annee !== null) {
            params.annee = updatedFilters.annee;
        }

        // Speciality filter (independent, but when year is set, auto-select matching)
        if (updatedFilters.specialite_id !== undefined) {
            if (updatedFilters.specialite_id === null) {
                params.specialite_id = '';
            } else {
                params.specialite_id = updatedFilters.specialite_id;
            }
        }

        // Option filter (depends on specialite)
        if (updatedFilters.option_id !== undefined) {
            if (updatedFilters.option_id === null) {
                params.option_id = '';
            } else {
                params.option_id = updatedFilters.option_id;
            }
        }

        router.get('/admin/notes/manage', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['res', 'stats', 'filters', 'available_filters']
        });
    }, [filters]);

    // Dropdown component
    const Dropdown = ({ label, value, isOpen, onToggle, children }) => (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-700 transition-colors whitespace-nowrap min-w-[120px]"
            >
                <span className="truncate max-w-[180px]">{label}: {value}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenDropdown(null)}></div>
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-[101]">
                        {children}
                    </div>
                </>
            )}
        </div>
    );

    const KpiCard = ({ title, value, trend, trendType, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-gray-500 font-bold text-sm">{title}</h3>
                <div className={`p-2 rounded-lg ${color === 'green' ? 'bg-green-50 text-green-600' : color === 'red' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="z-10">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-black text-gray-900">{value}</h2>
                    {title === 'Average GPA' && <span className="text-gray-400 font-bold text-lg">/20</span>}
                </div>
                {trend && (
                    <div className={`text-xs font-bold mt-2 ${trendType === 'up' || trendType === 'down_good' ? 'text-green-600' : 'text-red-500'}`}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            // You can add a toast notification here if needed
            console.log('Success:', flash.success);
        }
    }, [flash]);

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen font-sans">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium">
                        {flash.success}
                    </div>
                )}
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Notes</h1>
                        <p className="text-gray-500 mt-1 text-sm">Gérez les notes des étudiants, les coefficients et les dossiers académiques.</p>
                    </div>
                    <div className="flex gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-sm cursor-pointer">
                            <FileText className="w-4 h-4" />
                            Importer CSV
                            <input
                                type="file"
                                accept=".csv,.txt"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        router.post('/admin/notes/import', formData, {
                                            forceFormData: true,
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                router.reload({ only: ['res', 'stats'], preserveScroll: true });
                                            },
                                            onError: (errors) => {
                                                console.error('Import errors:', errors);
                                                if (errors.message && (errors.message.includes('419') || errors.message.includes('CSRF'))) {
                                                    window.location.reload();
                                                }
                                            }
                                        });
                                    }
                                }}
                            />
                        </label>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter une Note
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KpiCard title="Moyenne générale" value={safeStats.average_gpa?.value || '0.0'} trend={safeStats.average_gpa?.trend || null} trendType={safeStats.average_gpa?.trend_type || 'up'} icon={TrendingUp} color="green" />
                    <KpiCard title="Élèves en échec" value={safeStats.failing_students?.value || '0'} trend={safeStats.failing_students?.trend || null} trendType={safeStats.failing_students?.trend_type || 'down_good'} icon={AlertTriangle} color="red" />
                    <KpiCard title="Notes saisies aujourd'hui" value={safeStats.grades_today?.value || '0'} trend={safeStats.grades_today?.trend || null} trendType={safeStats.grades_today?.trend_type || 'up'} icon={Calendar} color="blue" />
                </div>

                {/* Filters */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Filtres :</span>

                            {/* Year Dropdown */}
                            <Dropdown
                                label="Année"
                                value={currentYear ? `Année ${currentYear}` : 'Toutes'}
                                isOpen={openDropdown === 'year'}
                                onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: null, specialite_id: currentSpecialiteId, option_id: currentOptionId })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        Toutes les années
                                    </button>
                                    {years.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => applyFilters({ annee: year, specialite_id: currentSpecialiteId, option_id: currentOptionId })}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium ${currentYear == year ? 'bg-blue-50 text-blue-600' : ''}`}
                                        >
                                            Year {year}
                                        </button>
                                    ))}
                                </div>
                            </Dropdown>

                            {/* Speciality Dropdown */}
                            <Dropdown
                                label="Spécialité"
                                value={currentSpecialiteId ? (specialites.find(s => s.id == currentSpecialiteId)?.libelle || 'Toutes') : 'Toutes'}
                                isOpen={openDropdown === 'speciality'}
                                onToggle={() => setOpenDropdown(openDropdown === 'speciality' ? null : 'speciality')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: currentYear, specialite_id: null, option_id: null })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        Toutes les spécialités
                                    </button>
                                    {Object.keys(specialitesByLibelle).length > 0 ? (
                                        Object.values(specialitesByLibelle).map((group) => {
                                            if (!group || !group.libelle) return null;
                                            let selectedSpec = null;
                                            if (currentYear && group.specialites) {
                                                selectedSpec = group.specialites.find(s => s.annee == currentYear);
                                            }
                                            if (!selectedSpec && group.specialites && group.specialites.length > 0) {
                                                selectedSpec = group.specialites[0];
                                            }
                                            const isSelected = selectedSpec && currentSpecialiteId == selectedSpec.id;
                                            return (
                                                <button
                                                    key={group.libelle}
                                                    onClick={() => {
                                                        const specToSelect = currentYear && group.specialites
                                                            ? group.specialites.find(s => s.annee == currentYear) || group.specialites[0]
                                                            : group.specialites[0];
                                                        if (specToSelect) {
                                                            applyFilters({ annee: currentYear, specialite_id: specToSelect.id, option_id: null });
                                                        }
                                                    }}
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium ${isSelected ? 'bg-blue-50 text-blue-600' : ''}`}
                                                >
                                                    {group.libelle}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">No specialities available</div>
                                    )}
                                </div>
                            </Dropdown>

                            {/* Option Dropdown */}
                            <Dropdown
                                label="Option"
                                value={currentOptionId ? (filteredOptions.find(o => o.id == currentOptionId)?.libelle || 'Toutes') : 'Toutes'}
                                isOpen={openDropdown === 'option'}
                                onToggle={() => setOpenDropdown(openDropdown === 'option' ? null : 'option')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: null })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        Toutes les options
                                    </button>
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: opt.id })}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium ${currentOptionId == opt.id ? 'bg-blue-50 text-blue-600' : ''}`}
                                            >
                                                {opt.libelle}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
                                    )}
                                </div>
                            </Dropdown>
                        </div>

                        <div className="flex-1"></div>

                        {/* Search and other filters */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search student..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                />
                            </div>
                            <select
                                value={filters.module_id}
                                onChange={(e) => handleFilterChange('module_id', e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Modules</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>{module.libelle}</option>
                                ))}
                            </select>
                            <select
                                value={filters.semester}
                                onChange={(e) => handleFilterChange('semester', e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Semesters</option>
                                {[1, 2, 3, 4, 5, 6].map(sem => (
                                    <option key={sem} value={sem}>S{sem}</option>
                                ))}
                            </select>
                            <select
                                value={filters.coef_id}
                                onChange={(e) => handleFilterChange('coef_id', e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Types</option>
                                {coefs.map((coef) => (
                                    <option key={coef.id} value={coef.id}>{coef.libelle}</option>
                                ))}
                            </select>
                            <button
                                onClick={clearFilters}
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-extrabold tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Grade</th>
                                    <th className="px-6 py-4">Coeff.</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {formattedNotes.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No notes found
                                        </td>
                                    </tr>
                                ) : (
                                    formattedNotes.map((note) => {
                                        const studentInitial = note.student.name ? note.student.name.charAt(0).toUpperCase() : '?';
                                        const typeColor = note.type === 'Exam' ? 'bg-purple-100 text-purple-700' :
                                            note.type === 'DS' ? 'bg-blue-100 text-blue-700' :
                                                note.type === 'TP' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700';

                                        return (
                                            <tr key={note.id} className="group hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-200">
                                                            {note.student.avatar ? <img src={note.student.avatar} alt={note.student.name} className="w-full h-full object-cover" /> : studentInitial}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{note.student.name}</div>
                                                            <div className="text-xs font-medium text-gray-400">ID: {note.student.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-700">{note.module}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${typeColor}`}>
                                                        {note.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`text-lg font-black ${note.grade < 10 ? 'text-red-500' : note.grade >= 16 ? 'text-green-600' : 'text-gray-900'}`}>
                                                            {note.grade < 10 ? `0${Number(note.grade).toFixed(1)}` : Number(note.grade).toFixed(1)}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-400">/20</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{Number(note.coeff).toFixed(1)}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{note.date}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(note)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {safeRes.last_page > 1 && (
                        <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">
                                Affiche <span className="font-bold text-gray-900">{safeRes.from || 0}</span> à <span className="font-bold text-gray-900">{safeRes.to || 0}</span> sur <span className="font-bold text-gray-900">{safeRes.total || 0}</span> résultats
                            </span>
                            <div className="flex items-center gap-2">
                                {safeRes.current_page > 1 ? (
                                    <button
                                        onClick={() => {
                                            const params = {};
                                            if (filters.search) params.search = filters.search;
                                            if (filters.module_id) params.module_id = filters.module_id;
                                            if (filters.semester) params.semester = filters.semester;
                                            if (filters.coef_id) params.coef_id = filters.coef_id;
                                            if (filters.annee) params.annee = filters.annee;
                                            if (filters.specialite_id) params.specialite_id = filters.specialite_id;
                                            if (filters.option_id) params.option_id = filters.option_id;
                                            params.page = safeRes.current_page - 1;
                                            router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
                                        }}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Précédent
                                    </button>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400 font-medium">Précédent</span>
                                )}
                                {Array.from({ length: Math.min(5, safeRes.last_page) }, (_, i) => {
                                    let pageNum;
                                    if (safeRes.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (safeRes.current_page <= 3) {
                                        pageNum = i + 1;
                                    } else if (safeRes.current_page >= safeRes.last_page - 2) {
                                        pageNum = safeRes.last_page - 4 + i;
                                    } else {
                                        pageNum = safeRes.current_page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => {
                                                const params = {};
                                                if (filters.search) params.search = filters.search;
                                                if (filters.module_id) params.module_id = filters.module_id;
                                                if (filters.semester) params.semester = filters.semester;
                                                if (filters.coef_id) params.coef_id = filters.coef_id;
                                                if (filters.annee) params.annee = filters.annee;
                                                if (filters.specialite_id) params.specialite_id = filters.specialite_id;
                                                if (filters.option_id) params.option_id = filters.option_id;
                                                params.page = pageNum;
                                                router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
                                            }}
                                            className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg ${safeRes.current_page === pageNum
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                {safeRes.current_page < safeRes.last_page ? (
                                    <button
                                        onClick={() => {
                                            const params = {};
                                            if (filters.search) params.search = filters.search;
                                            if (filters.module_id) params.module_id = filters.module_id;
                                            if (filters.semester) params.semester = filters.semester;
                                            if (filters.coef_id) params.coef_id = filters.coef_id;
                                            if (filters.annee) params.annee = filters.annee;
                                            if (filters.specialite_id) params.specialite_id = filters.specialite_id;
                                            if (filters.option_id) params.option_id = filters.option_id;
                                            params.page = safeRes.current_page + 1;
                                            router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
                                        }}
                                        className="px-4 py-2 text-gray-600 font-bold hover:text-blue-600"
                                    >
                                        Suivant
                                    </button>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400 font-medium">Suivant</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Create/Edit Note */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingNote ? 'Modifier la note' : 'Ajouter une note'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingNote(null);
                                    setErrors({});
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Student Search */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Élève *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={studentSearch}
                                        onChange={(e) => handleStudentSearch(e.target.value)}
                                        onFocus={() => studentSearch.length >= 2 && setShowStudentResults(true)}
                                        placeholder="Chercher par nom ou matricule..."
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${errors.student_id ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        required={!editingNote}
                                        disabled={!!editingNote}
                                    />
                                    {showStudentResults && studentSearchResults.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {studentSearchResults.map((student) => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onClick={() => selectStudent(student)}
                                                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {student.prenom} {student.nom}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {student.matricule} • {student.option}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showStudentResults && studentSearch.length >= 2 && studentSearchResults.length === 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm text-gray-500">
                                            Aucun élève trouvé
                                        </div>
                                    )}
                                </div>
                                {errors.student_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                )}
                            </div>

                            {/* Module Select */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Module *
                                </label>
                                <select
                                    value={formData.module_id}
                                    onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${errors.module_id ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    required
                                    disabled={!formData.student_id}
                                >
                                    <option value="">
                                        {!formData.student_id ? 'Sélectionnez d\'abord un élève' : 'Sélectionner le module'}
                                    </option>
                                    {availableModules.map((module) => (
                                        <option key={module.id} value={module.id}>
                                            {module.libelle} (S{module.semestre})
                                        </option>
                                    ))}
                                </select>
                                {errors.module_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.module_id}</p>
                                )}
                            </div>

                            {/* Coef/Type Select */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Type d'évaluation *
                                </label>
                                <select
                                    value={formData.coef_id}
                                    onChange={(e) => setFormData({ ...formData, coef_id: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${errors.coef_id ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    required
                                >
                                    <option value="">Sélectionner le type</option>
                                    {coefs.map((coef) => (
                                        <option key={coef.id} value={coef.id}>
                                            {coef.libelle} (Coef: {coef.coef})
                                        </option>
                                    ))}
                                </select>
                                {errors.coef_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.coef_id}</p>
                                )}
                            </div>

                            {/* Grade Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Note (0-20) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="20"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${errors.note ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    required
                                />
                                {errors.note && (
                                    <p className="mt-1 text-sm text-red-600">{errors.note}</p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingNote(null);
                                        setErrors({});
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                                >
                                    {editingNote ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
