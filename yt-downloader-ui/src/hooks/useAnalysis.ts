import { useState, useMemo } from 'react';
import { isYouTubeUrl } from '../utils';
import { simulateAnalyze } from '../api/mock';
import type { Analysis } from '../types';

export function useAnalysis() {
  const [url, setUrl] = useState('');
  const [multi, setMulti] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');

  const isPlaylist = useMemo(() => /[?&]list=/.test(url), [url]);
  const canAnalyze = useMemo(() => isYouTubeUrl(url), [url]);

  const addUrl = (u: string) => {
    const s = String(u).trim();
    if (s && isYouTubeUrl(s)) {
      setMulti(prev => Array.from(new Set([...prev, s])));
    }
  };

  const handleAnalyze = async (u: string = url) => {
    setError('');
    setAnalyzing(true);
    try {
      const meta = await simulateAnalyze(u);
      setAnalysis(meta);
    } catch (err: any) {
      setAnalysis(null);
      setError(err.message || 'Failed to analyze URL');
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    url, setUrl,
    multi, setMulti,
    analyzing,
    analysis,
    error, setError,
    isPlaylist,
    canAnalyze,
    addUrl,
    handleAnalyze,
  };
}