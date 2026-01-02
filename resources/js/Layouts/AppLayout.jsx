import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { logout } from '../utils/auth';

export default function AppLayout({ children }) {
  const { props } = usePage();
  const user = props.auth?.user ?? null;

  return (
    <div className="min-h-screen bg-sky-50">
      <header className="bg-white shadow">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl text-sky-600">
            Projetschool
          </Link>

          <nav>
            {user ? (
              <button
                onClick={logout}
                className="ml-4 text-red-600"
              >
                Se déconnecter
              </button>
            ) : (
              <Link href="/login" className="ml-4 text-sky-600">
                Se connecter
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
