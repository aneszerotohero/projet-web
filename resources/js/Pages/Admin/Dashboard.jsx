import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Download, Users, BarChart3, CheckCircle, AlertTriangle,
    Search, Filter, ChevronDown, Trophy, Medal, Eye, Pencil,
    ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

export default function AdminDashboard({ podium = [], others = [], ranking_stats = {}, filters = {} }) {
    // Ensure safe defaults
    const safePodium = Array.isArray(podium) ? podium : [];
    const safeOthers = Array.isArray(others) ? others : [];
    const safeRankingStats = ranking_stats || {};
    const safeFilters = filters || {};

    const KpiCard = ({ title, value, trend, type, icon: Icon }) => (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">{title}</h3>
                <div className={`p-2 rounded-lg ${type === 'up' || type === 'down_good' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="z-10">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-black text-gray-900">{value}</h2>
                   {trend && (
                       <span
                           className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                               (trend?.includes('+') && type !== 'down_good') || (trend?.includes('-') && type === 'down_good')
                                   ? 'bg-green-100 text-green-800'
                                   : 'bg-red-100 text-red-800'
                           }`}
                       >
                           {trend}
                       </span>
                   )}

                </div>
            </div>
            {/* Background decoration */}
            <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform" />
        </div>
    );

    const PodiumStep = ({ student, rank, color }) => {
        if (!student) return null;
        const prenom = student.prenom || '';
        const nom = student.nom || '';
        const moyenne = student.moyenne_cycle || 0;
        const initials = (prenom[0] || '') + (nom[0] || '');
        
        return (
            <div className={`flex flex-col items-center flex-1 ${rank === 1 ? '-mt-12 scale-110 z-10' : 'mt-0'}`}>
                <div className="relative mb-4 group cursor-pointer">
                    <div className={`w-24 h-24 rounded-full border-4 ${rank === 1 ? 'border-yellow-400 shadow-xl shadow-yellow-200' :
                            rank === 2 ? 'border-gray-300 shadow-lg' : 'border-orange-300 shadow-lg'
                        } overflow-hidden bg-gray-100`}>
                        {student.avatar ? (
                            <img src={student.avatar} alt={nom} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-2xl">
                                {initials || '?'}
                            </div>
                        )}
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm shadow-md border-2 border-white ${color}`}>
                        {rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
                    </div>
                </div>
                <div className="text-center mb-4">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{prenom} {nom}</h3>
                    <div className="flex items-center justify-center gap-1 mt-1 text-blue-600 font-black text-xl">
                        {Number(moyenne).toFixed(2)} <span className="text-xs text-gray-400 font-medium">/ 20</span>
                    </div>
                </div>
                {/* Podium Block */}
                <div className={`w-full rounded-t-xl shadow-inner flex justify-center items-start pt-4 font-black text-6xl text-white/20 select-none
                    ${rank === 1 ? 'h-64 bg-yellow-100/50' : rank === 2 ? 'h-48 bg-gray-100' : 'h-32 bg-orange-50'}`}>
                    {rank}
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen font-sans">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <nav className="text-sm font-medium text-gray-400 mb-1">
                            Dashboard • <span className="text-blue-600">Rankings</span>
                        </nav>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Rankings</h1>
                        <p className="text-gray-500 mt-1 text-sm">Overview of academic performance for the 2023-2024 academic year.</p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                        <Download className="w-5 h-5" />
                        Export Report
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
                    <div className="flex flex-wrap items-center gap-4 md:gap-8 min-w-max">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filters:</span>

                            {/* Filter Dropdowns */}
                            {[
                                { label: 'Year', value: safeFilters.year || new Date().getFullYear().toString() },
                                { label: 'Speciality', value: safeFilters.speciality || 'All' },
                                { label: 'Option', value: safeFilters.option || 'All' },
                                { label: 'Semester', value: safeFilters.semester ? `Semester ${safeFilters.semester}` : 'Semester 1' }
                            ].map((filter, idx) => (
                                <div key={idx} className="relative group">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-700 transition-colors">
                                        {filter.label}: {filter.value}
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1"></div>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <KpiCard title="Total Students" value={safeRankingStats.total_students?.value || '0'} trend={safeRankingStats.total_students?.trend || null} type={safeRankingStats.total_students?.trend_type || 'up'} icon={Users} />
                    <KpiCard title="Class Average" value={safeRankingStats.class_average?.value || '0.00'} trend={safeRankingStats.class_average?.trend || null} type={safeRankingStats.class_average?.trend_type || 'up'} icon={BarChart3} />
                    <KpiCard title="Pass Rate" value={safeRankingStats.pass_rate?.value || '0%'} trend={safeRankingStats.pass_rate?.trend || null} type={safeRankingStats.pass_rate?.trend_type || 'up'} icon={CheckCircle} />
                    <KpiCard title="Total Absences" value={safeRankingStats.total_absences?.value || '0'} trend={safeRankingStats.total_absences?.trend || null} type={safeRankingStats.total_absences?.trend_type || 'down_good'} icon={AlertTriangle} />
                </div>

                {/* Podium Section */}
                <div className="flex justify-center items-end gap-4 md:gap-12 mb-16 px-4 py-8 relative">
                    {/* Crown Icon floating above 1st place */}
                    <Trophy className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 text-yellow-500 animate-bounce" />

                    {safePodium[1] && <PodiumStep student={safePodium[1]} rank={2} color="bg-gray-400" />}
                    {safePodium[0] && <PodiumStep student={safePodium[0]} rank={1} color="bg-yellow-400" />}
                    {safePodium[2] && <PodiumStep student={safePodium[2]} rank={3} color="bg-orange-400" />}
                </div>

                {/* Full Ranking List */}
                <div className="bg-white rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="font-black text-gray-900 text-xl">Full Ranking List</h2>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <Filter className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase font-extrabold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Matricule</th>
                                    <th className="px-6 py-4 text-center">S1 Avg</th>
                                    <th className="px-6 py-4 text-center">S2 Avg</th>
                                    <th className="px-6 py-4 text-center">Cycle Avg</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[...safePodium, ...safeOthers].filter(s => s && s.rank).sort((a, b) => (a.rank || 0) - (b.rank || 0)).slice(3).map((student) => {
                                    if (!student) return null;
                                    const prenom = student.prenom || '';
                                    const nom = student.nom || '';
                                    const matricule = student.matricule || 'N/A';
                                    const s1 = student.s1 || 0;
                                    const s2 = student.s2 || 0;
                                    const moyenne_cycle = student.moyenne_cycle || 0;
                                    const initials = (prenom[0] || '') + (nom[0] || '');
                                    const rank = student.rank || 0;
                                    
                                    return (
                                        <tr key={student.id || Math.random()} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-black text-gray-400 group-hover:text-blue-600">#{rank}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 overflow-hidden">
                                                        {student.avatar ? <img src={student.avatar} className="w-full h-full object-cover" alt={nom} /> : initials || '?'}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{prenom} {nom}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-blue-600">{matricule}</td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-600">{Number(s1).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-600">{Number(s2).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                                                    {Number(moyenne_cycle).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">
                            Showing <span className="font-bold text-gray-900">4</span> to <span className="font-bold text-gray-900">{Math.min(4 + safeOthers.length, safePodium.length + safeOthers.length)}</span> of <span className="font-bold text-gray-900">{safePodium.length + safeOthers.length}</span> students
                        </span>
                        <div className="flex items-center gap-2">
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50" disabled><ChevronLeft className="w-4 h-4" /></button>
                            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30">1</button>
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50" disabled><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
