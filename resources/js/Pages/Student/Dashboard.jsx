import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import {
    Calendar, TrendingUp, BarChart3, AlertTriangle,
    ChevronRight, Clock, Mail, GraduationCap, Trophy
} from 'lucide-react';

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard({
    student = {},
    semestre = 1,
    annee = '2025-2026',
    moyenne_semestre = 0,
    moyenne_generale = 0,
    progression_semestre = 0,
    progression_generale = 0,
    moyennes_par_module = [],
    absences_stats = {},
    chart_data = { labels: [], student: [], class_avg: [] },
    rankings = { option: {}, specialite: {}, annee: {} }
}) {
    const [rankFilter, setRankFilter] = useState('option');
    const safeMoyennes = Array.isArray(moyennes_par_module) ? moyennes_par_module : [];
    const activeRank = rankings && rankings[rankFilter] ? rankings[rankFilter] : { rank: '-', total: '-', top_score: 0 };

    const percentile = activeRank.total > 0 && typeof activeRank.rank === 'number'
        ? Math.round(((activeRank.total - activeRank.rank) / activeRank.total) * 100)
        : 0;

    const TrendIndicator = ({ value, label }) => {
        const isPositive = value >= 0;
        return (
            <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-500'} mt-2`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${!isPositive && 'transform rotate-180'}`} />
                <span>{isPositive ? '+' : ''}{value}% {label}</span>
            </div>
        );
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', align: 'end' },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: { beginAtZero: true, max: 20, grid: { color: '#f3f4f6' } },
            x: { grid: { display: false } }
        }
    };

    const chartDataConfig = {
        labels: chart_data.labels?.length > 0 ? chart_data.labels : ['Aucune donnée'],
        datasets: [
            {
                label: 'Ma Note',
                data: chart_data.student,
                backgroundColor: '#3b82f6',
                borderRadius: 6,
            },
            {
                label: 'Moyenne Classe',
                data: chart_data.class_avg,
                backgroundColor: '#e5e7eb',
                borderRadius: 6,
            },
        ],
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50/30 min-h-screen space-y-8">

            {/* --- HEADER FULL WIDTH --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h6 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Espace Élève</h6>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bonjour, {student?.prenom} ! 👋</h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Aperçu académique : <span className="font-bold text-blue-600">Semestre {semestre}, {annee}</span>
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-gray-600 shadow-sm border border-gray-100">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* --- SECTION 2 : CARTES KPIs --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">Moyenne Semestre</h3>
                        <div className="flex items-baseline gap-1 mt-3">
                            <span className="text-5xl font-black text-gray-900">{moyenne_semestre ? Number(moyenne_semestre).toFixed(2) : '0.00'}</span>
                            <span className="text-gray-300 font-bold text-xl">/20</span>
                        </div>
                        <TrendIndicator value={progression_semestre} label="vs dernier sem." />
                    </div>
                    <GraduationCap className="absolute -right-8 -top-8 text-gray-50 opacity-40 group-hover:scale-110 transition-transform" size={180} />
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">Moyenne Générale</h3>
                            <div className="flex items-baseline gap-1 mt-3">
                                <span className="text-5xl font-black text-gray-900">{moyenne_generale ? Number(moyenne_generale).toFixed(2) : '0.00'}</span>
                                <span className="text-gray-300 font-bold text-xl">/20</span>
                            </div>
                            <TrendIndicator value={progression_generale || 0.2} label="progression" />
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-500 h-fit">
                            <BarChart3 size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Absences</h3>
                            <div className="flex items-baseline gap-1 mt-3">
                                <span className={`text-5xl font-black ${absences_stats?.total > 10 ? 'text-rose-600' : 'text-gray-900'}`}>
                                    {absences_stats?.total || 0}
                                </span>
                                <span className="text-gray-300 font-bold text-xl">Heures</span>
                            </div>
                            {absences_stats?.unjustified > 0 && (
                                <div className="mt-4 flex items-center gap-2 text-xs text-orange-700 font-black bg-orange-50 px-3 py-1.5 rounded-xl w-fit">
                                    <AlertTriangle size={14} /> {absences_stats.unjustified} NON JUSTIFIÉES
                                </div>
                            )}
                        </div>
                        <div className="bg-orange-50 p-4 rounded-2xl text-orange-500 h-fit">
                            <Clock size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 3 : ANALYSE VISUELLE --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Analyse de Performance</h2>
                        <span className="bg-blue-50 text-blue-600 text-xs font-black px-3 py-1 rounded-lg uppercase">Moi vs Classe</span>
                    </div>
                    <div className="flex-1 relative">
                        <Bar data={chartDataConfig} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative h-[450px]">
                    <div className="absolute top-0 w-full h-36 bg-gradient-to-br from-indigo-900 to-slate-800"></div>
                    <div className="relative p-8 h-full flex flex-col">
                        <div className="flex justify-between items-center text-white mb-8">
                            <div className="flex items-center gap-3">
                                <Trophy className="text-yellow-400" size={24} />
                                <span className="font-black text-lg tracking-tight">Mon Classement</span>
                            </div>
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black border border-white/20">LIVE</span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center mb-8">
                                <div className="relative inline-block">
                                    {activeRank.rank === 1 && <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</div>}
                                    <h2 className="text-6xl font-black text-slate-800 tracking-tighter">
                                        {activeRank.rank}
                                        <span className="text-xl text-gray-300 font-bold ml-2">/ {activeRank.total}</span>
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-500 font-bold mt-4 uppercase tracking-wide">
                                    {activeRank.rank === 1 ? <span className="text-yellow-600">Major de Promotion ! 🏆</span> : `Top ${100 - percentile}% de la promo`}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                {[{ key: 'option', label: 'Option' }, { key: 'specialite', label: 'Spécialité' }, { key: 'annee', label: 'Promo' }].map((f) => (
                                    <button key={f.key} onClick={() => setRankFilter(f.key)} className={`py-2.5 rounded-xl text-xs font-black transition-all ${rankFilter === f.key ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 4 : DÉTAILS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Relevé de Notes Détaillé</h2>
                        <span className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl uppercase">Semestre {semestre}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">Module</th>
                                    <th className="px-8 py-5 text-center">Coef</th>
                                    <th className="px-8 py-5 text-center">DS</th>
                                    <th className="px-8 py-5 text-center">Exam</th>
                                    <th className="px-8 py-5 text-right">Moyenne</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {safeMoyennes.map((mod, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="px-8 py-6 font-bold text-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${mod.moyenne >= 10 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`}></div>
                                                {mod.module}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-gray-500 font-bold">{mod.coef}</td>
                                        <td className="px-8 py-6 text-center text-gray-600 font-medium">{mod.ds || '-'}</td>
                                        <td className="px-8 py-6 text-center text-gray-900 font-bold">{mod.exam || '-'}</td>
                                        <td className={`px-8 py-6 text-right font-black text-lg ${mod.moyenne >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {Number(mod.moyenne).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6 h-fit">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Accès Rapide</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Détail des Notes', href: '/student/notes', icon: BarChart3 },
                                { label: 'Mes Absences', href: '/student/absences', icon: Clock },
                                { label: "Contacter l'Admin", href: '#', icon: Mail, type: 'btn' }
                            ].map((item, i) => (
                                item.type === 'btn' ? (
                                    <button key={i} className="w-full flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold transition-all group border border-transparent hover:border-blue-100">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:text-blue-600 transition-colors"><item.icon size={20} /></div>
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600" />
                                    </button>
                                ) : (
                                    <Link key={i} href={item.href} className="w-full flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-bold transition-all group border border-transparent hover:border-blue-100">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:text-blue-600 transition-colors"><item.icon size={20} /></div>
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600" />
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <StudentLayout>{page}</StudentLayout>;
