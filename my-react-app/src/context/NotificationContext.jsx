import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-lg bg-slate-800 text-white border border-slate-700 transition-all flex items-center space-x-3">
          <span className={`w-3 h-3 rounded-full ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
          <p className="text-sm">{notification.message}</p>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}