import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Filter, BookOpen, Calculator, Calendar } from 'lucide-react';

// Use a simple layout placeholder or import your actual layout
// Assuming existing AdminLayout or creating a new StudentLayout later.
// For now, using a simple wrapper.
const StudentLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 font-sans">
        <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <span className="font-bold text-xl text-blue-600">My Portal</span>
                <div className="flex gap-4">
                    <a href="/student/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</a>
                    <a href="/student/notes" className="text-blue-600 font-bold">Notes</a>
                    <a href="/student/absences" className="text-gray-600 hover:text-blue-600">Absences</a>
                </div>
            </div>
        </nav>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
        </main>
    </div>
);

export default function StudentNotes() {
    const [notes, setNotes] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        module_id: '',
        semester: '',
        annee: ''
    });
    const [pagination, setPagination] = useState({});

    // AbortController ref for cancelling previous requests
    const abortControllerRef = useRef(null);

    // Fetch available modules
    useEffect(() => {
        fetch('/api/student/modules')
            .then(res => res.json())
            .then(data => setModules(data.modules || []))
            .catch(err => console.error('Error fetching modules:', err));
    }, []);

    // Fetch notes with filters
    const fetchNotes = useCallback(async (currentFilters = filters, page = 1) => {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page,
                ...currentFilters
            });

            // Remove empty filters
            Array.from(queryParams.keys()).forEach(key => {
                if (!queryParams.get(key)) queryParams.delete(key);
            });

            const response = await fetch(`/api/student/notes?${queryParams.toString()}`, {
                signal,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setNotes(data.data);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                    from: data.from,
                    to: data.to
                });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching notes:', error);
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotes(filters, 1);
    }, []);

    // Debounced filter change handler
    const [filterTimeout, setFilterTimeout] = useState(null);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        if (filterTimeout) clearTimeout(filterTimeout);

        const timeout = setTimeout(() => {
            fetchNotes(newFilters, 1);
        }, 300); // 300ms debounce

        setFilterTimeout(timeout);
    };

    return (
        <StudentLayout>
            <Head title="My Grades" />

            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">My Grades</h1>
                <p className="text-gray-500 mt-1">View your academic performance and grades.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search module..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>

                <select
                    value={filters.module_id}
                    onChange={(e) => handleFilterChange('module_id', e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                >
                    <option value="">All Modules</option>
                    {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.libelle}</option>
                    ))}
                </select>

                <select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                    ))}
                </select>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Module</th>
                                <th className="px-6 py-4">Semester</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Grade</th>
                                <th className="px-6 py-4">Coef</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading grades...</td>
                                </tr>
                            ) : notes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No grades found.</td>
                                </tr>
                            ) : (
                                notes.map(note => (
                                    <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {note.module?.libelle || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            S{note.module?.semestre || '?'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${note.coef?.libelle === 'Exam' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {note.coef?.libelle || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-lg font-black ${note.note >= 10 ? 'text-green-600' : 'text-red-500'
                                                }`}>
                                                {Number(note.note).toFixed(2)}
                                            </span>
                                            <span className="text-gray-300 text-sm ml-1">/20</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {note.coef?.coef || 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    if (confirm('Request correction for this grade?')) {
                                                        router.post('/student/notes/correction', { note_id: note.id });
                                                    }
                                                }}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                            >
                                                Request Correction
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                            Showing <span className="font-bold">{pagination.from}</span> to <span className="font-bold">{pagination.to}</span> of <span className="font-bold">{pagination.total}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.current_page === 1}
                                onClick={() => fetchNotes(filters, pagination.current_page - 1)}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => fetchNotes(filters, pagination.current_page + 1)}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
