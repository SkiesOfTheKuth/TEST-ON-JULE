import { useState, useMemo } from 'react';
import { isYouTubeUrl } from '../utils';
import { simulateAnalyze } from '../api/mock';
import type { Analysis } from '../types';

/**
 * A custom hook to manage the state and logic for the YouTube URL analysis process.
 * This includes handling the input URL, the analysis status, and the final analysis result or error.
 * @returns An object containing the analysis state and handler functions.
 */
export function useAnalysis() {
  const [url, setUrl] = useState('');
  const [multi, setMulti] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');

  const isPlaylist = useMemo(() => /[?&]list=/.test(url), [url]);
  const canAnalyze = useMemo(() => isYouTubeUrl(url), [url]);

  /**
   * Adds a valid YouTube URL to the multi-URL list for batch processing.
   * @param u The URL to add.
   */
  const addUrl = (u: string) => {
    const s = String(u).trim();
    if (s && isYouTubeUrl(s)) {
      setMulti(prev => Array.from(new Set([...prev, s])));
    }
  };

  /**
   * Initiates the analysis of a given YouTube URL.
   * Manages the `analyzing` state and sets the `analysis` result or an `error`.
   * @param u The URL to analyze. Defaults to the current URL in state.
   */
  const handleAnalyze = async (u: string = url) => {
    setError('');
    setAnalyzing(true);
    try {
      const meta = await simulateAnalyze(u);
      setAnalysis(meta);
    } catch (err: unknown) {
      setAnalysis(null);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during analysis.');
      }
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