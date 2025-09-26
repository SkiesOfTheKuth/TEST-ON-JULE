import { useState, useCallback } from 'react';
import type { Toast } from '../types';

type AddToastFn = (message: string, type?: Toast['type']) => void;

interface UseToastsReturn {
  toasts: Toast[];
  addToast: AddToastFn;
}

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