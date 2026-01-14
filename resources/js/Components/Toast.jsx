import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { getNotificationStore } from '../utils/notifications';

export default function Toast() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const store = getNotificationStore();
    const unsubscribe = store.subscribe(setNotifications);

    // Set initial notifications
    setNotifications(store.getAll());

    return unsubscribe;
  }, []);

  const remove = (id) => {
    const store = getNotificationStore();
    store.remove(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            animate-in fade-in slide-in-from-right duration-300
            px-6 py-3 rounded-lg shadow-lg font-medium text-white
            flex items-center gap-3 min-w-80
            pointer-events-auto
            ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}
          `}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => remove(notification.id)}
            className="flex-shrink-0 text-white hover:text-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
