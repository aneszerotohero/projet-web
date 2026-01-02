import React from 'react';

import AppLayout from '../../Layouts/AppLayout';

export default function Dashboard({ student, semestre, moyenne_semestre, moyennes_par_module }) {
    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Tableau de bord - Élève</h1>
                <div className="bg-white p-4 rounded shadow mb-4">
                    <h2 className="text-xl">Moyenne semestre {semestre}</h2>
                    <div className="text-3xl font-semibold">{moyenne_semestre.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-semibold mb-2">Moyennes par module</h3>
                    <ul>
                        {Object.entries(moyennes_par_module || {}).map(([moduleId, moy]) => (
                            <li key={moduleId} className="py-1">Module {moduleId}: {moy.toFixed(2)}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
