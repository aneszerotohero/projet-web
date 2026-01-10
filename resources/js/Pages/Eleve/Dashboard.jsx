import React from 'react';
import StudentLayout from '../../Layouts/StudentLayout';
import { Calendar, Download, TrendingUp, BarChart3, AlertTriangle, ChevronRight, FileText, Clock, Mail } from 'lucide-react';

export default function Dashboard({
    student = {},
    semestre = 1,
    annee = '2023-2024',
    moyenne_semestre = 0,
    moyenne_generale = 0,
    progression_semestre = 0,
    progression_generale = 0,
    moyennes_par_module = [],
    absences_stats = {},
    chart_data = {}
}) {
    // Ensure arrays
    const safeMoyennes = Array.isArray(moyennes_par_module) ? moyennes_par_module : [];

    // Helper for rendering trend indicators
    const TrendIndicator = ({ value, label }) => {
        const isPositive = value >= 0;
        return (
            <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'} mt-2`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${!isPositive && 'transform rotate-180'}`} />
                <span>{isPositive ? '+' : ''}{value}% {label}</span>
            </div>
        );
    };

    return (
        <StudentLayout>
            <div className="p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h6 className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Student Dashboard</h6>
                        <h1 className="text-3xl font-black text-gray-900">Welcome back, {student?.prenom}!</h1>
                        <p className="text-gray-600 mt-1">
                            Here is your academic overview for <span className="font-bold text-blue-600">Semester {semestre}, {annee}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                            <Calendar className="w-4 h-4" />
                            View Timetable
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                            <Download className="w-4 h-4" />
                            Transcript
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Semester Average */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-100 transition-all cursor-default">
                        <div className="relative z-10">
                            <h3 className="text-gray-500 font-medium text-sm mb-1">Semester Average</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900">{Number(moyenne_semestre).toFixed(2)}</span>
                                <span className="text-gray-400 font-medium text-lg">/20</span>
                            </div>
                            <TrendIndicator value={progression_semestre} label="vs last sem" />
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
                            <GraduationCapIcon size={140} />
                        </div>
                    </div>

                    {/* Cumulative Average */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-indigo-100 transition-all">
                        <div className="relative z-10">
                            <h3 className="text-gray-500 font-medium text-sm mb-1">Cumulative Average</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900">{Number(moyenne_generale || 13.80).toFixed(2)}</span>
                                <span className="text-gray-400 font-medium text-lg">/20</span>
                            </div>
                            <TrendIndicator value={progression_generale || 0.2} label="improvement" />
                        </div>
                        <div className="absolute right-4 top-4">
                            <BarChart3 className="text-indigo-100 w-12 h-12" />
                        </div>
                    </div>

                    {/* Absences */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-orange-100 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="relative z-10">
                                <h3 className="text-gray-500 font-medium text-sm mb-1">Total Absences</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900">{absences_stats?.total || 0}</span>
                                    <span className="text-gray-400 font-medium text-lg">Hours</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md w-fit">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{absences_stats?.unjustified || 0} Unjustified</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="p-3 bg-yellow-50 rounded-full">
                                    <AlertTriangle className="text-yellow-500 w-6 h-6" />
                                </div>
                            </div>
                        </div>
                        <button className="absolute bottom-6 right-6 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                            Justify now
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Grades Table */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Grades Overview */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Grades Overview</h2>
                                <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-1.5">
                                    <option>All Modules</option>
                                    <option>Major Only</option>
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Module</th>
                                            <th className="px-6 py-4 text-center">Coeff</th>
                                            <th className="px-6 py-4 text-center">DS</th>
                                            <th className="px-6 py-4 text-center">TD</th>
                                            <th className="px-6 py-4 text-center">TP</th>
                                            <th className="px-6 py-4 text-center">Exam</th>
                                            <th className="px-6 py-4 text-right">Avg (Moy)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {safeMoyennes.map((mod, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                                                    <span className={`w-2 h-2 rounded-full ${mod.moyenne >= 10 ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                                                    {mod.module}
                                                </td>
                                                <td className="px-6 py-4 text-center text-blue-600 font-semibold">{mod.coef}</td>
                                                <td className="px-6 py-4 text-center text-gray-600">{mod.ds ? Number(mod.ds).toFixed(2) : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-600">{mod.td ? Number(mod.td).toFixed(2) : '-'}</td>
                                                <td className="px-6 py-4 text-center text-gray-600">{mod.tp ? Number(mod.tp).toFixed(2) : '-'}</td>
                                                <td className="px-6 py-4 text-center font-medium text-gray-900">{mod.exam ? Number(mod.exam).toFixed(2) : '-'}</td>
                                                <td className={`px-6 py-4 text-right font-black ${mod.moyenne >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {Number(mod.moyenne).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50/30 border-t border-gray-100">
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 font-extrabold text-gray-900">Overall Semester Average</td>
                                            <td className="px-6 py-4 text-right font-black text-xl text-blue-600">{Number(moyenne_semestre).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Performance & Actions */}
                    <div className="flex flex-col gap-6">
                        {/* Performance Chart Placeholder */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Performance</h2>
                                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">vs Class</span>
                            </div>

                            {/* Simple CSS Bar Chart Visualization */}
                            <div className="flex items-end justify-between h-48 gap-2 pt-4">
                                {chart_data?.labels?.map((label, idx) => {
                                    const studentVal = chart_data.student[idx];
                                    const classVal = chart_data.class_avg[idx];
                                    const maxVal = 20; // Grade out of 20

                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="relative w-full flex justify-center h-full items-end gap-1">
                                                {/* Class Avg (Background Bar) */}
                                                <div
                                                    className="w-full bg-gray-100 rounded-t-sm absolute bottom-0 transition-all group-hover:bg-gray-200"
                                                    style={{ height: `${(classVal / maxVal) * 100}%` }}
                                                    title={`Class Avg: ${classVal}`}
                                                ></div>
                                                {/* Student Score (Foreground Bar) */}
                                                <div
                                                    className={`w-4/5 rounded-t-md relative z-10 transition-all ${studentVal >= classVal ? 'bg-blue-600' : 'bg-red-500'}`}
                                                    style={{ height: `${(studentVal / maxVal) * 100}%` }}
                                                    title={`Your Score: ${studentVal}`}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <span>View Class Ranking</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <span>Absence History</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <span>Message Administration</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

// Simple Icon Component for the Graduation Cap background
const GraduationCapIcon = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path d="M2 17L12 22L22 17" opacity="0.5" />
        <path d="M2 12L12 17L22 12" opacity="0.5" />
    </svg>
);
