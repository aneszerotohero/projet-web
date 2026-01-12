import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Home, FileText, Calendar, LogOut, GraduationCap, User } from 'lucide-react';

export default function StudentLayout({ children }) {
    const { url } = usePage();
    // Safely access user from nested props structure commonly found in Inertia
    const { props } = usePage();
    const user = props.auth?.user || { nom: 'Étudiant', prenom: 'Test' }; // Fallback for dev

    const isActive = (path) => url.startsWith(path);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo & Desktop Nav */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <GraduationCap className="h-8 w-8 text-blue-600" />
                                <span className="font-bold text-xl text-gray-900 hidden md:block">Projetschool</span>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                <Link
                                    href="/student/dashboard"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/student/dashboard')
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Tableau de bord
                                </Link>
                                <Link
                                    href="/student/notes"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/student/notes')
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Relevé de notes
                                </Link>
                                <Link
                                    href="/student/absences"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/student/absences')
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Absences
                                </Link>
                            </div>
                        </div>

                        {/* User User Menu */}
                        <div className="flex items-center">
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</div>
                                    <div className="text-xs text-gray-500">Étudiant</div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User className="w-6 h-6" />
                                </div>
                                {/* Simple logout button for now */}
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Se déconnecter"
                                >
                                    <LogOut className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="py-8">
                {children}
            </main>
        </div>
    );
}
