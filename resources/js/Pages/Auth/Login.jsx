import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function Login() {
    const [matricule, setMatricule] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const submit = (e) => {
        e.preventDefault();

        router.post('/login', {
            matricule,
            password,
        }, {
            onError: (err) => setErrors(err || {}),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
            <div className="w-full max-w-md">
                <form onSubmit={submit} className="bg-white p-8 rounded shadow-md">
                    <h1 className="text-2xl font-semibold mb-4">Connexion</h1>

                    <label className="block mb-2">Matricule</label>
                    <input
                        className="w-full p-2 border rounded mb-2"
                        value={matricule}
                        onChange={e => setMatricule(e.target.value)}
                    />
                    {errors.matricule && (
                        <div className="text-red-600">{errors.matricule}</div>
                    )}

                    <label className="block mt-2 mb-2">Mot de passe</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded mb-2"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    {errors.password && (
                        <div className="text-red-600">{errors.password}</div>
                    )}

                    <button className="mt-4 w-full bg-blue-400 text-white p-2 rounded">
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
