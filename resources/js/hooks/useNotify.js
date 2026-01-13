import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Hook pour afficher automatiquement les messages flash de Inertia
 */
export function useFlashMessage() {
  const { props } = usePage();

  useEffect(() => {
    if (props.flash?.success) {
      window.$notify?.success(props.flash.success);
    }
    if (props.flash?.error) {
      window.$notify?.error(props.flash.error);
    }
  }, [props.flash]);
}

/**
 * Hook pour afficher les erreurs de validation
 */
export function useValidationErrors() {
  const { props } = usePage();
  return props.errors || {};
}
