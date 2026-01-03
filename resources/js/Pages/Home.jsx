import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen, UserCheck, BarChart2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            {/* Header / Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50"
            >
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                            Projetschool
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">Accueil</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">À propos</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                        <Link
                            href="/login"
                            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            Se connecter
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <header className="relative pt-16 pb-32 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        {/* Text Content */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="flex-1 text-center md:text-left z-10"
                        >
                            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-gray-900">
                                Bienvenue sur <br />
                                <span className="text-blue-600">Projetschool</span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                                La plateforme tout-en-un pour la gestion de votre vie scolaire en Algérie.
                                Consultez vos notes, justifiez vos absences et suivez votre progression académique en un clic.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                            >
                                Se connecter
                            </Link>
                        </motion.div>

                        {/* Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex-1 relative w-full max-w-xl"
                        >
                            {/* Decorative blobs */}
                            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                alt="Étudiants travaillant ensemble"
                                className="relative rounded-2xl shadow-2xl w-full object-cover h-[400px] z-10 transform transition-transform hover:scale-[1.01]"
                            />
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-24 bg-gray-50/50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                            Fonctionnalités
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Vos outils scolaires à portée de main
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Gérez votre parcours scolaire avec simplicité et efficacité grâce à nos outils dédiés.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {/* Feature 1 */}
                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                <BookOpen className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Suivi des Notes</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Accédez à vos bulletins, devoirs et résultats d'examens en temps réel dès leur publication par les enseignants.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
                                <UserCheck className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Gestion des Absences</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Visualisez votre historique de présence, recevez des alertes et justifiez vos absences directement en ligne.
                            </p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
                            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                                <BarChart2 className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Classement Général</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Comparez votre performance avec le classement de la classe et suivez votre évolution tout au long du semestre.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6"
                >
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-gray-400" />
                        <span className="font-bold text-gray-700">Projetschool</span>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-blue-600 transition-colors">Mentions Légales</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Confidentialité</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
                    </div>

                    <div className="text-sm text-gray-400">
                        &copy; 2024 Projetschool Algérie. Tous droits réservés.
                    </div>
                </motion.div>
            </footer>
        </div>
    );
}
