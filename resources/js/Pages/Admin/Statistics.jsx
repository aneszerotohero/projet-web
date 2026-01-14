import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line, Radar } from 'react-chartjs-2';
import { Users, FileWarning, GraduationCap, TrendingUp, Filter, X, ChevronDown, Activity, Radar as RadarIcon } from 'lucide-react';

// Enregistrement de TOUS les composants graphiques
ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, RadialLinearScale,
  Title, Filler
);

export default function Statistics({ kpis, absence_stats, module_stats, top_students, filters: initialFilters, available_filters }) {
  const [filters, setFilters] = useState(initialFilters || {});
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Get filtered options based on selected specialite
  const options = available_filters?.options || [];
  const specialites = available_filters?.specialites || [];
  const currentSpecialiteId = filters.specialite_id || null;
  const filteredOptions = currentSpecialiteId
    ? options.filter(opt => opt.specialite_id == currentSpecialiteId)
    : options;

  // --- Gestion des Filtres (Identique) ---
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    // Reset option_id when specialite_id changes
    if (key === 'specialite_id' && value) {
      newFilters.option_id = '';
    }
    setFilters(newFilters);
    const params = { ...newFilters };
    Object.keys(params).forEach(key => !params[key] && delete params[key]);
    router.get('/admin/statistiques', params, { preserveState: true, preserveScroll: true });
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    setFilters({});
    router.get('/admin/statistiques', {}, { preserveState: true });
  };

  // --- CONFIGURATION DES GRAPHIQUES MODERNES ---

  // 1. Line Chart : Tendance des notes (Courbe lissée + Remplissage)
  // On simule une progression basée sur les modules pour l'exemple visuel
  const lineData = {
    labels: module_stats.map(m => m.name.substring(0, 10) + '..'),
    datasets: [{
      label: 'Performance Moyenne',
      data: module_stats.map(m => m.average),
      borderColor: '#8b5cf6', // Violet vif
      backgroundColor: 'rgba(139, 92, 246, 0.1)', // Violet transparent
      fill: true,
      tension: 0.4, // Courbe arrondie moderne
      pointBackgroundColor: '#fff',
      pointBorderColor: '#8b5cf6',
      pointBorderWidth: 2,
      pointRadius: 4,
    }]
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#f1f5f9' }, min: 0, max: 20 }
    }
  };

  // 2. Radar Chart : Compétences (Toile d'araignée)
  const radarData = {
    labels: module_stats.slice(0, 6).map(m => m.name), // Prend les 6 premiers modules
    datasets: [{
      label: 'Niveau Classe',
      data: module_stats.slice(0, 6).map(m => m.average),
      backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald
      borderColor: '#10b981',
      borderWidth: 2,
    }]
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: '#e2e8f0' },
        grid: { color: '#e2e8f0' },
        pointLabels: { font: { size: 11, weight: 'bold' }, color: '#475569' },
        suggestedMin: 0,
        suggestedMax: 20
      }
    },
    plugins: { legend: { display: false } }
  };

  // 3. Doughnut (Absences) - Style minimaliste
  const absenceData = {
    labels: ['Justifiées', 'Non Justifiées'],
    datasets: [{
      data: [absence_stats.justified, absence_stats.unjustified],
      backgroundColor: ['#3b82f6', '#ef4444'], // Bleu pur / Rouge pur
      borderWidth: 0,
      hoverOffset: 10
    }],
  };
  const doughnutOptions = {
    cutout: '75%',
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }
  };

  // 4. Bar Chart (Modules) - Style sombre dégradé
  const barData = {
    labels: module_stats.map(m => m.name),
    datasets: [{
      label: 'Note',
      data: module_stats.map(m => m.average),
      backgroundColor: '#6366f1', // Indigo
      borderRadius: 4,
      barThickness: 20,
    }],
  };

  // --- COMPOSANTS UI MODERNISÉS ---

  const KPICard = ({ label, value, icon: Icon, gradient }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${gradient} transform transition hover:-translate-y-1`}>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Icon className="w-6 h-6 text-white" />
            </div>
            {/* Petit indicateur visuel décoratif */}
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
        </div>
        <div>
            <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
            <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        </div>
      </div>
      {/* Cercles décoratifs en arrière plan */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );

  return (
    <>
      <Head title="Statistiques Avancées" />

      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 lg:p-8 font-sans">

        {/* Header Compact & Moderne */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-600" />
                    Analytique Scolaire
                </h1>
                <p className="text-slate-500 text-sm mt-1">Vue d'ensemble en temps réel des indicateurs de performance.</p>
            </div>

            {/* Zone Filtres (Style Pilule) */}
            <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <Filter className="w-4 h-4 text-slate-400 mr-2" />

                <select
                    value={filters.annee || ''}
                    onChange={(e) => handleFilterChange('annee', e.target.value)}
                    className="border-none bg-transparent text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:text-indigo-600"
                >
                    <option value="">Année (Toutes)</option>
                    {available_filters.years.map(y => <option key={y} value={y}>Année {y}</option>)}
                </select>

                <div className="w-px h-4 bg-slate-300"></div>

                <select
                    value={filters.specialite_id || ''}
                    onChange={(e) => handleFilterChange('specialite_id', e.target.value)}
                    className="border-none bg-transparent text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:text-indigo-600 max-w-[150px] truncate"
                >
                    <option value="">Spécialité (Toutes)</option>
                    {Object.values(available_filters.specialites_by_libelle || {}).map(g => (
                        g.specialites[0] && <option key={g.specialites[0].id} value={g.specialites[0].id}>{g.libelle}</option>
                    ))}
                </select>

                <div className="w-px h-4 bg-slate-300"></div>

                <select
                    value={filters.option_id || ''}
                    onChange={(e) => handleFilterChange('option_id', e.target.value)}
                    className="border-none bg-transparent text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:text-indigo-600 max-w-[150px] truncate"
                    disabled={!currentSpecialiteId}
                >
                    <option value="">Option (Toutes)</option>
                    {filteredOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.libelle}</option>
                    ))}
                </select>

                {(filters.annee || filters.specialite_id || filters.option_id) && (
                    <button onClick={clearFilters} className="ml-2 bg-rose-50 text-rose-600 p-1 rounded-full hover:bg-rose-100 transition">
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>

        {/* --- SECTION 1 : KPIs (Couleurs Solides & Dégradés) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <KPICard label="Total Étudiants" value={kpis.total_students} icon={Users} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
            <KPICard label="Taux de Présence" value={kpis.total_absences > 0 ? "85%" : "100%"} icon={Activity} gradient="bg-gradient-to-br from-emerald-500 to-teal-700" />
            <KPICard label="Moyenne Générale" value={Number(kpis.average_grade).toFixed(2)} icon={GraduationCap} gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
            <KPICard label="Absences Totales" value={kpis.total_absences} icon={FileWarning} gradient="bg-gradient-to-br from-slate-700 to-slate-900" />
        </div>

        {/* --- SECTION 2 : GRAPHIQUES (Layout Bento Box) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* GRANDE CARTE : Courbe d'évolution (Line Chart) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 text-lg">Tendance des Résultats</h3>
                    <span className="text-xs font-semibold bg-violet-50 text-violet-600 px-2 py-1 rounded">Semestre Actuel</span>
                </div>
                <div className="h-[300px] w-full">
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>

            {/* PETITE CARTE : Radar des compétences */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <h3 className="font-bold text-slate-800 text-lg mb-4 self-start">Répartition Pédagogique</h3>
                <div className="h-[250px] w-full flex items-center justify-center">
                    <Radar data={radarData} options={radarOptions} />
                </div>
            </div>

            {/* CARTE MOYENNE : Bar Chart (Modules) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg mb-6">Détail par Module</h3>
                <div className="h-[250px]">
                    <Bar data={barData} options={{...lineOptions, maintainAspectRatio: false}} />
                </div>
            </div>

            {/* PETITE CARTE : Donut (Absences) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg mb-2">Ratio d'Assiduité</h3>
                <div className="relative h-[220px] flex items-center justify-center">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-800">{kpis.total_absences}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Heures</span>
                    </div>
                    <Doughnut data={absenceData} options={doughnutOptions} />
                </div>
            </div>
        </div>

        {/* --- SECTION 3 : LE PODIUM (Style Dark Premium) --- */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            {/* Fond décoratif */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <div className="relative z-10 text-center mb-10">
                <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                    HALL OF FAME
                </h2>
                <p className="text-slate-400 text-sm">Les étudiants les plus performants de la promotion</p>
            </div>

            <div className="flex flex-col md:flex-row items-end justify-center gap-4 relative z-10 min-h-[280px]">
                {top_students.length > 0 ? top_students.map((student, idx) => {
                    // Calcul des hauteurs et styles pour 1er, 2eme, 3eme
                    const isFirst = idx === 0;
                    const isSecond = idx === 1;
                    const height = isFirst ? 'h-64' : (isSecond ? 'h-52' : 'h-44');
                    const order = isFirst ? 'order-2' : (isSecond ? 'order-1' : 'order-3'); // Le 1er au milieu
                    const bgColor = isFirst
                        ? 'bg-gradient-to-t from-yellow-600/40 to-yellow-600/10 border-yellow-500/50'
                        : 'bg-slate-800/50 border-slate-700';
                    const glow = isFirst ? 'shadow-[0_0_30px_rgba(234,179,8,0.3)]' : '';

                    return (
                        <div key={student.id} className={`${order} ${height} ${bgColor} ${glow} w-full md:w-1/4 rounded-t-2xl border-t border-x p-4 flex flex-col items-center justify-start pt-6 transition-all hover:bg-slate-800`}>

                            {/* Avatar avec couronne pour le premier */}
                            <div className="relative mb-3">
                                {isFirst && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl">👑</div>}
                                <img
                                    src={`https://ui-avatars.com/api/?name=${student.prenom}+${student.nom}&background=${isFirst ? 'eab308' : 'cbd5e1'}&color=000&bold=true`}
                                    className={`w-14 h-14 rounded-full border-2 ${isFirst ? 'border-yellow-400' : 'border-slate-400'}`}
                                />
                            </div>

                            <div className="text-center">
                                <h3 className="font-bold text-white text-base leading-tight">{student.prenom}</h3>
                                <p className="text-xs text-slate-400 mt-1 mb-3">{student.nom}</p>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-black ${isFirst ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}`}>
                                    {Number(student.average).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                     <p className="text-slate-500">Aucun classement disponible.</p>
                )}
            </div>
        </div>

      </div>
    </>
  );
}

Statistics.layout = (page) => <AdminLayout>{page}</AdminLayout>;
