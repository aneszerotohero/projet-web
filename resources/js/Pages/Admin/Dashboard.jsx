import React from 'react';

export default function AdminDashboard({ podium = [], others = [] }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Tableau de bord - Admin</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {podium.map((p, i) => (
                    <div key={p.id} className="bg-white p-4 rounded shadow">
                        <div className="text-sm">#{i+1}</div>
                        <div className="font-semibold">{p.nom} {p.prenom}</div>
                        <div className="text-lg">{p.moyenne_cycle?.toFixed(2)}</div>
                    </div>
                ))}
            </div>
            <div className="bg-white p-4 rounded shadow mb-4">
                <h3 className="mb-2">Autres élèves</h3>
                <ul>
                    {others.map(o => (
                        <li key={o.id}>{o.nom} {o.prenom} - {o.moyenne_cycle?.toFixed(2)}</li>
                    ))}
                </ul>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h3 className="mb-2">Administration</h3>
                <div className="space-x-2">
                    <a href="/admin/notes/manage" className="text-sky-600 mr-2">Gérer les notes</a>
                    <a href="/admin/absences/manage" className="text-sky-600">Gérer les absences</a>
                </div>
            </div>
        </div>
    );
}
