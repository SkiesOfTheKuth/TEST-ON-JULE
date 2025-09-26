import { useState, useCallback } from 'react';

export const useToasts = (timeout = 3000) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(current => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, timeout);
  }, [timeout]);

  return { toasts, addToast };
};