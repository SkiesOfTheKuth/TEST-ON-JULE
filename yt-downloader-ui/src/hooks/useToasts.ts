import { useState, useCallback } from 'react';
import type { Toast } from '../types';

type AddToastFn = (message: string, type?: Toast['type']) => void;

interface UseToastsReturn {
  toasts: Toast[];
  addToast: AddToastFn;
}

/**
 * A custom hook for managing a list of toast notifications.
 * @param timeout The duration in milliseconds before a toast automatically disappears.
 * @returns An object containing the current list of toasts and a function to add a new one.
 */
export const useToasts = (timeout: number = 3000): UseToastsReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast: AddToastFn = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(current => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, timeout);
  }, [timeout]);

  return { toasts, addToast };
};