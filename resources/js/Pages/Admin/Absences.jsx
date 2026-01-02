import React, { useEffect, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import axios from 'axios';
import Modal from '../../Components/Modal';
import Table from '../../Components/Table';

export default function AbsencesAdmin() {
    const [page, setPage] = useState(1);
    const [perPage] = useState(15);
    const [data, setData] = useState(null);
    const [meta, setMeta] = useState({ students: [], modules: [] });
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ id: null, student_id: '', module_id: '', date_absence: '', motif_absence: '' });

    useEffect(() => { fetchMeta(); fetchData(); }, [page]);

    function fetchMeta() {
        // reuse meta from notes
        axios.get('/admin/notes/meta').then(r => setMeta({ students: r.data.students, modules: r.data.modules }));
    }

    function fetchData() {
        axios.get('/admin/absences', { params: { page, per_page: perPage } }).then(r => setData(r.data));
    }

    function openCreate() { setForm({ id: null, student_id: '', module_id: '', date_absence: '', motif_absence: '' }); setModalOpen(true); }
    function openEdit(row) { setForm({ id: row.id, student_id: row.student_id, module_id: row.module_id, date_absence: row.date_absence, motif_absence: row.motif_absence }); setModalOpen(true); }

    function save() {
        const payload = { ...form };
        if (form.id) {
            axios.patch('/admin/absences/' + form.id, payload).then(() => { setModalOpen(false); fetchData(); });
        } else {
            axios.post('/admin/absences', payload).then(() => { setModalOpen(false); fetchData(); });
        }
    }

    function remove(id) { axios.delete('/admin/absences/' + id, { data: { motif_suppression: 'Supprimée admins' } }).then(() => fetchData()); }

    const columns = [
        { key: 'student', title: 'Élève', render: r => `${r.student.nom} ${r.student.prenom} (${r.student_id})` },
        { key: 'module', title: 'Module', render: r => r.module.libelle },
        { key: 'date', title: 'Date', render: r => r.date_absence },
        { key: 'motif', title: 'Motif', render: r => r.motif_absence },
        { key: 'deleted', title: 'Supprimée', render: r => r.deleted_at ? `Oui (${r.motif_suppression})` : 'Non' },
        { key: 'actions', title: 'Actions', render: r => (<div><button className="mr-2" onClick={() => openEdit(r)}>Éditer</button><button className="text-red-600" onClick={() => remove(r.id)}>Suppr</button></div>) }
    ];

    return (
        <AppLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Gestion des absences</h1>
                    <button onClick={openCreate} className="bg-green-500 text-white px-3 py-1 rounded">Ajouter</button>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    {!data ? <div>Chargement...</div> : (
                        <>
                        <Table columns={columns} data={data.data || []} />
                        <div className="mt-4 flex justify-between items-center">
                            <div>Pages: {data.current_page} / {data.last_page}</div>
                            <div>
                                <button disabled={!data.prev_page_url} onClick={() => setPage(page - 1)} className="mr-2">Préc</button>
                                <button disabled={!data.next_page_url} onClick={() => setPage(page + 1)}>Suiv</button>
                            </div>
                        </div>
                        </>
                    )}
                </div>

                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Éditer absence' : 'Ajouter absence'}>
                    <div className="space-y-2">
                        <div>
                            <label>Élève</label>
                            <select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} className="w-full p-2 border rounded">
                                <option value="">-- choisir --</option>
                                {meta.students.map(s => <option key={s.id} value={s.id}>{s.nom} {s.prenom} ({s.id})</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Module</label>
                            <select value={form.module_id} onChange={e => setForm({...form, module_id: e.target.value})} className="w-full p-2 border rounded">
                                <option value="">-- choisir --</option>
                                {meta.modules.map(m => <option key={m.id} value={m.id}>{m.libelle} (S{m.semestre})</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Date</label>
                            <input type="date" value={form.date_absence} onChange={e => setForm({...form, date_absence: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label>Motif</label>
                            <input type="text" value={form.motif_absence} onChange={e => setForm({...form, motif_absence: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button className="mr-2" onClick={() => setModalOpen(false)}>Annuler</button>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save}>Enregistrer</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </AppLayout>
    );
}
