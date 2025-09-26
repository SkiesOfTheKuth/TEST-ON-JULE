import React, { createContext, useContext, ReactNode } from 'react';
import { useUI } from '../hooks/useUI';
import { useAnalysis } from '../hooks/useAnalysis';
import { useDownloadOptions } from '../hooks/useDownloadOptions';
import { useQueue } from '../hooks/useQueue';
import { runQATests } from '../utils/qaTests';
import type { AppContextType } from '../types';

// --- Context ---
const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // --- Custom Hooks Composition ---
  const ui = useUI();
  const analysisState = useAnalysis();
  const options = useDownloadOptions(analysisState.analysis);
  const queueState = useQueue(analysisState, options);

  // --- Final Context Value ---
  const value: AppContextType = {
    ...ui,
    ...analysisState,
    ...options,
    ...queueState,
    qaTests: runQATests(),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};