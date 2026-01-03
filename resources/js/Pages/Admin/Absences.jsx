import React, { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Plus, Search, Filter, Calendar, TrendingUp, AlertTriangle,
    MoreHorizontal, ChevronLeft, ChevronRight, Calculator, CheckCircle, RotateCcw, Trash2, Pencil
} from 'lucide-react';

export default function AbsencesAdmin() {
    // Mock Data based on the mockup
    const stats = {
        new_absences: { value: '24', trend: '+12% vs yesterday', trend_type: 'up_bad' },
        most_absent_module: { value: 'Mathematics', subtext: '2nd Year A Group', icon: Calculator },
        warning_list: { value: '3', subtext: 'Students approaching limit', trend_type: 'warning' }
    };

    const mockAbsences = [
        { id: 1, student: { name: 'Ahmed Benali', id: '20230145', avatar: 'https://i.pravatar.cc/150?u=ahmed' }, class: '2nd Year A', module: 'Mathematics', date: 'Oct 14, 2023', time: '08:00 AM', status: 'Unjustified' },
        { id: 2, student: { name: 'Sara Khelif', id: '20230188', avatar: 'https://i.pravatar.cc/150?u=sara' }, class: '3rd Year B', module: 'Physics', date: 'Oct 12, 2023', time: '10:00 AM', status: 'Medical' },
        { id: 3, student: { name: 'Karim Ziani', id: '20230201', avatar: 'https://i.pravatar.cc/150?u=karim' }, class: '1st Year C', module: 'History', date: 'Oct 10, 2023', time: '14:00 PM', status: 'Deleted' },
        { id: 4, student: { name: 'Amina Mansouri', id: '20230212', avatar: 'https://i.pravatar.cc/150?u=amina' }, class: '2nd Year A', module: 'Mathematics', date: 'Oct 09, 2023', time: '09:00 AM', status: 'Unjustified' },
    ];

    const [filters, setFilters] = useState({ search: '', module: 'All Modules', dateRange: '', status: 'Active' });

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
                    <KpiCard title="New Absences (Today)" value={stats.new_absences.value} trend={stats.new_absences.trend} trendType={stats.new_absences.trend_type} color="red" />
                    <KpiCard title="Most Absent Module" value={stats.most_absent_module.value} subtext={stats.most_absent_module.subtext} icon={stats.most_absent_module.icon} color="blue" />
                    <KpiCard title="Warning List" value={stats.warning_list.value} subtext={stats.warning_list.subtext} icon={AlertTriangle} color="orange" />
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
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500">
                                <option>All Modules</option>
                                <option>Mathematics</option>
                                <option>Physics</option>
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
                                {mockAbsences.map((record) => (
                                    <tr key={record.id} className={`group transition-colors ${record.status === 'Deleted' ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'}`}>
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${record.status === 'Deleted' ? 'opacity-50' : ''}`} disabled={record.status === 'Deleted'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-3 ${record.status === 'Deleted' ? 'opacity-50 grayscale' : ''}`}>
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-200">
                                                    {record.student.avatar ? <img src={record.student.avatar} alt={record.student.name} className="w-full h-full object-cover" /> : record.student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${record.status === 'Deleted' ? 'text-gray-500 strike-through' : 'text-gray-900'}`}>{record.student.name}</div>
                                                    <div className="text-xs font-medium text-gray-400">ID: {record.student.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-medium ${record.status === 'Deleted' ? 'text-gray-400' : 'text-blue-600'}`}>{record.class}</td>
                                        <td className={`px-6 py-4 font-bold ${record.status === 'Deleted' ? 'text-gray-400' : 'text-gray-700'}`}>{record.module}</td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${record.status === 'Deleted' ? 'text-gray-400' : 'text-gray-900 font-bold'}`}>{record.date}</div>
                                            <div className="text-xs text-gray-400">{record.time}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold 
                                                ${record.status === 'Unjustified' ? 'bg-red-50 text-red-600' :
                                                    record.status === 'Medical' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {record.status === 'Medical' && <CheckCircle className="w-3 h-3" />}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {record.status === 'Deleted' ? (
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Showing <span className="font-bold text-gray-900">1</span> to <span className="font-bold text-gray-900">4</span> of <span className="font-bold text-gray-900">128</span> results</span>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors">Previous</button>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
