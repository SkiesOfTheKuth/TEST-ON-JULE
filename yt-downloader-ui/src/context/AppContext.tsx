import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useUI } from '../hooks/useUI';
import { useAnalysis } from '../hooks/useAnalysis';
import { useDownloadOptions } from '../hooks/useDownloadOptions';
import { useQueue } from '../hooks/useQueue';
import { runQATests } from '../utils/qaTests';
import type { AppContextType } from '../types';

/**
 * The main React Context for the application.
 * It is initialized as undefined and will be provided a value by the AppProvider.
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * A custom hook that provides easy access to the AppContext.
 * It ensures that the context is consumed within a component that is a child of the AppProvider.
 * @returns The context value, which includes the entire application state and all handler functions.
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

/**
 * The main state provider for the application.
 * It composes the application's state by calling all the domain-specific custom hooks
 * and provides the combined state and handlers to all child components via the AppContext.
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // --- Custom Hooks Composition ---
  const ui = useUI();
  const analysisState = useAnalysis();
  const options = useDownloadOptions(analysisState.analysis);
  const queueState = useQueue(analysisState, options);

  // --- Final Context Value ---
  const qaTests = useMemo(() => runQATests(), []);

  const value: AppContextType = {
    ...ui,
    ...analysisState,
    ...options,
    ...queueState,
    qaTests,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};