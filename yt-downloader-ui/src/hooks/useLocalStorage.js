import { useState, useEffect } from 'react';

export function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Failed to set localStorage key “${key}”`, e);
    }
  }, [key, state]);

  return [state, setState];
}