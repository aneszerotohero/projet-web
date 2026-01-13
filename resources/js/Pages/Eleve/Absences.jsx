import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import StudentLayout from '../../Layouts/StudentLayout';
import { useFlashMessage } from '../../hooks/useNotify';

export default function StudentAbsences() {
    useFlashMessage();
    const [absences, setAbsences] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        module_id: '',
        status: '',
        date: ''
    });
    const [pagination, setPagination] = useState({});

    // AbortController ref
    const abortControllerRef = useRef(null);

    // Fetch modules for filter
    useEffect(() => {
        fetch('/api/student/modules')
            .then(res => res.json())
            .then(data => setModules(data.modules || []))
            .catch(err => console.error('Error fetching modules:', err));
    }, []);

    // Fetch absences
    const fetchAbsences = useCallback(async (currentFilters = filters, page = 1) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page,
                ...currentFilters
            });

            Array.from(queryParams.keys()).forEach(key => {
                if (!queryParams.get(key)) queryParams.delete(key);
            });

            const response = await fetch(`/api/student/absences?${queryParams.toString()}`, {
                signal,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setAbsences(data.data);
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
                console.error('Error fetching absences:', error);
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchAbsences(filters, 1);
    }, []);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchAbsences(newFilters, 1);
    };

    const handleRequestJustification = (absenceId) => {
        if (confirm('Submit a justification request for this absence?')) {
            router.post('/student/absences/request', { absence_id: absenceId }, {
                preserveScroll: true,
                onSuccess: () => {
                    fetchAbsences(filters, pagination.current_page);
                },
                onError: (errs) => {
                    if (errs.message && (errs.message.includes('419') || errs.message.includes('CSRF'))) {
                        window.location.reload();
                    } else {
                        alert('Error submitting request: ' + (errs.message || 'Unknown error'));
                    }
                }
            });
        }
    };

    return (
        <StudentLayout>
            <Head title="Mes absences" />

            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Mes absences</h1>
                <p className="text-gray-500 mt-1">Suivre vos absences et gérer les justificatifs.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <select
                    value={filters.module_id}
                    onChange={(e) => handleFilterChange('module_id', e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                >
                    <option value="">All Modules</option>
                        <option value="">Tous les modules</option>
                    {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.libelle}</option>
                    ))}
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                >
                    <option value="">Tous les statuts</option>
                    <option value="Justified">Justifié</option>
                    <option value="Unjustified">Non justifié</option>
                    <option value="Pending">En attente</option>
                          <option value="">Tous les statuts</option>
                          <option value="Justified">Justifié</option>
                          <option value="Unjustified">Non justifié</option>
                          <option value="Pending">En attente</option>
                </select>

                <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                />
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Module</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading absences...</td>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Chargement des absences...</td>
                                </tr>
                            ) : absences.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No absences recorded.</td>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Aucune absence enregistrée.</td>
                                </tr>
                            ) : (
                                absences.map(absence => (
                                    <tr key={absence.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {formatDate(absence.date)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {absence.module?.libelle || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {absence.number_of_hours || 1.5}h
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={absence.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {absence.status === 'Unjustified' && (
                                                <button
                                                    onClick={() => handleRequestJustification(absence.id)}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                        Justifier
                                                </button>
                                            )}
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
                            Affiche <span className="font-bold">{pagination.from}</span> à <span className="font-bold">{pagination.to}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.current_page === 1}
                                onClick={() => fetchAbsences(filters, pagination.current_page - 1)}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                    Précédent
                            </button>
                            <button
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => fetchAbsences(filters, pagination.current_page + 1)}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                    Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

const StatusBadge = ({ status }) => {
    let styles = "bg-gray-100 text-gray-700";
    if (status === 'Justified') styles = "bg-green-100 text-green-700";
    if (status === 'Unjustified') styles = "bg-red-100 text-red-700";
    if (status === 'Pending') styles = "bg-yellow-100 text-yellow-700";

    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${styles}`}>
            {status || 'Unknown'}
        </span>
    );
};

StudentAbsences.layout = StudentLayout;
