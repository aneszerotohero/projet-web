import React, { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Download, Users, Search, Filter, ChevronDown, Trophy, Eye, Pencil, X
} from 'lucide-react';

export default function AdminDashboard({
    podium = [],
    others = [],
    ranking_stats = {},
    filters = {},
    available_filters = {}
}) {
    // --- IMAGES DU PODIUM (VOS LIENS SPÉCIFIQUES) ---
    const getPodiumImage = (rank) => {
        const images = {
            1: "https://media.istockphoto.com/id/1628502600/photo/smiling-people-close-up-portrait.webp?s=2048x2048&w=is&k=20&c=iuKfDmuNd2hZ0tNIKJPMK9L6XmBE3K9bWaSL7ABjlEc=",
            2: "https://media.istockphoto.com/id/2226992701/photo/isolated-smiling-cartoon-man-with-glasses-and-brown-sweater.webp?s=2048x2048&w=is&k=20&c=C6Y0j8uI7SdmwPgvJLIQRdXrQbCb6SMBIuHzL4C7BhY=",
            3: "https://media.istockphoto.com/id/2148889275/photo/close-up-portrait-of-3d-young-bearded-businessman-in-blue-suit-with-confident-smile.webp?s=2048x2048&w=is&k=20&c=zC3mlknueqCYkMs6sLEuBxWtCtis9IqtXXmr1yZ5xsA="
        };
        return images[rank];
    };

    // --- SÉCURISATION DES DONNÉES ---
    const safePodium = Array.isArray(podium) ? podium : [];
    const safeOthers = Array.isArray(others) ? others : [];
    const safeFilters = filters || {};
    const safeAvailableFilters = available_filters || {};

    const specialitesByLibelle = safeAvailableFilters.specialites_by_libelle || {};
    const options = safeAvailableFilters.options || [];
    const years = safeAvailableFilters.years || [1, 2, 3];
    const semesters = safeAvailableFilters.semesters || [];

    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState(safeFilters.search || '');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const currentYear = safeFilters.year || null;
    const currentSpecialiteId = safeFilters.specialite_id || null;
    const currentOptionId = safeFilters.option_id || null;
    const currentSemester = safeFilters.semester || 'cycle';

    const filteredOptions = currentSpecialiteId
        ? options.filter(opt => opt.specialite_id == currentSpecialiteId)
        : options;

    // --- LOGIQUE DES FILTRES ---
    const applyFilters = useCallback((newFilters) => {
        const params = {};
        if (newFilters.annee !== undefined && newFilters.annee !== null) params.annee = newFilters.annee;
        if (newFilters.specialite_id !== undefined) params.specialite_id = newFilters.specialite_id || '';
        if (newFilters.option_id !== undefined) params.option_id = newFilters.option_id || '';
        if (newFilters.semester !== undefined) params.semester = newFilters.semester;
        if (newFilters.search !== undefined) params.search = newFilters.search;

        router.get('/admin/dashboard', params, {
            preserveState: true,
            preserveScroll: true,
            only: ['podium', 'others', 'ranking_stats', 'filters', 'available_filters']
        });
        setOpenDropdown(null);
    }, [searchTerm, currentYear, currentSpecialiteId, currentOptionId, currentSemester]);

    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
            applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: currentOptionId, semester: currentSemester, search: value });
        }, 500);
        setSearchTimeout(timeout);
    }, [currentYear, currentSpecialiteId, currentOptionId, currentSemester, searchTimeout, applyFilters]);

    const resetFilters = () => {
        setSearchTerm('');
        router.get('/admin/dashboard', {}, { preserveState: true });
        setOpenDropdown(null);
    };

    // --- COMPOSANTS INTERNES ---
    const PodiumStep = ({ student, rank, color }) => {
        if (!student) return null;
        const moyenne = student.moyenne_cycle || student.moyenne_semestre || 0;

        return (
            <div className={`flex flex-col items-center flex-1 ${rank === 1 ? '-mt-12 scale-110 z-10' : 'mt-0'}`}>
                <div className="relative mb-6 group cursor-pointer" onClick={() => window.location.href = `/admin/students/${student.id}/transcript`}>
                    <div className={`w-32 h-32 rounded-full border-4 ${rank === 1 ? 'border-yellow-400 shadow-2xl' : rank === 2 ? 'border-gray-300 shadow-lg' : 'border-orange-300 shadow-lg'} overflow-hidden bg-white`}>
                        <img
                            src={getPodiumImage(rank)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            alt=""
                        />
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-xs shadow-md border-2 border-white ${color}`}>
                        {rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
                    </div>
                </div>
                <div className="text-center mb-4">
                    <h3 className="font-black text-gray-900 text-lg uppercase italic tracking-tighter leading-tight">{student.prenom} {student.nom}</h3>
                    <div className="flex items-center justify-center gap-1 mt-1 text-blue-600 font-black text-xl">
                        {Number(moyenne).toFixed(2)} <span className="text-xs text-gray-400 font-medium">/ 20</span>
                    </div>
                </div>
                <div className={`w-full rounded-t-3xl shadow-inner flex justify-center items-start pt-4 font-black text-7xl text-white/20 select-none ${rank === 1 ? 'h-64 bg-yellow-100/50' : rank === 2 ? 'h-48 bg-gray-100' : 'h-36 bg-orange-50'}`}>
                    {rank}
                </div>
            </div>
        );
    };

    const Dropdown = ({ label, value, isOpen, onToggle, children }) => (
        <div className="relative">
            <button onClick={onToggle} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <span className="truncate max-w-[150px]">{label}: {value}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenDropdown(null)}></div>
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-[101]">
                        {children}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <AdminLayout>
            <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 py-8 bg-gray-50/50 min-h-screen font-sans">

                {/* Header Full Width */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Major de Promotion</h1>
                        <p className="text-gray-500 mt-1 text-lg italic">Excellence académique et classement des leaders.</p>
                    </div>
                    <button onClick={() => window.location.href = '/admin/dashboard/export'} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 uppercase text-xs tracking-widest">
                        <Download className="w-5 h-5" /> Exporter le Rapport
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-wrap items-center gap-4">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Filtres:</span>

                    <Dropdown label="Année" value={currentYear ? `Année ${currentYear}` : 'Tous'} isOpen={openDropdown === 'year'} onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}>
                        <div className="p-2 space-y-1">
                            <button onClick={() => applyFilters({ annee: null, specialite_id: currentSpecialiteId, option_id: currentOptionId, semester: currentSemester, search: searchTerm })} className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold">Toutes les années</button>
                            {years.map(year => <button key={year} onClick={() => applyFilters({ annee: year, specialite_id: currentSpecialiteId, option_id: currentOptionId, semester: currentSemester, search: searchTerm })} className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold ${currentYear == year ? 'bg-indigo-50 text-indigo-600' : ''}`}>Année {year}</button>)}
                        </div>
                    </Dropdown>

                    <Dropdown label="Spécialité" value={currentSpecialiteId ? 'Filtré' : 'Tous'} isOpen={openDropdown === 'speciality'} onToggle={() => setOpenDropdown(openDropdown === 'speciality' ? null : 'speciality')}>
                        <div className="p-2 space-y-1">
                            <button onClick={() => applyFilters({ annee: currentYear, specialite_id: null, option_id: null, semester: currentSemester, search: searchTerm })} className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold">Toutes les spécialités</button>
                            {Object.values(specialitesByLibelle).map((group) => {
                                if (!group || !group.libelle) return null;
                                const specToSelect = currentYear && group.specialites ? group.specialites.find(s => s.annee == currentYear) || group.specialites[0] : group.specialites[0];
                                return <button key={group.libelle} onClick={() => specToSelect && applyFilters({ annee: currentYear, specialite_id: specToSelect.id, option_id: null, semester: currentSemester, search: searchTerm })} className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold ${specToSelect && currentSpecialiteId == specToSelect.id ? 'bg-indigo-50 text-indigo-600' : ''}`}>{group.libelle}</button>;
                            })}
                        </div>
                    </Dropdown>

                    <Dropdown label="Option" value={currentOptionId ? 'Filtré' : 'Tous'} isOpen={openDropdown === 'option'} onToggle={() => setOpenDropdown(openDropdown === 'option' ? null : 'option')}>
                        <div className="p-2 space-y-1">
                            <button onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: null, semester: currentSemester, search: searchTerm })} className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold">Toutes les options</button>
                            {filteredOptions.map(opt => <button key={opt.id} onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: opt.id, semester: currentSemester, search: searchTerm })} className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold ${currentOptionId == opt.id ? 'bg-indigo-50 text-indigo-600' : ''}`}>{opt.libelle}</button>)}
                        </div>
                    </Dropdown>

                    <Dropdown label="Semestre" value={currentSemester === 'cycle' ? 'Cycle' : `S${currentSemester}`} isOpen={openDropdown === 'semester'} onToggle={() => setOpenDropdown(openDropdown === 'semester' ? null : 'semester')}>
                        <div className="p-2 space-y-1">
                            {semesters.map((sem) => <button key={sem.value} onClick={() => applyFilters({ annee: currentYear, specialite_id: currentSpecialiteId, option_id: currentOptionId, semester: sem.value, search: searchTerm })} className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold ${currentSemester == sem.value ? 'bg-indigo-50 text-indigo-600' : ''}`}>{sem.label}</button>)}
                        </div>
                    </Dropdown>

                    <div className="flex-1"></div>
                    <button onClick={resetFilters} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">Reset</button>
                </div>

                {/* Podium Section */}
                <div className="flex justify-center items-end gap-4 md:gap-16 mb-20 px-4 py-8 relative">
                    <Trophy className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-10 h-10 text-yellow-500 animate-bounce" />
                    {safePodium[1] && <PodiumStep student={safePodium[1]} rank={2} color="bg-gray-400" />}
                    {safePodium[0] && <PodiumStep student={safePodium[0]} rank={1} color="bg-yellow-400" />}
                    {safePodium[2] && <PodiumStep student={safePodium[2]} rank={3} color="bg-orange-400" />}
                </div>

                {/* Ranking List Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="font-black text-gray-900 text-2xl uppercase italic tracking-tighter">Classement Général</h2>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Rechercher un élève..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-black tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-10 py-6">Rang</th>
                                    <th className="px-10 py-6">Étudiant</th>
                                    <th className="px-10 py-6">Matricule</th>
                                    <th className="px-10 py-6 text-center">Moyenne</th>
                                    <th className="px-10 py-6 text-right">Dossier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...safePodium, ...safeOthers].filter(s => s && s.rank).sort((a,b) => a.rank - b.rank).map((student) => (
                                    <tr key={student.id} className="group hover:bg-indigo-50/30 transition-all">
                                        <td className="px-10 py-6 font-black text-gray-300 text-xl group-hover:text-indigo-600 transition-colors">#{student.rank}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                {/* SUPPRESSION DE L'IMAGE DANS LE TABLEAU (REMPLACÉE PAR INITIALES) */}
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-400 text-xs border border-indigo-100">
                                                    {(student.prenom?.[0] || '') + (student.nom?.[0] || '')}
                                                </div>
                                                <span className="font-black text-gray-900 uppercase tracking-tight">{student.prenom} {student.nom}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-sm font-bold text-gray-500 font-mono italic">{student.matricule}</td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="inline-block px-4 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg shadow-sm">
                                                {Number(student.moyenne_cycle || student.moyenne_semestre || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button onClick={() => window.location.href = `/admin/students/${student.id}/transcript`} className="p-3 text-gray-400 hover:text-indigo-600 transition-all">
                                                <Eye className="w-6 h-6" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
