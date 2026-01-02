import React from 'react';

import AppLayout from '../../Layouts/AppLayout';

export default function Absences({ absences }) {
    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Mes absences</h1>
                <div className="bg-white rounded shadow p-4">
                    <table className="w-full table-auto">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Module</th>
                                <th>Motif</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {absences.map(a => (
                                <tr key={a.id} className={a.deleted_at ? 'opacity-70' : ''}>
                                    <td>{a.date_absence}</td>
                                    <td>{a.module?.libelle ?? '—'}</td>
                                    <td>{a.motif_absence}</td>
                                    <td>{a.deleted_at ? (<span className="text-red-600">Supprimée: {a.motif_suppression}</span>) : <span className="text-green-600">Valide</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
