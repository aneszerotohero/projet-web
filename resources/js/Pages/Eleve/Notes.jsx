import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import Table from '../../Components/Table';

export default function Notes({ modules, coefs, semestre, general_moy }) {
    const columns = [
        { key: 'module', title: 'Module' },
        ...coefs.map(c => ({ key: `coef_${c.id}`, title: c.libelle, render: (row) => (row.notes[c.id] === null ? '/' : row.notes[c.id]) })),
        { key: 'module_moy', title: 'Moyenne Module', render: (row) => (row.module_moy === null ? '/' : row.module_moy.toFixed(2)) }
    ];

    const data = modules.map(m => {
        const row = { module: m.module, module_moy: m.module_moy, notes: m.notes };
        return row;
    });

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Relevé de notes - Semestre {semestre}</h1>
                <div className="mb-4">
                    <strong>Moyenne générale : </strong>{general_moy === null ? '/' : general_moy.toFixed(2)}
                </div>
                <Table columns={columns} data={data} />
            </div>
        </AppLayout>
    );
}
