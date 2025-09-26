import { useState, useCallback } from 'react';
import { useToasts } from './useToasts';
import { simulateDownload } from '../api/mock';
import type { QueueItem, Analysis, DownloadOptions } from '../types';

// Define interfaces for the hook's dependencies to make them explicit
interface AnalysisStateForQueue {
  analysis: Analysis | null;
  setError: (error: string) => void;
}

interface OptionsStateForQueue {
  trimState: { ok: boolean; msg?: string };
  buildOptions: (meta: Analysis) => DownloadOptions;
}

export function useQueue(analysisState: AnalysisStateForQueue, options: OptionsStateForQueue) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const { addToast } = useToasts();
  const [concurrency, setConcurrency] = useState(2);

  const startItem = (id: string) => {
    const item = queue.find(q => q.id === id);
    if (!item) return;

    setQueue(prev => prev.map(q => (q.id === id ? { ...q, status: 'downloading' } : q)));

    const cancel = simulateDownload(item, ({ percent, speedKB, eta }) => {
      setQueue(prev => prev.map(q => q.id === id ? { ...q, progress: percent, speedKB, eta, status: percent >= 100 ? 'finished' : 'downloading' } : q));
    });

    setQueue(prev => prev.map(q => (q.id === id ? { ...q, cancel } : q)));
  };

  const cancelItem = (id: string) => {
    const item = queue.find((q) => q.id === id);
    item?.cancel?.();
    setQueue(prev => prev.map(q => (q.id === id ? { ...q, status: 'canceled' } : q)));
  };

  const removeItem = (id: string) => {
    const item = queue.find((q) => q.id === id);
    item?.cancel?.();
    setQueue(prev => prev.filter((q) => q.id !== id));
  };

  const startAll = () => {
    let running = queue.filter(q => q.status === 'downloading').length;
    queue.filter(q => q.status === 'queued').forEach((q, i) => {
      if (running < concurrency) {
        startItem(q.id);
        running++;
      } else {
        setTimeout(() => startItem(q.id), (i + 1) * 500);
      }
    });
  };

  const clearFinished = () => {
    setQueue(prev => prev.filter(q => q.status !== 'finished'));
  };

  const handleAddToQueue = useCallback(() => {
    const { analysis, setError } = analysisState;
    const { trimState, buildOptions } = options;

    if (!analysis) return;

    if (!trimState.ok) {
      setError(trimState.msg || 'Invalid trim settings');
      return;
    }

    const downloadOpts = buildOptions(analysis);
    const id = Math.random().toString(36).slice(2);
    const newItem: QueueItem = {
      id,
      meta: analysis,
      opts: downloadOpts,
      status: 'queued',
      progress: 0,
      eta: null,
      speedKB: null,
      cancel: null,
    };
    setQueue(prev => [newItem, ...prev]);
    addToast('Added to queue!', 'success');
  }, [analysisState, options, addToast]);

  return {
    queue,
    concurrency,
    setConcurrency,
    startItem,
    cancelItem,
    removeItem,
    startAll,
    clearFinished,
    handleAddToQueue,
  };
}