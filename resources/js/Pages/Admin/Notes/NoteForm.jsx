import React, {useState, useEffect} from 'react'

export default function NoteForm({initial = {}, meta, onSave, onCancel}){
    const [studentId, setStudentId] = useState(initial.student_id || '')
    const [moduleId, setModuleId] = useState(initial.module_id || '')
    const [coefId, setCoefId] = useState(initial.coef_id || '')
    const [note, setNote] = useState(initial.note || '')
    const [errors, setErrors] = useState({})

    useEffect(()=>{
        setStudentId(initial.student_id || '')
        setModuleId(initial.module_id || '')
        setCoefId(initial.coef_id || '')
        setNote(initial.note || '')
    }, [initial])

    function validate(){
        const e = {}
        if(!classe) e.classe = "La classe est requise"
        if(!studentId) e.student_id = "L'élève est requis"
        if(!moduleId) e.module_id = "Le module est requis"
        if(!coefId) e.coef_id = "Le coefficient est requis"
        if(note === '' || note === null) e.note = "La note est requise"
        else if(isNaN(parseFloat(note)) || parseFloat(note) < 0 || parseFloat(note) > 20) e.note = "La note doit être un nombre entre 0 et 20"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    function submit(e){
        e.preventDefault()
        if(!validate()) return
        onSave({classe, student_id: studentId, module_id: moduleId, coef_id: coefId, note})
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <label className="block text-sm font-medium">Classe</label>
                <select value={classe} onChange={e=>setClasse(e.target.value)} className="mt-1 block w-full rounded border-gray-300">
                    <option value="">-- Choisir --</option>
                    {meta.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.classe && <div className="text-red-500 text-sm mt-1">{errors.classe}</div>}
            </div>
            <div>
                <label className="block text-sm font-medium">Élève</label>
                <select value={studentId} onChange={e=>setStudentId(e.target.value)} className="mt-1 block w-full rounded border-gray-300">
                    <option value="">-- Choisir --</option>
                    {meta.students.map(s => <option key={s.id} value={s.id}>{s.nom} {s.prenom} ({s.matricule})</option>)}
                </select>
                {errors.student_id && <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>}
            </div>
            <div>
                <label className="block text-sm font-medium">Module</label>
                <select value={moduleId} onChange={e=>setModuleId(e.target.value)} className="mt-1 block w-full rounded border-gray-300">
                    <option value="">-- Choisir --</option>
                    {meta.modules.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                </select>
                {errors.module_id && <div className="text-red-500 text-sm mt-1">{errors.module_id}</div>}
            </div>
            <div>
                <label className="block text-sm font-medium">Coefficient</label>
                <select value={coefId} onChange={e=>setCoefId(e.target.value)} className="mt-1 block w-full rounded border-gray-300">
                    <option value="">-- Choisir --</option>
                    {meta.coefs.map(c => <option key={c.id} value={c.id}>{c.libelle} ({c.coef})</option>)}
                </select>
                {errors.coef_id && <div className="text-red-500 text-sm mt-1">{errors.coef_id}</div>}
            </div>
            <div>
                <label className="block text-sm font-medium">Note</label>
                <input value={note} onChange={e=>setNote(e.target.value)} className="mt-1 block w-full rounded border-gray-300" />
                {errors.note && <div className="text-red-500 text-sm mt-1">{errors.note}</div>}
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-200">Annuler</button>
                <button type="submit" className="px-3 py-1 rounded bg-sky-600 text-white">Enregistrer</button>
            </div>
        </form>
    )
}
