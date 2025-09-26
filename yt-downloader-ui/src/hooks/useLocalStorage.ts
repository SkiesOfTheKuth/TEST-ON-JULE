import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * A custom hook that provides a state variable that is persisted in the browser's localStorage.
 * It behaves like `useState`, but automatically syncs its state with a specified localStorage key.
 * @template T The type of the state to be stored.
 * @param key The key to use for storing the value in localStorage.
 * @param initial The initial value to use if no value is found in localStorage.
 * @returns A tuple containing the current state and a function to update it, identical to the `useState` hook.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, SetValue<T>] {
  const [state, setState] = useState<T>(() => {
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