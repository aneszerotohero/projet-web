import React, { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Download, Users, BarChart3, CheckCircle, AlertTriangle,
    Search, Filter, ChevronDown, Trophy, Eye, Pencil, X
} from 'lucide-react';

export default function AdminDashboard({ 
    podium = [], 
    others = [], 
    ranking_stats = {}, 
    filters = {},
    available_filters = {}
}) {
    // Ensure safe defaults
    const safePodium = Array.isArray(podium) ? podium : [];
    const safeOthers = Array.isArray(others) ? others : [];
    const safeRankingStats = ranking_stats || {};
    const safeFilters = filters || {};
    const safeAvailableFilters = available_filters || {};
    
    const specialitesByLibelle = safeAvailableFilters.specialites_by_libelle || {};
    const specialites = safeAvailableFilters.specialites || [];
    const options = safeAvailableFilters.options || [];
    const years = safeAvailableFilters.years || [1, 2, 3];
    const semesters = safeAvailableFilters.semesters || [];
    
    // Filter states
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState(safeFilters.search || '');
    const [searchTimeout, setSearchTimeout] = useState(null);
    
    // Current filter values
    const currentYear = safeFilters.year || null;
    const currentSpecialiteId = safeFilters.specialite_id || null;
    const currentOptionId = safeFilters.option_id || null;
    const currentSemester = safeFilters.semester || 'cycle';
    
    // Get filtered options based on selected specialite
    const filteredOptions = currentSpecialiteId 
        ? options.filter(opt => {
            const specialite = safeAvailableFilters.specialites?.find(s => s.id == currentSpecialiteId);
            return specialite && opt.specialite_id == currentSpecialiteId;
        })
        : options;
    
    // Handle filter changes
    const applyFilters = useCallback((newFilters) => {
        const params = {};
        
        // Year filter (independent - 1, 2, or 3)
        if (newFilters.annee !== undefined && newFilters.annee !== null) {
            params.annee = newFilters.annee;
        }
        
        // Speciality filter (independent - by libelle only)
        // When year is set, we auto-select the matching specialite for that year
        if (newFilters.specialite_id !== undefined) {
            if (newFilters.specialite_id === null) {
                params.specialite_id = '';
            } else {
                params.specialite_id = newFilters.specialite_id;
            }
        }
        
        // Option filter (depends on specialite)
        if (newFilters.option_id !== undefined) {
            if (newFilters.option_id === null) {
                params.option_id = '';
            } else {
                params.option_id = newFilters.option_id;
            }
        }
        
        // Semester filter
        if (newFilters.semester !== undefined) {
            params.semester = newFilters.semester;
        }
        
        // Search filter
        if (newFilters.search !== undefined) {
            params.search = newFilters.search;
        }
        
        router.get('/admin/dashboard', params, { 
            preserveState: true, 
            preserveScroll: true,
            only: ['podium', 'others', 'ranking_stats', 'filters', 'available_filters']
        });
        setOpenDropdown(null);
    }, []);
    
    // Handle search with debounce
    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        
        if (searchTimeout) clearTimeout(searchTimeout);
        
        const timeout = setTimeout(() => {
            applyFilters({
                annee: currentYear,
                specialite_id: currentSpecialiteId,
                option_id: currentOptionId,
                semester: currentSemester,
                search: value
            });
        }, 500);
        
        setSearchTimeout(timeout);
    }, [currentYear, currentSpecialiteId, currentOptionId, currentSemester, searchTimeout, applyFilters]);
    
    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        router.get('/admin/dashboard', {}, { preserveState: true });
        setOpenDropdown(null);
    };
    
    // Get display labels
    const getYearLabel = () => {
        if (!currentYear) return 'All';
        return `Year ${currentYear}`;
    };
    
    const getSpecialityLabel = () => {
        if (!currentSpecialiteId) return 'All';
        const spec = safeAvailableFilters.specialites?.find(s => s.id == currentSpecialiteId);
        if (!spec) return 'All';
        // Only libelle, no year
        const label = spec.libelle;
        return label.length > 25 ? label.substring(0, 22) + '...' : label;
    };
    
    const getOptionLabel = () => {
        if (!currentOptionId) return 'All';
        const opt = options.find(o => o.id == currentOptionId);
        if (!opt) return 'All';
        // Truncate if too long
        return opt.libelle.length > 25 ? opt.libelle.substring(0, 22) + '...' : opt.libelle;
    };
    
    const getSemesterLabel = () => {
        const sem = semesters.find(s => s.value == currentSemester || s.value == String(currentSemester));
        if (!sem) return 'Cycle';
        // Truncate if too long
        const label = sem.label;
        return label.length > 30 ? label.substring(0, 27) + '...' : label;
    };

    const KpiCard = ({ title, value, trend, type, icon: Icon }) => (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">{title}</h3>
                <div className={`p-2 rounded-lg ${type === 'up' || type === 'down_good' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="z-10">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-black text-gray-900">{value}</h2>
                    {trend && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            (trend?.includes('+') && type !== 'down_good') || (trend?.includes('-') && type === 'down_good')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {trend}
                        </span>
                    )}
                </div>
            </div>
            <Icon className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform" />
        </div>
    );

    const PodiumStep = ({ student, rank, color }) => {
        if (!student) return null;
        const prenom = student.prenom || '';
        const nom = student.nom || '';
        const moyenne = student.moyenne_cycle || student.moyenne_semestre || 0;
        const initials = (prenom[0] || '') + (nom[0] || '');
        
        return (
            <div className={`flex flex-col items-center flex-1 ${rank === 1 ? '-mt-12 scale-110 z-10' : 'mt-0'}`}>
                <div className="relative mb-4 group cursor-pointer" onClick={() => {
                    const params = new URLSearchParams();
                    if (currentSemester && currentSemester !== 'cycle') params.set('semester', currentSemester);
                    window.location.href = `/admin/students/${student.id}/transcript?${params.toString()}`;
                }}>
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
                <div className={`w-full rounded-t-xl shadow-inner flex justify-center items-start pt-4 font-black text-6xl text-white/20 select-none
                    ${rank === 1 ? 'h-64 bg-yellow-100/50' : rank === 2 ? 'h-48 bg-gray-100' : 'h-32 bg-orange-50'}`}>
                    {rank}
                </div>
            </div>
        );
    };

    const Dropdown = ({ label, value, isOpen, onToggle, children }) => (
        <div className="relative">
            <button 
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-700 transition-colors whitespace-nowrap min-w-[120px]"
            >
                <span className="truncate max-w-[180px]">{label}: {value}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenDropdown(null)}></div>
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-[101]">
                        {children}
                    </div>
                </>
            )}
        </div>
    );

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
                        <p className="text-gray-500 mt-1 text-sm">Overview of academic performance and rankings.</p>
                    </div>
                    <button 
                        onClick={() => {
                            // Create export URL with current filters
                            const params = new URLSearchParams();
                            if (currentYear) params.set('annee', currentYear);
                            if (currentSpecialiteId) params.set('specialite_id', currentSpecialiteId);
                            if (currentOptionId) params.set('option_id', currentOptionId);
                            if (currentSemester && currentSemester !== 'cycle') params.set('semester', currentSemester);
                            if (searchTerm) params.set('search', searchTerm);
                            
                            // Direct download - export routes don't need Inertia
                            window.location.href = `/admin/dashboard/export?${params.toString()}`;
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
                    >
                        <Download className="w-5 h-5" />
                        Export Report
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Filters:</span>

                            {/* Year Dropdown */}
                            <Dropdown
                                label="Year"
                                value={getYearLabel()}
                                isOpen={openDropdown === 'year'}
                                onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: null, specialite_id: currentSpecialiteId, option_id: currentOptionId, semester: currentSemester, search: searchTerm })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        All Years
                                    </button>
                                    {years.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => applyFilters({ annee: year, specialite_id: currentSpecialiteId, option_id: currentOptionId, semester: currentSemester, search: searchTerm })}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium ${currentYear == year ? 'bg-blue-50 text-blue-600' : ''}`}
                                        >
                                            Year {year}
                                        </button>
                                    ))}
                                </div>
                            </Dropdown>

                            {/* Speciality Dropdown */}
                            <Dropdown
                                label="Speciality"
                                value={getSpecialityLabel()}
                                isOpen={openDropdown === 'speciality'}
                                onToggle={() => setOpenDropdown(openDropdown === 'speciality' ? null : 'speciality')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: currentYear, specialite_id: null, option_id: null, semester: currentSemester, search: searchTerm })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        All Specialities
                                    </button>
                                    {Object.keys(specialitesByLibelle).length > 0 ? (
                                        Object.values(specialitesByLibelle).map((group) => {
                                            if (!group || !group.libelle) return null;
                                            // Get the first specialite with this libelle (or find one matching current year if set)
                                            let selectedSpec = null;
                                            if (currentYear && group.specialites) {
                                                selectedSpec = group.specialites.find(s => s.annee == currentYear);
                                            }
                                            if (!selectedSpec && group.specialites && group.specialites.length > 0) {
                                                selectedSpec = group.specialites[0]; // Use first one as default
                                            }
                                            
                                            // Check if any specialite in this group is selected
                                            const isSelected = selectedSpec && currentSpecialiteId == selectedSpec.id;
                                            
                                            return (
                                                <button
                                                    key={group.libelle}
                                                    onClick={() => {
                                                        // When clicking on a libelle, select the specialite matching current year, or first one
                                                        const specToSelect = currentYear && group.specialites 
                                                            ? group.specialites.find(s => s.annee == currentYear) || group.specialites[0]
                                                            : group.specialites[0];
                                                        if (specToSelect) {
                                                            applyFilters({ annee: currentYear, specialite_id: specToSelect.id, option_id: null, semester: currentSemester, search: searchTerm });
                                                        }
                                                    }}
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium ${isSelected ? 'bg-blue-50 text-blue-600' : ''}`}
                                                >
                                                    {group.libelle}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">No specialities available</div>
                                    )}
                                </div>
                            </Dropdown>

                            {/* Option Dropdown */}
                            <Dropdown
                                label="Option"
                                value={getOptionLabel()}
                                isOpen={openDropdown === 'option'}
                                onToggle={() => setOpenDropdown(openDropdown === 'option' ? null : 'option')}
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: null, semester: currentSemester, search: searchTerm })}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                    >
                                        All Options
                                    </button>
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: opt.id, semester: currentSemester, search: searchTerm })}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium ${currentOptionId == opt.id ? 'bg-blue-50 text-blue-600' : ''}`}
                                            >
                                                {opt.libelle}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
                                    )}
                                </div>
                            </Dropdown>

                            {/* Semester Dropdown */}
                            <Dropdown
                                label="Semester"
                                value={getSemesterLabel()}
                                isOpen={openDropdown === 'semester'}
                                onToggle={() => setOpenDropdown(openDropdown === 'semester' ? null : 'semester')}
                            >
                                <div className="p-2">
                                    {semesters.length > 0 ? (
                                        semesters.map((sem) => (
                                            <button
                                                key={sem.value}
                                                onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: currentOptionId, semester: sem.value, search: searchTerm })}
                                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium ${(currentSemester == sem.value || String(currentSemester) == String(sem.value)) ? 'bg-blue-50 text-blue-600' : ''}`}
                                            >
                                                {sem.label}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500">No semesters available</div>
                                    )}
                                </div>
                            </Dropdown>
                        </div>
                        <div className="flex-1"></div>
                        <button 
                            onClick={resetFilters}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
                        >
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
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search student..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
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
                                {[...safePodium, ...safeOthers].filter(s => s && s.rank).sort((a, b) => (a.rank || 0) - (b.rank || 0)).map((student) => {
                                    if (!student) return null;
                                    const prenom = student.prenom || '';
                                    const nom = student.nom || '';
                                    const matricule = student.matricule || 'N/A';
                                    const s1 = student.s1 || 0;
                                    const s2 = student.s2 || 0;
                                    const moyenne_cycle = student.moyenne_cycle || student.moyenne_semestre || 0;
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
                                                    <button 
                                                        onClick={() => {
                                                            const params = new URLSearchParams();
                                                            if (currentSemester && currentSemester !== 'cycle') params.set('semester', currentSemester);
                                                            window.location.href = `/admin/students/${student.id}/transcript?${params.toString()}`;
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Transcript"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
