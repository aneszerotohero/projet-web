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
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`].default;
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
