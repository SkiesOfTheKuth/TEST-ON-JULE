import { useLocalStorage } from './useLocalStorage';
import { useState, useEffect } from 'react';

/**
 * A custom hook to manage the global UI state of the application.
 * This includes theme (dark/light), layout (compact/comfort), and the visibility of overlays.
 * @returns An object containing UI state variables and their setters.
 */
export function useUI() {
  const [dark, setDark] = useLocalStorage('ytui_dark', true);
  const [compact, setCompact] = useLocalStorage('ytui_compact', false);
  const [showHelp, setShowHelp] = useState(false);
  const [showQAPanel, setShowQAPanel] = useState(false);

  // Effect to apply theme and layout classes to the root element.
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    if (compact) root.classList.add('compact'); else root.classList.remove('compact');
  }, [dark, compact]);

  return {
    dark, setDark,
    compact, setCompact,
    showHelp, setShowHelp,
    showQAPanel, setShowQAPanel,
  };
}