import { useLocalStorage } from './useLocalStorage';
import { useState, useEffect } from 'react';

export function useUI() {
  const [dark, setDark] = useLocalStorage('ytui_dark', true);
  const [compact, setCompact] = useLocalStorage('ytui_compact', false);
  const [showHelp, setShowHelp] = useState(false);
  const [showQAPanel, setShowQAPanel] = useState(false);

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