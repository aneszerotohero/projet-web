import React, {useState, useEffect} from 'react'
import { Inertia } from '@inertiajs/inertia'
import NoteForm from './NoteForm'

export default function AdminNotes({meta,res}){
    const [notes, setNotes] = useState(res.data || [])
    const [metaData, setMetaData] = useState(meta)
    // keep initial meta in sync when route props change
    useEffect(()=>{ setMetaData(meta) }, [meta])
    const [page, setPage] = useState(res.current_page || 1)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        setNotes(res.data || [])
    }, [res])

    function fetchPage(p){
        setLoading(true)
        Inertia.get(`/admin/notes?page=${p}`, {}, {preserveState: true, onFinish: ()=>setLoading(false)})
    }

    function openCreate(){
        setEditing(null)
        setModalOpen(true)
    }

    function openEdit(note){
        setEditing(note)
        setModalOpen(true)
    }

    function save(payload){
        setLoading(true)
        const url = editing ? `/admin/notes/${editing.id}` : '/admin/notes/single'
        const method = editing ? 'put' : 'post'
        Inertia[method](url, payload, {
            onFinish: ()=>{
                setModalOpen(false)
                setEditing(null)
                Inertia.get('/admin/notes', {}, {preserveState: true})
            },
            onError: (errs)=>{
                // map and highlight errors - in future show server errors in form
                setLoading(false)
                console.log('validation err', errs)
                // TODO: show errors in form
            }
        })
    }

    function destroy(id){
        if(!confirm('Supprimer cette note ?')) return
        Inertia.delete(`/admin/notes/${id}`, {
            onFinish: ()=> Inertia.get('/admin/notes', {}, {preserveState: true})
        })
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl">Gestion des notes</h2>
                <div>
                    <button onClick={openCreate} className="px-3 py-1 rounded bg-sky-600 text-white">Ajouter</button>
                </div>
            </div>

            <div className="bg-white rounded shadow p-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th>Élève</th>
                            <th>Module</th>
                            <th>Coef</th>
                            <th>Note</th>
                            <th>Classe</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.map(n => (
                            <tr key={n.id} className="border-t">
                                <td>{n.student.nom} {n.student.prenom}</td>
                                <td>{n.module.libelle}</td>
                                <td>{n.coef.coef}</td>
                                <td>{n.note}</td>
                                <td>{n.classe}</td>
                                <td className="text-right">
                                    <button onClick={()=>openEdit(n)} className="text-sky-600 mr-2">Modifier</button>
                                    <button onClick={()=>destroy(n.id)} className="text-red-600">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 flex justify-between items-center">
                    <div>
                        Page {res.current_page} / {res.last_page}
                    </div>
                    <div className="space-x-2">
                        {res.prev_page_url && <button onClick={()=>fetchPage(res.current_page-1)} className="px-3 py-1 rounded bg-gray-200">Précédent</button>}
                        {res.next_page_url && <button onClick={()=>fetchPage(res.current_page+1)} className="px-3 py-1 rounded bg-gray-200">Suivant</button>}
                    </div>
                </div>
            </div>

            {modalOpen && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white p-6 rounded w-[720px] max-w-full">
                    <h3 className="mb-3">{editing ? 'Modifier la note' : 'Ajouter une note'}</h3>
                    <NoteForm initial={editing || {}} meta={metaData} onSave={save} onCancel={()=>setModalOpen(false)} />
                </div>
            </div>}
        </div>
    )
}
