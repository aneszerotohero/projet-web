import React, {useState} from 'react'
import { Inertia } from '@inertiajs/inertia'

export default function AdminAbsences({res}){
    const [loading, setLoading] = useState(false)

    function fetchPage(p){
        setLoading(true)
        Inertia.get(`/admin/absences?page=${p}`, {}, {preserveState: true, onFinish: ()=>setLoading(false)})
    }

    function destroy(id){
        if(!confirm('Supprimer cette absence ?')) return
        Inertia.delete(`/admin/absences/${id}`, {
            onFinish: ()=> Inertia.get('/admin/absences', {}, {preserveState: true})
        })
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl">Gestion des absences</h2>
            </div>

            <div className="bg-white rounded shadow p-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th>Élève</th>
                            <th>Date</th>
                            <th>Motif</th>
                            <th>Supprimé par</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {res.data.map(a => (
                            <tr key={a.id} className="border-t">
                                <td>{a.student.nom} {a.student.prenom}</td>
                                <td>{a.date}</td>
                                <td>{a.motif}</td>
                                <td>{a.motif_suppression || ''}</td>
                                <td className="text-right">
                                    <button onClick={()=>destroy(a.id)} className="text-red-600">Delete</button>
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
                        {res.prev_page_url && <button onClick={()=>fetchPage(res.current_page-1)} className="px-3 py-1 rounded bg-gray-200">Préc</button>}
                        {res.next_page_url && <button onClick={()=>fetchPage(res.current_page+1)} className="px-3 py-1 rounded bg-gray-200">Suiv</button>}
                    </div>
                </div>
            </div>
        </div>
    )
}
