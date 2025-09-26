import { useState, useCallback } from 'react';
import { useToasts } from './useToasts';
import { simulateDownload } from '../api/mock';
import type { QueueItem, Analysis, DownloadOptions } from '../types';

/**
 * Defines the shape of the analysis state required by the useQueue hook.
 */
interface AnalysisStateForQueue {
  analysis: Analysis | null;
  setError: (error: string) => void;
}

/**
 * Defines the shape of the options state required by the useQueue hook.
 */
interface OptionsStateForQueue {
  trimState: { ok: boolean; msg?: string };
  buildOptions: (meta: Analysis) => DownloadOptions;
}

/**
 * A custom hook to manage the download queue state and all related actions.
 * @param analysisState The state object from the `useAnalysis` hook.
 * @param options The state object from the `useDownloadOptions` hook.
 * @returns An object containing the queue state and handler functions.
 */
export function useQueue(analysisState: AnalysisStateForQueue, options: OptionsStateForQueue) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const { addToast } = useToasts();
  const [concurrency, setConcurrency] = useState(2);

  /**
   * Starts the download for a specific item in the queue.
   * @param id The ID of the queue item to start.
   */
  const startItem = (id: string) => {
    const item = queue.find(q => q.id === id);
    if (!item) return;

    setQueue(prev => prev.map(q => (q.id === id ? { ...q, status: 'downloading' } : q)));

    const cancel = simulateDownload(item, ({ percent, speedKB, eta }) => {
      setQueue(prev => prev.map(q => q.id === id ? { ...q, progress: percent, speedKB, eta, status: percent >= 100 ? 'finished' : 'downloading' } : q));
    });

    setQueue(prev => prev.map(q => (q.id === id ? { ...q, cancel } : q)));
  };

  /**
   * Cancels an in-progress download for a specific item.
   * @param id The ID of the queue item to cancel.
   */
  const cancelItem = (id: string) => {
    const item = queue.find((q) => q.id === id);
    item?.cancel?.();
    setQueue(prev => prev.map(q => (q.id === id ? { ...q, status: 'canceled' } : q)));
  };

  /**
   * Removes an item from the queue, canceling it if it's in progress.
   * @param id The ID of the queue item to remove.
   */
  const removeItem = (id: string) => {
    const item = queue.find((q) => q.id === id);
    item?.cancel?.();
    setQueue(prev => prev.filter((q) => q.id !== id));
  };

  /**
   * Starts all queued items, respecting the concurrency limit.
   */
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

  /**
   * Removes all finished items from the queue.
   */
  const clearFinished = () => {
    setQueue(prev => prev.filter(q => q.status !== 'finished'));
  };

  /**
   * Validates the current analysis and options, then adds a new item to the queue.
   */
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
  }, [analysisState.analysis, analysisState.setError, options.trimState, options.buildOptions, addToast]);

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