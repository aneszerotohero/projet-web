import React from 'react';
import { Link } from '@inertiajs/react';
import {
    BookOpen, UserCheck, BarChart2, GraduationCap,
    Mail, Phone, MapPin, Send, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden scroll-smooth">

            {/* Navigation Fixe Moderne */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-gray-100/50"
            >
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                            Projetschool
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-gray-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">Accueil</a>
                        <a href="#about" className="hover:text-blue-600 transition-colors">À propos</a>
                        <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
                        <Link
                            href="/login"
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 active:scale-95"
                        >
                            Espace personnel
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section (Ajustée pour le padding du nav fixe) */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                            className="flex-1 text-center md:text-left z-10"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                ÉDUCATION NATIONALE ALGÉRIENNE
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8 tracking-tight text-slate-900">
                                Le futur de votre <br />
                                <span className="text-blue-600">réussite scolaire.</span>
                            </h1>
                            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-xl">
                                Une interface intuitive pour piloter votre scolarité. Notes, absences et classements réunis dans une application unique.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1">
                                    Commencer maintenant
                                </Link>
                                <a href="#about" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                    En savoir plus
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                            className="flex-1 relative"
                        >
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                                alt="Dashboard"
                                className="rounded-3xl shadow-2xl border-8 border-white object-cover aspect-video md:aspect-square lg:aspect-video"
                            />
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* About Section - Design Moderne "Split" */}
            <section id="about" className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                            className="lg:w-1/2"
                        >
                            <h2 className="text-blue-600 font-bold tracking-widest text-sm uppercase mb-4">À propos de nous</h2>
                            <h3 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                La technologie au service de <br/> l'excellence académique.
                            </h3>
                            <p className="text-lg text-slate-600 mb-8">
                                Projetschool n'est pas qu'un simple portail de notes. C'est un écosystème conçu pour renforcer le lien entre les élèves et l'administration.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Accès sécurisé aux données élèves",
                                    "Analyse statistique des performances",
                                    "Conformité avec le programme national"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-green-500 h-5 w-5" />
                                        <span className="font-medium text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            className="lg:w-1/2 grid grid-cols-2 gap-4"
                        >
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">98%</div>
                                    <div className="text-sm text-slate-500 font-medium">Satisfaction parents</div>
                                </div>
                                <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
                                    <div className="text-3xl font-bold mb-1">24/7</div>
                                    <div className="text-sm text-blue-100 font-medium">Accès illimité</div>
                                </div>
                            </div>
                            <div className="pt-8 space-y-4">
                                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm text-white">
                                    <div className="text-3xl font-bold mb-1">+10k</div>
                                    <div className="text-sm text-slate-400 font-medium">Étudiants inscrits</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">0%</div>
                                    <div className="text-sm text-slate-500 font-medium">Papier gaspillé</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Section - Design "Card & Info" */}
            <section id="contact" className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        {/* Infos de contact */}
                        <div className="md:w-1/3 bg-blue-600 p-12 text-white flex flex-col justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Contactez-nous</h2>
                                <p className="text-blue-100 mb-10">Une question ? Notre équipe vous répond en moins de 24 heures.</p>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/10 p-3 rounded-lg"><Mail className="w-6 h-6" /></div>
                                        <div>
                                            <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Email</p>
                                            <p className="font-medium">contact@projetschool.dz</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/10 p-3 rounded-lg"><Phone className="w-6 h-6" /></div>
                                        <div>
                                            <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Téléphone</p>
                                            <p className="font-medium">+213 (0) 23 XX XX XX</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/10 p-3 rounded-lg"><MapPin className="w-6 h-6" /></div>
                                        <div>
                                            <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Adresse</p>
                                            <p className="font-medium">Alger, Algérie</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors font-bold text-xs">FB</div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors font-bold text-xs">LN</div>
                            </div>
                        </div>

                        {/* Formulaire */}
                        <div className="md:w-2/3 bg-white p-12">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Nom complet</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" placeholder="Jean Dupont" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email académique</label>
                                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" placeholder="nom@ecole.dz" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Sujet</label>
                                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none">
                                        <option>Support technique</option>
                                        <option>Demande d'inscription</option>
                                        <option>Partenariat</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Message</label>
                                    <textarea rows="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group">
                                    Envoyer le message
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-6">
                                <GraduationCap className="h-6 w-6 text-blue-600" />
                                <span className="text-xl font-black text-slate-900">Projetschool</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Plateforme leader pour la gestion scolaire numérique en Algérie. Simplifions ensemble l'éducation.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                            <div>
                                <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Liens</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li><a href="#" className="hover:text-blue-600 transition-colors">Accueil</a></li>
                                    <li><a href="#about" className="hover:text-blue-600 transition-colors">À propos</a></li>
                                    <li><a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Légal</h4>
                                <ul className="space-y-4 text-sm text-slate-500">
                                    <li><a href="#" className="hover:text-blue-600 transition-colors">Confidentialité</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition-colors">CGU</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} Projetschool Algérie. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}
