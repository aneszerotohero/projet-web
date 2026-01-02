import { router } from '@inertiajs/react';

export function logout() {
  router.post('/logout', {}, {
    onFinish: () => {
      router.visit('/login', { replace: true });
    },
  });
}
