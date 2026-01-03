import React, { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Download, Plus, Search, Filter, Calendar, FileText,
    MoreHorizontal, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';

export default function NotesAdmin() {
    // Mock Data based on the mockup
    const stats = {
        average_gpa: { value: '12.4', trend: '+0.2%', trend_type: 'up' },
        failing_students: { value: '45', trend: '-5% vs last term', trend_type: 'down_good' },
        grades_today: { value: '128', trend: '+12%', trend_type: 'up' }
    };

    const mockNotes = [
        { id: 1, student: { name: 'Amine Benali', id: '2023001', avatar: null }, module: 'Mathematics', type: 'Exam', grade: 14.5, coeff: 5, date: 'Oct 24, 2023' },
        { id: 2, student: { name: 'Sarah Khadir', id: '2023045', avatar: 'https://i.pravatar.cc/150?u=sarah' }, module: 'Physics', type: 'Test', grade: 8.0, coeff: 4, date: 'Oct 23, 2023' },
        { id: 3, student: { name: 'Mohamed Zaid', id: '2023012', avatar: 'https://i.pravatar.cc/150?u=mohamed' }, module: 'Natural Sciences', type: 'Homework', grade: 18.5, coeff: 2, date: 'Oct 22, 2023' },
        { id: 4, student: { name: 'Lina Hamidi', id: '2023089', avatar: 'https://i.pravatar.cc/150?u=lina' }, module: 'Arabic Literature', type: 'Exam', grade: 12.0, coeff: 3, date: 'Oct 21, 2023' },
        { id: 5, student: { name: 'Yacine Kadri', id: '2023055', avatar: 'https://i.pravatar.cc/150?u=yacine' }, module: 'Mathematics', type: 'Test', grade: 9.5, coeff: 5, date: 'Oct 20, 2023' },
    ];

    const [filters, setFilters] = useState({ search: '', module: 'All Modules', semester: 'All Semesters', type: 'All Types' });

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
                <div className={`text-xs font-bold mt-2 ${trendType === 'up' || trendType === 'down_good' ? 'text-green-600' : 'text-red-500'}`}>
                    {trend}
                </div>
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
                    <KpiCard title="Average GPA" value={stats.average_gpa.value} trend={stats.average_gpa.trend} trendType={stats.average_gpa.trend_type} icon={TrendingUp} color="green" />
                    <KpiCard title="Failing Students" value={stats.failing_students.value} trend={stats.failing_students.trend} trendType={stats.failing_students.trend_type} icon={AlertTriangle} color="red" />
                    <KpiCard title="Grades Entered Today" value={stats.grades_today.value} trend={stats.grades_today.trend} trendType={stats.grades_today.trend_type} icon={Calendar} color="blue" />
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
                                    placeholder="Name or Student ID..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Module</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500">
                                <option>All Modules</option>
                                <option>Mathematics</option>
                                <option>Physics</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Semester</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500">
                                <option>All Semesters</option>
                                <option>Semester 1</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Grade Type</label>
                                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-blue-500 focus:border-blue-500">
                                    <option>All Types</option>
                                    <option>Exam</option>
                                    <option>Test</option>
                                </select>
                            </div>
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-800 mb-1 self-end">Clear Filters</button>
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
                                {mockNotes.map((note) => (
                                    <tr key={note.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-200">
                                                    {note.student.avatar ? <img src={note.student.avatar} alt={note.student.name} className="w-full h-full object-cover" /> : note.student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{note.student.name}</div>
                                                    <div className="text-xs font-medium text-gray-400">ID: {note.student.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-700">{note.module}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold 
                                                ${note.type === 'Exam' ? 'bg-purple-100 text-purple-700' :
                                                    note.type === 'Test' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {note.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-lg font-black ${note.grade < 10 ? 'text-red-500' : note.grade >= 16 ? 'text-green-600' : 'text-gray-900'}`}>
                                                    {note.grade < 10 ? `0${note.grade}` : note.grade}
                                                </span>
                                                <span className="text-xs font-medium text-gray-400">/20</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{note.coeff}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{note.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Showing <span className="font-bold text-gray-900">1</span> to <span className="font-bold text-gray-900">5</span> of <span className="font-bold text-gray-900">128</span> results</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 mr-2 font-medium">Previous</span>
                            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30">1</button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50 rounded-lg">2</button>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50 rounded-lg">3</button>
                            <span className="text-gray-400">...</span>
                            <button className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50 rounded-lg">10</button>
                            <span className="text-gray-600 ml-2 font-bold cursor-pointer hover:text-blue-600">Next</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
