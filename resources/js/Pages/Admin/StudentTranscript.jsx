import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    ArrowLeft, Printer, Download, BarChart3, CheckCircle,
    AlertTriangle, XCircle, Calendar, FileText
} from 'lucide-react';

export default function StudentTranscript({ student, notes = [], moyennes = {}, selected_semester = null }) {
    const [semesterFilter, setSemesterFilter] = useState(selected_semester || 'all');

    // Filter notes by semester
    const filteredNotes = semesterFilter === 'all'
        ? notes
        : notes.filter(note => note.module?.semestre == semesterFilter);

    // Group notes by module
    const notesByModule = filteredNotes.reduce((acc, note) => {
        const moduleId = note.module_id;
        if (!acc[moduleId]) {
            acc[moduleId] = {
                module: note.module,
                notes: []
            };
        }
        acc[moduleId].notes.push(note);
        return acc;
    }, {});

    // Calculate module averages
    const moduleAverages = Object.values(notesByModule).map(({ module, notes }) => {
        let sum = 0;
        let totalWeight = 0;
        notes.forEach(note => {
            const weight = note.coef?.coef || 1;
            sum += note.note * weight;
            totalWeight += weight;
        });
        return {
            module,
            average: totalWeight > 0 ? sum / totalWeight : 0,
            notes
        };
    });

    // Calculate general average for filtered semester
    const generalAverage = moduleAverages.length > 0
        ? moduleAverages.reduce((sum, m) => sum + m.average, 0) / moduleAverages.length
        : 0;

    // Get semester label
    const getSemesterLabel = (sem) => {
        const labels = {
            1: 'S1 (1ère année - 1er semestre)',
            2: 'S2 (1ère année - 2e semestre)',
            3: 'S3 (2e année - 1er semestre)',
            4: 'S4 (2e année - 2e semestre)',
            5: 'S5 (3e année - 1er semestre)',
            6: 'S6 (3e année - 2e semestre)',
        };
        return labels[sem] || `Semestre ${sem}`;
    };

    // Handle semester filter change
    const handleSemesterChange = (sem) => {
        setSemesterFilter(sem);
        const params = sem === 'all' ? {} : { semester: sem };
        router.get(`/admin/students/${student.id}/transcript`, params, { preserveState: true });
    };

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get('/admin/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Student Transcript</h1>
                            <p className="text-gray-600 mt-1">
                                {student?.prenom} {student?.nom} • {student?.user?.matricule || 'N/A'}
                                {student?.option && ` • ${student.option.libelle}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                // Print current page
                                window.print();
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={() => {
                                // Direct download - export routes don't need Inertia
                                const params = new URLSearchParams();
                                if (semesterFilter && semesterFilter !== 'all') params.set('semester', semesterFilter);

                                window.location.href = `/admin/students/${student.id}/transcript/export?${params.toString()}`;
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Semester Filter */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-bold text-gray-700">Filter by Semester:</span>
                        <button
                            onClick={() => handleSemesterChange('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${semesterFilter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Semesters
                        </button>
                        {[1, 2, 3, 4, 5, 6].map(sem => (
                            <button
                                key={sem}
                                onClick={() => handleSemesterChange(sem)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${semesterFilter == sem
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {getSemesterLabel(sem)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* General Average */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">
                                {semesterFilter === 'all' ? 'Cycle Average' : `S${semesterFilter} Average`}
                            </h3>
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-black text-gray-900">
                                {semesterFilter === 'all'
                                    ? (Object.values(moyennes).length > 0
                                        ? (Object.values(moyennes).reduce((a, b) => a + b, 0) / Object.values(moyennes).length).toFixed(2)
                                        : generalAverage.toFixed(2))
                                    : (moyennes[semesterFilter] || generalAverage).toFixed(2)
                                }
                            </span>
                            <span className="text-gray-400 font-medium text-lg">/20</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                            {generalAverage >= 10 ? 'Passing' : 'Failing'}
                        </p>
                    </div>

                    {/* Total Notes */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Notes</h3>
                            <FileText className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-gray-900">{filteredNotes.length}</span>
                        </div>
                        <p className="text-sm text-gray-900 font-bold mt-2">Grades recorded</p>
                    </div>

                    {/* Modules Count */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Modules</h3>
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-gray-900">{moduleAverages.length}</span>
                        </div>
                        <p className="text-sm text-gray-900 font-bold mt-2">Active modules</p>
                    </div>

                    {/* Semester Averages */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Semester Averages</h3>
                            <Calendar className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="mt-1 space-y-1">
                            {Object.entries(moyennes).map(([sem, moy]) => (
                                <div key={sem} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 font-medium">S{sem}:</span>
                                    <span className="font-bold text-gray-900">{Number(moy).toFixed(2)}</span>
                                </div>
                            ))}
                            {Object.keys(moyennes).length === 0 && (
                                <p className="text-xs text-gray-400">No averages yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Module Averages Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="font-bold text-gray-900 text-lg">Module Averages</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">Semester</th>
                                    <th className="px-6 py-4 text-center">Average</th>
                                    <th className="px-6 py-4 text-center">Notes Count</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {moduleAverages.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No notes found for the selected semester
                                        </td>
                                    </tr>
                                ) : (
                                    moduleAverages.map(({ module, average, notes: moduleNotes }) => (
                                        <tr key={module?.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{module?.libelle || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">S{module?.semestre || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${average >= 16 ? 'bg-green-100 text-green-700' :
                                                        average >= 10 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {Number(average).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600 font-medium">{moduleNotes.length}</td>
                                            <td className="px-6 py-4 text-center">
                                                {average >= 10 ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-sm font-bold">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Passing
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 text-sm font-bold">
                                                        <XCircle className="w-4 h-4" />
                                                        Failing
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detailed Grades Table (Grouped by Module) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-8 p-6">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h2 className="font-bold text-gray-900 text-lg">Detailed Transcript</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                            {moduleAverages.length} Modules / {filteredNotes.length} Grades
                        </span>
                    </div>

                    {moduleAverages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 font-medium">
                            No grades found for the selected semester
                        </div>
                    ) : (
                        moduleAverages.map(({ module, average, notes: moduleNotes }) => (
                            <div key={module?.id || 'unknown'} className="border border-gray-200 rounded-xl overflow-hidden">
                                {/* Module Header */}
                                <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200">
                                    <div>
                                        <h3 className="font-black text-gray-900 text-lg">{module?.libelle || 'Unknown Module'}</h3>
                                        <p className="text-sm text-gray-500">Semester {module?.semestre}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Average</div>
                                            <div className={`text-xl font-black ${average >= 16 ? 'text-green-600' :
                                                    average >= 10 ? 'text-blue-600' :
                                                        'text-red-500'
                                                }`}>
                                                {Number(average).toFixed(2)} <span className="text-sm text-gray-400 font-medium">/20</span>
                                            </div>
                                        </div>
                                        <div>
                                            {average >= 10 ? (
                                                <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                                                    <XCircle className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes List */}
                                <div className="divide-y divide-gray-100">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white text-gray-400 text-xs uppercase font-bold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-3 font-medium w-32">Date</th>
                                                <th className="px-6 py-3 font-medium">Evaluation Type</th>
                                                <th className="px-6 py-3 font-medium text-center w-24">Coef.</th>
                                                <th className="px-6 py-3 font-medium text-right w-32">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {moduleNotes.map(note => {
                                                const date = note.created_at ? new Date(note.created_at) : new Date();
                                                const coef = note.coef?.coef || 1;
                                                return (
                                                    <tr key={note.id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-3 text-gray-600">
                                                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-3 font-bold text-gray-700">
                                                            <span className={`px-2 py-1 rounded text-xs ${note.coef?.libelle === 'Exam' ? 'bg-purple-100 text-purple-700' :
                                                                    note.coef?.libelle === 'DS' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {note.coef?.libelle || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-center text-gray-500">{coef}</td>
                                                        <td className="px-6 py-3 text-right">
                                                            <span className={`font-bold ${note.note >= 10 ? 'text-gray-900' : 'text-red-500'
                                                                }`}>
                                                                {Number(note.note).toFixed(2)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
