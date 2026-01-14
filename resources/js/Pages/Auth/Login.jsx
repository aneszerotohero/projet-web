import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { User, Lock, Eye, EyeOff, ArrowRight, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
    // RÉCUPÉRATION DES ERREURS ET FLASH DU BACKEND
    const { errors, flash } = usePage().props;

    const [matricule, setMatricule] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Slider state (Inchangé)
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            title: "Bienvenue sur votre Espace Numérique",
            description: "Consultez vos notes, vos absences et votre emploi du temps en temps réel.",
            color: "from-blue-900/90 to-blue-700/80"
        },
        {
            image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            title: "Suivez votre progression",
            description: "Visualisez vos statistiques et classements pour rester motivé tout au long de l'année.",
            color: "from-indigo-900/90 to-purple-800/80"
        },
        {
            image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            title: "Restez connecté",
            description: "Recevez les dernières informations de l'administration et de vos enseignants.",
            color: "from-emerald-900/90 to-teal-800/80"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/login', {
            matricule,
            password,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* Left Side - Image Slider */}
            <div className="hidden md:flex w-1/2 lg:w-3/5 relative flex-col justify-between p-12 text-white bg-gray-900">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} mix-blend-multiply`}></div>
                    </div>
                ))}

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <a href="/"><span className="text-2xl font-bold tracking-wide">Projet school</span></a>
                    </div>
                </div>

                <div className="relative z-10 mb-8 max-w-lg">
                    <div className="h-40">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute bottom-0 left-0 w-full transition-all duration-700 transform ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                            >
                                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">{slide.title}</h2>
                                <p className="text-blue-50 text-lg leading-relaxed max-w-[90%]">{slide.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 mt-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-10 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center bg-white relative overflow-y-auto">
                <div className="w-full max-w-md mx-auto p-8 md:p-12">

                    {/* --- MESSAGES FLASH (Succès ou Erreur session) --- */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 font-bold text-sm">
                            <CheckCircle size={18} /> {flash.success}
                        </div>
                    )}

                    <div className="mb-10">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Connexion</h2>
                        <p className="text-gray-500 text-lg">Heureux de vous revoir ! 👋</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email ou Matricule</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className={`h-5 w-5 ${errors?.matricule ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-blue-600 transition-colors`} />
                                </div>
                                <input
                                    type="text"
                                    className={`w-full pl-11 pr-4 py-4 border rounded-xl outline-none transition-all bg-gray-50 focus:bg-white font-medium ${errors?.matricule ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
                                    placeholder="ex: 19382010"
                                    value={matricule}
                                    onChange={e => setMatricule(e.target.value)}
                                    required
                                />
                            </div>
                            {/* --- MESSAGE ERREUR MATRICULE --- */}
                            {errors?.matricule && (
                                <p className="mt-2 text-sm text-red-600 font-bold ml-1 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.matricule}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className={`h-5 w-5 ${errors?.password ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-blue-600 transition-colors`} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full pl-11 pr-12 py-4 border rounded-xl outline-none transition-all bg-gray-50 focus:bg-white font-medium ${errors?.password ? 'border-red-500 ring-4 ring-red-500/10' : 'border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {/* --- MESSAGE ERREUR MOT DE PASSE --- */}
                            {errors?.password && (
                                <p className="mt-2 text-sm text-red-600 font-bold ml-1 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-xl hover:shadow-blue-600/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 mt-2"
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Se connecter <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="md:hidden py-6 text-center text-xs text-gray-400 border-t border-gray-100 mt-auto">
                    &copy; 2024 Projetschool.
                </div>
            </div>
        </div>
    );
}
