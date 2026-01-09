import React, { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Download, Plus, Search, Filter, Calendar, FileText, X,
    MoreHorizontal, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, Trash2, Pencil
} from 'lucide-react';

export default function NotesAdmin({ meta = {}, res = {}, stats = {}, filters: initialFilters = {} }) {
    // Safe defaults
    const safeMeta = meta || {};
    const safeRes = res || {};
    const safeStats = stats || {};
    const notes = safeRes.data || [];
    const modules = safeMeta.modules || [];
    const coefs = safeMeta.coefs || [];
    const students = safeMeta.students || [];
    
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
            date: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            rawNote: note // Keep original for editing
        };
    });

    const [filters, setFilters] = useState(initialFilters || { search: '', module_id: '', semester: '', coef_id: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ student_id: '', module_id: '', coef_id: '', note: '' });
    const [errors, setErrors] = useState({});

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
        
        router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
    }, [filters]);

    // Handle search with debounce
    const [searchTimeout, setSearchTimeout] = useState(null);
    const handleSearch = useCallback((value) => {
        setFilters(prev => ({ ...prev, search: value }));
        
        if (searchTimeout) clearTimeout(searchTimeout);
        
        const timeout = setTimeout(() => {
            const params = { ...filters, search: value };
            router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
        }, 500);
        
        setSearchTimeout(timeout);
    }, [filters, searchTimeout]);

    // Open modal for create
    const openCreateModal = () => {
        setEditingNote(null);
        setFormData({ student_id: '', module_id: '', coef_id: '', note: '' });
        setErrors({});
        setShowModal(true);
    };

    // Open modal for edit
    const openEditModal = (note) => {
        setEditingNote(note.rawNote);
        setFormData({
            student_id: note.student_id || '',
            module_id: note.module_id || '',
            coef_id: note.coef_id || '',
            note: note.grade || ''
        });
        setErrors({});
        setShowModal(true);
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        
        const url = editingNote ? `/admin/notes/${editingNote.id}` : '/admin/notes/single';
        const method = editingNote ? 'patch' : 'post';
        
        router[method](url, formData, {
            onSuccess: () => {
                setShowModal(false);
                setEditingNote(null);
                setFormData({ student_id: '', module_id: '', coef_id: '', note: '' });
                router.reload({ only: ['res', 'stats'] });
            },
            onError: (errs) => {
                setErrors(errs);
            }
        });
    };

    // Handle delete
    const handleDelete = (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        
        router.delete(`/admin/notes/${noteId}`, {
            onSuccess: () => {
                router.reload({ only: ['res', 'stats'] });
            }
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({ search: '', module_id: '', semester: '', coef_id: '' });
        router.get('/admin/notes/manage', {}, { preserveState: true });
    };

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

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notes Management</h1>
                        <p className="text-gray-500 mt-1 text-sm">Manage student grades, coefficients, and academic records.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-sm">
                            <FileText className="w-4 h-4" />
                            Import CSV
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm">
                            <Plus className="w-4 h-4" />
                            Add New Grade
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KpiCard title="Average GPA" value={safeStats.average_gpa?.value || '0.0'} trend={safeStats.average_gpa?.trend || null} trendType={safeStats.average_gpa?.trend_type || 'up'} icon={TrendingUp} color="green" />
                    <KpiCard title="Failing Students" value={safeStats.failing_students?.value || '0'} trend={safeStats.failing_students?.trend || null} trendType={safeStats.failing_students?.trend_type || 'down_good'} icon={AlertTriangle} color="red" />
                    <KpiCard title="Grades Entered Today" value={safeStats.grades_today?.value || '0'} trend={safeStats.grades_today?.trend || null} trendType={safeStats.grades_today?.trend_type || 'up'} icon={Calendar} color="blue" />
                </div>

                {/* Filters */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Search Student</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Name or Student ID..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Module</label>
                            <select 
                                value={filters.module_id}
                                onChange={(e) => handleFilterChange('module_id', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Modules</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>{module.libelle}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Semester</label>
                            <select 
                                value={filters.semester}
                                onChange={(e) => handleFilterChange('semester', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Semesters</option>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Grade Type</label>
                                <select 
                                    value={filters.coef_id}
                                    onChange={(e) => handleFilterChange('coef_id', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Types</option>
                                    {coefs.map((coef) => (
                                        <option key={coef.id} value={coef.id}>{coef.libelle}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={clearFilters}
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 mb-1 self-end"
                            >
                                Clear Filters
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
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(note.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
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
                                Showing <span className="font-bold text-gray-900">{safeRes.from || 0}</span> to <span className="font-bold text-gray-900">{safeRes.to || 0}</span> of <span className="font-bold text-gray-900">{safeRes.total || 0}</span> results
                            </span>
                            <div className="flex items-center gap-2">
                                {safeRes.current_page > 1 ? (
                                    <button 
                                        onClick={() => {
                                            const params = { ...filters, page: safeRes.current_page - 1 };
                                            router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
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
                                                const params = { ...filters, page: pageNum };
                                                router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
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
                                            const params = { ...filters, page: safeRes.current_page + 1 };
                                            router.get('/admin/notes/manage', params, { preserveState: true, preserveScroll: true });
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

            {/* Modal for Create/Edit Note */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingNote ? 'Edit Note' : 'Add New Grade'}
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
                            {/* Student Select */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Student *
                                </label>
                                <select
                                    value={formData.student_id}
                                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${
                                        errors.student_id ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.prenom} {student.nom}
                                        </option>
                                    ))}
                                </select>
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
                                >
                                    <option value="">Select Module</option>
                                    {modules.map((module) => (
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
                                    Grade Type *
                                </label>
                                <select
                                    value={formData.coef_id}
                                    onChange={(e) => setFormData({ ...formData, coef_id: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${
                                        errors.coef_id ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    required
                                >
                                    <option value="">Select Type</option>
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
                                    Grade (0-20) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="20"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all ${
                                        errors.note ? 'border-red-500' : 'border-gray-200'
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                                >
                                    {editingNote ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
