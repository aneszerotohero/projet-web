import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, FileBarChart, Bell, BarChart3, LogOut, Menu, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Récupération des données partagées (auth et flash)
    const user = props.auth?.user || { nom: 'Administrateur', prenom: 'Principal' };
    const flash = props.flash || {};

    const isActive = (path) => url.startsWith(path);

    const NavItem = ({ href, icon: Icon, label }) => (
        <Link
            href={href}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${isActive(href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <Icon className={`w-5 h-5 mr-3 ${isActive(href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
            {label}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                A
                            </div>
                            AdminPanel
                        </div>
                    </div>

                    {/* Nav Links - REMISE DES ROUTES D'ORIGINE */}
                    <div className="flex-1 overflow-y-auto py-5">
                        <div className="px-4 space-y-1">
                            <div className="pt-4 pb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Gestion Scolaire
                            </div>
                            <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
                            <NavItem href="/admin/notes/manage" icon={FileBarChart} label="Gestion des Notes" />
                            <NavItem href="/admin/absences/manage" icon={Bell} label="Gestion des Absences" />
                            <NavItem href="/admin/statistiques" icon={BarChart3} label="Statistiques" />
                        </div>
                    </div>

                    {/* User Info Bottom */}
                    <div className="border-t border-gray-200 p-4 shrink-0 bg-white">
                        <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                {user.prenom?.[0] || 'A'}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">
                                    {user.prenom || 'Admin'} {user.nom || ''}
                                </p>
                                <Link href="/logout" method="post" as="button" className="text-xs text-red-600 hover:text-red-800 flex items-center mt-1 outline-none">
                                    <LogOut className="w-3 h-3 mr-1" /> Déconnexion
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-200">
                {/* Mobile Header */}
                <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-gray-900">AdminPanel</span>
                    <div className="w-6"></div>
                </div>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

                    {/* --- AFFICHAGE DES MESSAGES FLASH --- */}
                    <div className="w-full mb-6">
                        {flash?.success && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-sm mb-4">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span className="font-bold text-sm">{flash.success}</span>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl shadow-sm mb-4">
                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                <span className="font-bold text-sm">{flash.error}</span>
                            </div>
                        )}
                    </div>

                    {children}
                </main>
            </div>
        </div>
    );
}
