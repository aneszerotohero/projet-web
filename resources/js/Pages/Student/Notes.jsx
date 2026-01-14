import React from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '../../Layouts/StudentLayout';
import { useFlashMessage } from '../../hooks/useNotify';
import { BookOpen, BarChart3 } from 'lucide-react';

export default function StudentNotes({ notes = [] }) {
    useFlashMessage();

    // Organiser les notes par module
    const groupedNotes = notes.reduce((acc, note) => {
        const moduleName = note.module?.libelle || 'Autres';
        if (!acc[moduleName]) {
            acc[moduleName] = {
                semestre: note.module?.semestre,
                items: [],
                totalPoints: 0,
                totalCoef: 0
            };
        }
        acc[moduleName].items.push(note);
        acc[moduleName].totalPoints += (note.note * (note.coef?.coef || 1));
        acc[moduleName].totalCoef += (note.coef?.coef || 1);
        return acc;
    }, {});

    return (
        <>
            <Head title="Mes Notes - Gestion Scolaire" />

            {/* Utilisation de max-w-full et suppression des marges auto excessives */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* En-tête sur toute la largeur */}
                <div className="mb-8 flex justify-between items-end border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Relevé de Notes</h1>
                        <p className="text-gray-500 mt-1 italic">Consultez vos performances académiques en temps réel.</p>
                    </div>
                    <div className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <BarChart3 size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest">Semestre Actuel</span>
                    </div>
                </div>

                {Object.keys(groupedNotes).length === 0 ? (
                    <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 text-lg font-medium">Aucune note n'est disponible pour le moment.</p>
                    </div>
                ) : (
                    /* Utilisation d'une grille adaptative pour remplir l'espace */
                    <div className="grid grid-cols-1 gap-8">
                        {Object.entries(groupedNotes).map(([moduleName, data]) => {
                            const moyenneModule = (data.totalPoints / data.totalCoef).toFixed(2);

                            return (
                                <div key={moduleName} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:border-indigo-300">
                                    {/* Header du Module - Largeur Totale */}
                                    <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-inner">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-extrabold text-gray-900">{moduleName}</h2>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-black rounded uppercase">Semestre {data.semestre}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{data.items.length} Évaluations</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Moyenne Module</p>
                                                <p className={`text-2xl font-black leading-none ${moyenneModule >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {moyenneModule} <span className="text-xs text-gray-300">/ 20</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table des notes - Exploite toute la largeur du composant */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50/50 text-gray-400 text-[11px] uppercase font-black tracking-widest border-y border-gray-100">
                                                <tr>
                                                    <th className="px-10 py-4">Désignation de l'examen</th>
                                                    <th className="px-6 py-4 text-center">Poids (Coef)</th>
                                                    <th className="px-10 py-4 text-right">Résultat</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {data.items.map((note) => (
                                                    <tr key={note.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                        <td className="px-10 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full shadow-sm ${note.coef?.libelle === 'Exam' ? 'bg-indigo-500' : 'bg-sky-400'}`}></div>
                                                                <span className="font-bold text-gray-700 group-hover:text-indigo-700 transition-colors">{note.coef?.libelle || 'Évaluation'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-center text-gray-500 font-mono font-bold">
                                                            {note.coef?.coef || 1}
                                                        </td>
                                                        <td className="px-10 py-5 text-right">
                                                            <div className="inline-flex flex-col items-end">
                                                                <span className={`text-lg font-black ${
                                                                    note.note >= 10 ? 'text-emerald-600' : 'text-rose-500'
                                                                }`}>
                                                                    {Number(note.note).toFixed(2)}
                                                                </span>
                                                                <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${note.note >= 10 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                                                        style={{ width: `${(note.note / 20) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

StudentNotes.layout = (page) => <StudentLayout>{page}</StudentLayout>;
