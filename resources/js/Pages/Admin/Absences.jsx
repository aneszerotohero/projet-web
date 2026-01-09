import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Plus, Search, Filter, Calendar, TrendingUp, AlertTriangle,
    MoreHorizontal, ChevronLeft, ChevronRight, Calculator, CheckCircle, RotateCcw, Trash2, Pencil
} from 'lucide-react';

export default function AbsencesAdmin({ res = {}, stats = {}, modules = [] }) {
    // Safe defaults
    const safeRes = res || {};
    const safeStats = stats || {};
    const safeModules = Array.isArray(modules) ? modules : [];
    const absences = safeRes.data || [];
    
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
            student: {
                name: `${student.prenom || ''} ${student.nom || ''}`.trim() || 'N/A',
                id: user.matricule || student.id || 'N/A',
                avatar: null
            },
            class: student.option?.libelle || 'N/A',
            module: module.libelle || 'N/A',
            date: dateAbsence.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: dateAbsence.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: status,
            isDeleted: isDeleted,
            motif: absence.motif_absence || '',
            motifSuppression: absence.motif_suppression || null
        };
    });

    const [filters, setFilters] = useState({ search: '', module: '', status: 'Active' });

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

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Absences Management</h1>
                        <p className="text-gray-500 mt-1 text-sm">Track, justify, and manage student attendance records.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm">
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
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full md:w-auto relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <select 
                                value={filters.module}
                                onChange={(e) => setFilters({...filters, module: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Modules</option>
                                {safeModules.map((module) => (
                                    <option key={module.id} value={module.id}>{module.libelle}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-56 relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Select Date Range"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex md:ml-auto bg-gray-100 p-1 rounded-xl">
                            <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-gray-900">Active</button>
                            <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900">Deleted</button>
                        </div>
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
                                                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                                                                <RotateCcw className="w-3 h-3" /> Restore
                                                            </span>
                                                            <MoreHorizontal className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors">Previous</button>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400 font-medium">Previous</span>
                                )}
                                {safeRes.current_page < safeRes.last_page ? (
                                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors">Next</button>
                                ) : (
                                    <span className="px-4 py-2 text-gray-400 font-medium">Next</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
