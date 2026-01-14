/**
 * Système de notifications global pour Inertia.js
 * Utilisation: window.$notify.success('Message'), window.$notify.error('Erreur')
 */

let notificationId = 0;
const listeners = new Set();

export const createNotificationStore = () => {
  const notifications = [];

  const add = (message, type = 'success', duration = 3000) => {
    const id = ++notificationId;
    const notification = { id, message, type };
    notifications.push(notification);

    listeners.forEach(listener => listener([...notifications]));

    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }

    return id;
  };

  const remove = (id) => {
    const index = notifications.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.splice(index, 1);
      listeners.forEach(listener => listener([...notifications]));
    }
  };

  const success = (message, duration = 3000) => add(message, 'success', duration);
  const error = (message, duration = 3000) => add(message, 'error', duration);

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    add,
    remove,
    success,
    error,
    subscribe,
    getAll: () => [...notifications],
  };
};

// Instance globale
let store = null;

export const getNotificationStore = () => {
  if (!store) {
    store = createNotificationStore();
  }
  return store;
};

// Exposition globale
export const setupGlobalNotifications = () => {
  const notifyStore = getNotificationStore();
  window.$notify = {
    success: notifyStore.success,
    error: notifyStore.error,
    add: notifyStore.add,
    remove: notifyStore.remove,
  };
};
