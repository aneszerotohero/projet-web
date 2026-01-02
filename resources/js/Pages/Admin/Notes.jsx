import React, { useEffect, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import axios from 'axios';
import Modal from '../../Components/Modal';
import Table from '../../Components/Table';

export default function NotesAdmin() {
    const [notesPage, setNotesPage] = useState(null);
    const [meta, setMeta] = useState({ students: [], modules: [], coefs: [] });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage] = useState(15);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ id: null, student_id: '', module_id: '', coef_id: '', note: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchMeta();
        fetchNotes();
    }, [page]);

    function fetchMeta() {
        axios.get('/admin/notes/meta').then(r => setMeta(r.data));
    }

    function fetchNotes() {
        setLoading(true);
        axios.get('/admin/notes', { params: { page, per_page: perPage } }).then(r => {
            setNotesPage(r.data);
            setLoading(false);
        });
    }

    function openCreate() {
        setForm({ id: null, student_id: '', module_id: '', coef_id: '', note: '' });
        setErrors({});
        setModalOpen(true);
    }

    function openEdit(row) {
        setForm({ id: row.id, student_id: row.student_id, module_id: row.module_id, coef_id: row.coef_id, note: row.note });
        setErrors({});
        setModalOpen(true);
    }

    function save() {
        // client validation
        const e = {};
        if (!form.student_id) e.student_id = 'Requis';
        if (!form.module_id) e.module_id = 'Requis';
        if (!form.coef_id) e.coef_id = 'Requis';
        if (form.note === '' || form.note === null) e.note = 'Requis';
        setErrors(e);
        if (Object.keys(e).length) return;

        axios.post('/admin/notes/single', form).then(() => {
            setModalOpen(false); fetchNotes();
        }).catch(err => {
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            }
        });
    }

    function remove(id) {
        axios.delete('/admin/notes/' + id).then(() => fetchNotes());
    }

    const columns = [
        { key: 'student', title: 'Élève', render: r => `${r.student.nom} ${r.student.prenom} (${r.student_id})` },
        { key: 'module', title: 'Module', render: r => r.module.libelle },
        { key: 'coef', title: 'Type', render: r => r.coef.libelle },
        { key: 'note', title: 'Note' },
        { key: 'actions', title: 'Actions', render: r => (
            <div>
                <button onClick={() => openEdit(r)} className="mr-2 text-blue-600">Éditer</button>
                <button onClick={() => remove(r.id)} className="text-red-600">Supprimer</button>
            </div>
        ) }
    ];

    return (
        <AppLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Gestion des notes</h1>
                    <button onClick={openCreate} className="bg-green-500 text-white px-3 py-1 rounded">Ajouter</button>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    {loading ? <div>Chargement...</div> : (
                        <>
                            <Table columns={columns} data={notesPage.data || []} />
                            <div className="mt-4 flex justify-between items-center">
                                <div>Pages: {notesPage.current_page} / {notesPage.last_page}</div>
                                <div>
                                    <button disabled={!notesPage.prev_page_url} onClick={() => setPage(page - 1)} className="mr-2">Préc</button>
                                    <button disabled={!notesPage.next_page_url} onClick={() => setPage(page + 1)}>Suiv</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Éditer note' : 'Ajouter note'}>
                    <div className="space-y-2">
                        <div>
                            <label>Élève</label>
                            <select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} className="w-full p-2 border rounded">
                                <option value="">-- choisir --</option>
                                {meta.students.map(s => <option key={s.id} value={s.id}>{s.nom} {s.prenom} ({s.id})</option>)}
                            </select>
                            {errors.student_id && <div className="text-red-600">{errors.student_id}</div>}
                        </div>
                        <div>
                            <label>Module</label>
                            <select value={form.module_id} onChange={e => setForm({...form, module_id: e.target.value})} className="w-full p-2 border rounded">
                                <option value="">-- choisir --</option>
                                {meta.modules.map(m => <option key={m.id} value={m.id}>{m.libelle} (S{m.semestre})</option>)}
                            </select>
                            {errors.module_id && <div className="text-red-600">{errors.module_id}</div>}
                        </div>
                        <div>
                            <label>Type</label>
                            <select value={form.coef_id} onChange={e => setForm({...form, coef_id: e.target.value})} className="w-full p-2 border rounded">
                                <option value="">-- choisir --</option>
                                {meta.coefs.map(c => <option key={c.id} value={c.id}>{c.libelle} (x{c.coef})</option>)}
                            </select>
                            {errors.coef_id && <div className="text-red-600">{errors.coef_id}</div>}
                        </div>
                        <div>
                            <label>Note</label>
                            <input type="number" value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full p-2 border rounded" />
                            {errors.note && <div className="text-red-600">{errors.note}</div>}
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
