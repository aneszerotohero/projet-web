import React, { useState, useCallback, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Plus, Search, Filter, Calendar, TrendingUp, AlertTriangle,
    MoreHorizontal, ChevronLeft, ChevronRight, Calculator, CheckCircle, RotateCcw, Trash2, Pencil, X, ChevronDown
} from 'lucide-react';

export default function AbsencesAdmin({ res = {}, stats = {}, modules = [], students = [], filters: initialFilters = {}, available_filters = {} }) {
    const { flash } = usePage().props;
    
    // Safe defaults
    const safeRes = res || {};
    const safeStats = stats || {};
    const safeModules = Array.isArray(modules) ? modules : [];
    const safeStudents = Array.isArray(students) ? students : [];
    const absences = safeRes.data || [];
    const safeAvailableFilters = available_filters || {};
    const specialitesByLibelle = safeAvailableFilters.specialites_by_libelle || {};
    const specialites = safeAvailableFilters.specialites || [];
    const options = safeAvailableFilters.options || [];
    const years = safeAvailableFilters.years || [1, 2, 3];
    
    // Format absences for display
    const formattedAbsences = absences.map(absence => {
        const student = absence.student || {};
        const user = student.user || {};
        const module = absence.module || {};
        const dateAbsence = absence.date_absence ? new Date(absence.date_absence) : new Date();
        const isDeleted = absence.deleted_at !== null;
        const status = isDeleted ? 'Deleted' : (absence.justifie ? 'Justified' : 'Unjustified');
        
        return {
            id: absence.id,
            student_id: student.id,
            module_id: module.id,
            student: {
                name: `${student.prenom || ''} ${student.nom || ''}`.trim() || 'N/A',
                id: user.matricule || student.id || 'N/A',
                avatar: null
            },
            class: student.option?.libelle || 'N/A',
            module: module.libelle || 'N/A',
            date: dateAbsence.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: dateAbsence.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            date_absence: absence.date_absence,
            status: status,
            isDeleted: isDeleted,
            justifie: absence.justifie || false,
            motif: absence.motif_absence || '',
            motifSuppression: absence.motif_suppression || null,
            rawAbsence: absence // Keep original for editing
        };
    });

    const [filters, setFilters] = useState(initialFilters || { search: '', module_id: '', status: 'Active', annee: '', specialite_id: '', option_id: '' });
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
    const [editingAbsence, setEditingAbsence] = useState(null);
    const [formData, setFormData] = useState({ 
        student_id: '', 
        module_id: '', 
        date_absence: '', 
        motif_absence: '', 
        justifie: false 
    });
    const [errors, setErrors] = useState({});
    const [deleteModal, setDeleteModal] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [studentSearchResults, setStudentSearchResults] = useState([]);
    const [showStudentResults, setShowStudentResults] = useState(false);
    const [studentSearchTimeout, setStudentSearchTimeout] = useState(null);
    const [availableModules, setAvailableModules] = useState(safeModules); // Modules filtered by student

    // Handle filter changes
    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        const params = {};
        if (newFilters.search) params.search = newFilters.search;
        if (newFilters.module_id) params.module_id = newFilters.module_id;
        if (newFilters.status) params.status = newFilters.status;
        if (newFilters.annee) params.annee = newFilters.annee;
        if (newFilters.specialite_id) params.specialite_id = newFilters.specialite_id;
        if (newFilters.option_id) params.option_id = newFilters.option_id;
        
        router.get('/admin/absences/manage', params, { preserveState: true, preserveScroll: true });
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
            if (newFilters.status) params.status = newFilters.status;
            if (newFilters.annee) params.annee = newFilters.annee;
            if (newFilters.specialite_id) params.specialite_id = newFilters.specialite_id;
            if (newFilters.option_id) params.option_id = newFilters.option_id;
            router.get('/admin/absences/manage', params, { preserveState: true, preserveScroll: true });
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
                const response = await fetch(`/api/admin/students/search?q=${encodeURIComponent(value)}`, {
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
            const response = await fetch(`/api/admin/students/${student.id}/modules`, {
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
                setAvailableModules(safeModules); // Fallback to all modules
            }
        } catch (error) {
            console.error('Error loading modules for student:', error);
            setAvailableModules(safeModules); // Fallback to all modules
        }
    };

    // Open modal for create
    const openCreateModal = () => {
        setEditingAbsence(null);
        setFormData({ student_id: '', module_id: '', date_absence: '', motif_absence: '', justifie: false });
        setStudentSearch('');
        setStudentSearchResults([]);
        setShowStudentResults(false);
        setErrors({});
        setAvailableModules(safeModules); // Reset to all modules
        setShowModal(true);
    };

    // Open modal for edit
    const openEditModal = async (absence) => {
        setEditingAbsence(absence.rawAbsence);
        // Format date for input (YYYY-MM-DD)
        const dateValue = absence.date_absence ? new Date(absence.date_absence).toISOString().split('T')[0] : '';
        setFormData({
            student_id: absence.student_id || '',
            module_id: absence.module_id || '',
            date_absence: dateValue,
            motif_absence: absence.motif || '',
            justifie: absence.justifie || false
        });
        const student = safeStudents.find(s => s.id === absence.student_id);
        setStudentSearch(student ? `${student.prenom} ${student.nom}${student.user?.matricule ? ` (${student.user.matricule})` : ''}` : '');
        setStudentSearchResults([]);
        setShowStudentResults(false);
        setErrors({});
        
        // Load modules for this student
        if (absence.student_id) {
            try {
                const response = await fetch(`/api/admin/students/${absence.student_id}/modules`, {
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
                    setAvailableModules(safeModules);
                }
            } catch (error) {
                console.error('Error loading modules for student:', error);
                setAvailableModules(safeModules);
            }
        } else {
            setAvailableModules(safeModules);
        }
        
        setShowModal(true);
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        
        const url = editingAbsence ? `/admin/absences/${editingAbsence.id}` : '/admin/absences';
        const method = editingAbsence ? 'patch' : 'post';
        
        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: (page) => {
                setShowModal(false);
                setEditingAbsence(null);
                setFormData({ student_id: '', module_id: '', date_absence: '', motif_absence: '', justifie: false });
                setStudentSearch('');
                setStudentSearchResults([]);
                setShowStudentResults(false);
                // Reload only if we're not already on the manage page
                if (!page.url.includes('/admin/absences/manage')) {
                    router.reload({ only: ['res', 'stats'], preserveScroll: true });
                }
            },
            onError: (errs) => {
                setErrors(errs);
                // If CSRF error, reload the page to get a new token
                if (errs.message && (errs.message.includes('419') || errs.message.includes('CSRF'))) {
                    window.location.reload();
                }
            }
        });
    };

    // Handle delete
    const handleDelete = (absence) => {
        setDeleteModal(absence);
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        
        const motifSuppression = prompt('Reason for deletion (optional):');
        const data = motifSuppression ? { motif_suppression: motifSuppression } : {};
        
        router.delete(`/admin/absences/${deleteModal.id}`, {
            data,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal(null);
                router.reload({ only: ['res', 'stats'], preserveState: true, preserveScroll: true });
            },
            onError: (errs) => {
                setDeleteModal(null);
                // If CSRF error, reload the page to get a new token
                if (errs.message && errs.message.includes('419') || errs.message && errs.message.includes('CSRF')) {
                    window.location.reload();
                } else {
                    alert('Error deleting absence: ' + (errs.message || 'Unknown error'));
                }
            }
        });
    };

    // Handle restore
    const handleRestore = (absence) => {
        if (!window.confirm('Are you sure you want to restore this absence?')) return;
        
        router.post(`/admin/absences/${absence.id}/restore`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['res', 'stats'], preserveState: true, preserveScroll: true });
            },
            onError: (errs) => {
                // If CSRF error, reload the page to get a new token
                if (errs.message && errs.message.includes('419') || errs.message && errs.message.includes('CSRF')) {
                    window.location.reload();
                } else {
                    alert('Error restoring absence: ' + (errs.message || 'Unknown error'));
                }
            }
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({ search: '', module_id: '', status: 'Active', annee: '', specialite_id: '', option_id: '' });
        router.get('/admin/absences/manage', { status: 'Active' }, { preserveState: true });
    };
    
    // Apply filters helper
    const applyFilters = useCallback((newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        
        const params = {};
        if (updatedFilters.search) params.search = updatedFilters.search;
        if (updatedFilters.module_id) params.module_id = updatedFilters.module_id;
        if (updatedFilters.status) params.status = updatedFilters.status;
        
        // Year filter (independent)
        if (updatedFilters.annee !== undefined && updatedFilters.annee !== null) {
            params.annee = updatedFilters.annee;
        }
        
        // Speciality filter (independent)
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
        
        router.get('/admin/absences/manage', params, { 
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

    const KpiCard = ({ title, value, subtext, trend, trendType, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-gray-500 font-bold text-sm">{title}</h3>
                <div className={`p-2 rounded-lg ${color === 'red' ? 'bg-red-50 text-red-600' : color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {Icon ? <Icon className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
            </div>
            <div className="z-10">
                <h2 className={`font-black text-gray-900 ${typeof value === 'string' && value.length > 3 ? 'text-2xl mt-1' : 'text-4xl'}`}>{value}</h2>
                {subtext && <div className="text-gray-400 font-medium text-sm mt-1">{subtext}</div>}
                {trend && <div className={`text-xs font-bold mt-2 ${trendType === 'up_bad' ? 'text-red-500' : 'text-green-600'}`}>
                    {trend}
                </div>}
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
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Absences Management</h1>
                        <p className="text-gray-500 mt-1 text-sm">Track, justify, and manage student attendance records.</p>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Record Absence
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KpiCard title="New Absences (Today)" value={safeStats.new_absences?.value || '0'} trend={safeStats.new_absences?.trend || null} trendType={safeStats.new_absences?.trend_type || 'up_bad'} color="red" />
                    <KpiCard title="Most Absent Module" value={safeStats.most_absent_module?.value || 'N/A'} subtext={safeStats.most_absent_module?.subtext || 'No data'} icon={Calculator} color="blue" />
                    <KpiCard title="Warning List" value={safeStats.warning_list?.value || '0'} subtext={safeStats.warning_list?.subtext || 'Students approaching limit'} icon={AlertTriangle} color="orange" />
                </div>

                {/* Filters */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Filters:</span>
                            
                            {/* Year Dropdown */}
                            <Dropdown
                                label="Year"
                                value={currentYear ? `Year ${currentYear}` : 'All'}
                                isOpen={openDropdown === 'year'}
                                onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: null, specialite_id: currentSpecialiteId, option_id: currentOptionId })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        All Years
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
                                label="Speciality"
                                value={currentSpecialiteId ? (specialites.find(s => s.id == currentSpecialiteId)?.libelle || 'All') : 'All'}
                                isOpen={openDropdown === 'speciality'}
                                onToggle={() => setOpenDropdown(openDropdown === 'speciality' ? null : 'speciality')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: currentYear, specialite_id: null, option_id: null })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        All Specialities
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
                                value={currentOptionId ? (filteredOptions.find(o => o.id == currentOptionId)?.libelle || 'All') : 'All'}
                                isOpen={openDropdown === 'option'}
                                onToggle={() => setOpenDropdown(openDropdown === 'option' ? null : 'option')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: null })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        All Options
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
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search student..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                        </div>
                            <select 
                                value={filters.module_id || ''}
                                onChange={(e) => handleFilterChange('module_id', e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Modules</option>
                                {safeModules.map((module) => (
                                    <option key={module.id} value={module.id}>{module.libelle}</option>
                                ))}
                            </select>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => handleFilterChange('status', 'Active')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        filters.status === 'Active' 
                                            ? 'bg-white shadow-sm text-gray-900' 
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    Active
                                </button>
                            <button 
                                onClick={() => handleFilterChange('status', 'Deleted')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    filters.status === 'Deleted' 
                                        ? 'bg-white shadow-sm text-gray-900' 
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Deleted
                            </button>
                        </div>
                        <button 
                            onClick={clearFilters}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* List Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-extrabold tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {formattedAbsences.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No absences found
                                        </td>
                                    </tr>
                                ) : (
                                    formattedAbsences.map((record) => {
                                        const studentInitial = record.student.name ? record.student.name.charAt(0).toUpperCase() : '?';
                                        const statusColor = record.status === 'Unjustified' ? 'bg-red-50 text-red-600' :
                                            record.status === 'Justified' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500';
                                        
                                        return (
                                            <tr key={record.id} className={`group transition-colors ${record.isDeleted ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'}`}>
                                                <td className="px-6 py-4">
                                                    <input type="checkbox" className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${record.isDeleted ? 'opacity-50' : ''}`} disabled={record.isDeleted} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-3 ${record.isDeleted ? 'opacity-50 grayscale' : ''}`}>
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-200">
                                                            {record.student.avatar ? <img src={record.student.avatar} alt={record.student.name} className="w-full h-full object-cover" /> : studentInitial}
                                                        </div>
                                                        <div>
                                                            <div className={`font-bold ${record.isDeleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{record.student.name}</div>
                                                            <div className="text-xs font-medium text-gray-400">ID: {record.student.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-medium ${record.isDeleted ? 'text-gray-400' : 'text-blue-600'}`}>{record.class}</td>
                                                <td className={`px-6 py-4 font-bold ${record.isDeleted ? 'text-gray-400' : 'text-gray-700'}`}>{record.module}</td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-sm ${record.isDeleted ? 'text-gray-400' : 'text-gray-900 font-bold'}`}>{record.date}</div>
                                                    <div className="text-xs text-gray-400">{record.time}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                                        {record.status === 'Justified' && <CheckCircle className="w-3 h-3" />}
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {record.isDeleted ? (
                                                        <div className="flex justify-end items-center gap-2">
                                                            <button
                                                                onClick={() => handleRestore(record)}
                                                                className="text-xs font-bold text-blue-600 flex items-center gap-1 cursor-pointer hover:underline"
                                                            >
                                                                <RotateCcw className="w-3 h-3" /> Restore
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => openEditModal(record)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(record)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
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
                                Showing <span className="font-bold text-gray-900">{safeRes.from || 0}</span> to <span className="font-bold text-gray-900">{safeRes.to || 0}</span> of <span className="font-bold text-gray-900">{safeRes.total || 0}</span> results
                            </span>
                            <div className="flex items-center gap-2">
                                {safeRes.current_page > 1 ? (
                                    <button 
                                        onClick={() => {
                                            const params = {};
                                            if (filters.search) params.search = filters.search;
                                            if (filters.module_id) params.module_id = filters.module_id;
                                            if (filters.status) params.status = filters.status;
                                            if (filters.annee) params.annee = filters.annee;
                                            if (filters.specialite_id) params.specialite_id = filters.specialite_id;
                                            if (filters.option_id) params.option_id = filters.option_id;
                                            params.page = safeRes.current_page - 1;
                                            router.get('/admin/absences/manage', params, { preserveState: true, preserveScroll: true });
                                        }}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400 font-medium">Previous</span>
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
                                                if (filters.status) params.status = filters.status;
                                                if (filters.annee) params.annee = filters.annee;
                                                if (filters.specialite_id) params.specialite_id = filters.specialite_id;
                                                if (filters.option_id) params.option_id = filters.option_id;
                                                params.page = pageNum;
                                                router.get('/admin/absences/manage', params, { preserveState: true, preserveScroll: true });
                                            }}
                                            className={`w-8 h-8 flex items-center justify-center font-bold rounded-lg ${
                                                safeRes.current_page === pageNum
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
                                            if (filters.status) params.status = filters.status;
                                            if (filters.annee) params.annee = filters.annee;
                                            if (filters.specialite_id) params.specialite_id = filters.specialite_id;
                                            if (filters.option_id) params.option_id = filters.option_id;
                                            params.page = safeRes.current_page + 1;
                                            router.get('/admin/absences/manage', params, { preserveState: true, preserveScroll: true });
                                        }}
                                        className="px-4 py-2 text-gray-600 font-bold hover:text-blue-600"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400 font-medium">Next</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Create/Edit Absence */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingAbsence ? 'Edit Absence' : 'Record New Absence'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingAbsence(null);
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
                                    Student *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={studentSearch}
                                        onChange={(e) => handleStudentSearch(e.target.value)}
                                        onFocus={() => studentSearch.length >= 2 && setShowStudentResults(true)}
                                        placeholder="Search by name or matricule..."
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${
                                            errors.student_id ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required={!editingAbsence}
                                        disabled={!!editingAbsence}
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
                                            No students found
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
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${
                                        errors.module_id ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                    disabled={!formData.student_id}
                                >
                                    <option value="">
                                        {!formData.student_id ? 'Select a student first' : 'Select Module'}
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

                            {/* Date Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date_absence}
                                    onChange={(e) => setFormData({ ...formData, date_absence: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${
                                        errors.date_absence ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                />
                                {errors.date_absence && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date_absence}</p>
                                )}
                            </div>

                            {/* Motif Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Reason *
                                </label>
                                <textarea
                                    value={formData.motif_absence}
                                    onChange={(e) => setFormData({ ...formData, motif_absence: e.target.value })}
                                    rows={3}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${
                                        errors.motif_absence ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                />
                                {errors.motif_absence && (
                                    <p className="mt-1 text-sm text-red-600">{errors.motif_absence}</p>
                                )}
                            </div>

                            {/* Justified Checkbox */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.justifie}
                                        onChange={(e) => setFormData({ ...formData, justifie: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Justified</span>
                                </label>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingAbsence(null);
                                        setErrors({});
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                                >
                                    {editingAbsence ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-black text-gray-900">Confirm Deletion</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete this absence record? This action can be undone by restoring the record.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </AdminLayout>
    );
}
