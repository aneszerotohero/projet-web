import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { InertiaProgress } from '@inertiajs/progress';
import Toast from './Components/Toast';
import { setupGlobalNotifications } from './utils/notifications';
import '../css/app.css';

InertiaProgress.init();

// Setup global notifications
setupGlobalNotifications();

// Setup error handlers for Inertia router
router.on('invalid', (event) => {
    event.preventDefault();

    // Force page reload to refresh CSRF token on 419 errors
    if (event.detail.response?.status === 419) {
        window.location.href = window.location.href;
    }
});

router.on('error', (event) => {
    const status = event.detail.response?.status;
    if (status === 500) {
        window.$notify?.error('Une erreur serveur s\'est produite. Veuillez réessayer.');
    }
});

createInertiaApp({
    resolve: name => {
        // 1. On charge toutes les pages
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });

        // 2. On construit le chemin attendu
        const expectedPath = `./Pages/${name}.jsx`;

        // 3. On vérifie si la page existe
        const page = pages[expectedPath];

        if (!page) {
            console.error(`🚨 ERREUR INERTIA 404 : Impossible de trouver le composant pour la route "${name}"`);
            console.error(`👉 Chemin cherché : ${expectedPath}`);
            console.log("📂 Voici la liste des fichiers trouvés par Vite :", Object.keys(pages));

            // Pour éviter l'écran blanc total, on renvoie une erreur si possible,
            // ou on laisse planter mais au moins on a les logs au dessus.
            throw new Error(`Page not found: ${expectedPath}`);
        }

        return page.default;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <Toast />
                <App {...props} />
            </>
        );
    },
});
