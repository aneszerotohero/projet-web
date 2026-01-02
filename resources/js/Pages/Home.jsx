import React from 'react';
import AppLayout from '../Layouts/AppLayout';
import { Link } from '@inertiajs/react';

export default function Home() {
    return (
        <AppLayout>
            <div className="p-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Bienvenue sur Projetschool</h1>
                <p className="mb-4">Consultez vos notes, absences et le classement.</p>
                <div className="space-x-2">
                    <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded">Se connecter</Link>
                </div>
            </div>
        </AppLayout>
    );
}
