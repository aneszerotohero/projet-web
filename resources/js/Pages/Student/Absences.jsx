import React from 'react';
import { Head } from '@inertiajs/react';
import { FileText, Clock, CheckCircle, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import StudentLayout from '../../Layouts/StudentLayout';
import { useFlashMessage } from '../../hooks/useNotify';

export default function StudentAbsences({ absences = [] }) {
    useFlashMessage();

    // Calcul des statistiques pour les nouvelles cartes
    const stats = {
        total: absences.length,
        justifiees: absences.filter(a => a.justifie).length,
        nonJustifiees: absences.filter(a => !a.justifie).length
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const StatusBadge = ({ justifie }) => {
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                justifie
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-rose-100 text-rose-700 border border-rose-200"
            }`}>
                {justifie ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                {justifie ? 'Justifié' : 'Non justifié'}
            </span>
        );
    };

    return (
        <>
            <Head title="Mes absences" />

            <div className="w-full px-4 sm:px-6 lg:px-10 py-8">

                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Suivi des Absences</h1>
                        <p className="text-gray-500 mt-2 text-lg">Historique complet de vos présences par module.</p>
                    </div>
                </div>

                {/* --- SECTION DES CARTES (KPIs) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    {/* Carte Total */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Clock size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Absences</p>
                            <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                        </div>
                    </div>

                    {/* Carte Justifiées */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Justifiées</p>
                            <p className="text-3xl font-black text-emerald-600">{stats.justifiees}</p>
                        </div>
                    </div>

                    {/* Carte Non-Justifiées */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md">
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Non Justifiées</p>
                            <p className="text-3xl font-black text-rose-600">{stats.nonJustifiees}</p>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden transition-all">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-black tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-10 py-5">Date</th>
                                    <th className="px-10 py-5">Module</th>
                                    <th className="px-10 py-5">Motif</th>
                                    <th className="px-10 py-5 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {absences.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                                    <FileText size={40} />
                                                </div>
                                                <p className="text-gray-400 font-bold text-lg">Aucune absence enregistrée.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    absences.map(absence => (
                                        <tr key={absence.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-10 py-6 font-black text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                    {formatDate(absence.date_absence)}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                                                    {absence.module?.libelle || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="text-gray-600 italic text-sm">
                                                    "{absence.motif_absence || 'Aucun motif'}"
                                                </p>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <StatusBadge justifie={absence.justifie} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-gray-400 text-sm px-2">
                    <AlertCircle size={14} />
                    <p>En cas d'erreur ou pour soumettre un justificatif, veuillez contacter l'administration.</p>
                </div>
            </div>
        </>
    );
}

StudentAbsences.layout = (page) => <StudentLayout>{page}</StudentLayout>;
