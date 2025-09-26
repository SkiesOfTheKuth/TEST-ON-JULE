import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { parseHMS, previewFilename } from '../utils';
import type { Analysis, Format, Subtitles, ThumbnailOptions, DownloadOptions } from '../types';

/**
 * A custom hook to manage all user-configurable download options.
 * This includes format, quality, trimming, subtitles, and filename settings.
 * It also computes derived state based on these options, such as the list of available formats.
 * @param analysis The current video analysis object, or null if no analysis has been performed.
 * @returns An object containing the download options state, setters, and derived values.
 */
export function useDownloadOptions(analysis: Analysis | null) {
  // --- Core media options ---
  const [mode, setMode] = useLocalStorage<'video+audio' | 'video-only' | 'audio-only'>('ytui_mode', 'video+audio');
  const [format, setFormat] = useLocalStorage('ytui_format', 'auto');
  const [res, setRes] = useLocalStorage('ytui_res', 'auto');
  const [fps, setFps] = useLocalStorage('ytui_fps', 'auto');
  const [abr, setAbr] = useLocalStorage('ytui_abr', 160);

  // --- Trimming options ---
  const [start, setStart] = useLocalStorage('ytui_trim_start', '');
  const [end, setEnd] = useLocalStorage('ytui_trim_end', '');
  const [enableTrim, setEnableTrim] = useLocalStorage('ytui_trim_enable', false);

  // --- Extra options ---
  const [subtitles, setSubtitles] = useLocalStorage<Subtitles>('ytui_subs', { enabled: false, lang: 'en', burnIn: false });
  const [thumb, setThumb] = useLocalStorage<ThumbnailOptions>('ytui_thumb', { enabled: false, size: 'maxres' });

  // --- Filename options ---
  const [filenameTpl, setFilenameTpl] = useLocalStorage('ytui_tpl', '{title} - {channel} ({res})');
  const [sanitize, setSanitize] = useLocalStorage('ytui_sanitize', true);
  const [filenamePreview, setFilenamePreview] = useState('');

  /**
   * A memoized list of formats that match the user's current filter settings (mode, format, res, etc.).
   */
  const filteredFormats = useMemo<Format[]>(() => {
    if (!analysis) return [];
    return analysis.formats.filter((f) => {
      if (mode !== 'video+audio' && f.kind !== mode) return false;
      if (format !== 'auto' && f.container !== format) return false;
      if (res !== 'auto' && f.res !== res) return false;
      if (fps !== 'auto' && f.fps !== Number(fps)) return false;
      if (mode === 'audio-only' && abr && f.abr && Math.abs(Number(abr) - f.abr) > 32) return false;
      return true;
    });
  }, [analysis, mode, format, res, fps, abr]);

  /**
   * The best-matching format based on the current filters, used as a default selection.
   */
  const bestFormat = useMemo<Format | null>(() => {
    if (!filteredFormats.length) return null;
    const rec = filteredFormats.find((f) => /recommended/i.test(f.note || ''));
    if (rec) return rec;
    const resRank = (r: string | null) => (r ? Number(String(r).replace(/p.*/, '')) : 0);
    return [...filteredFormats].sort((a, b) => resRank(b.res) - resRank(a.res) || (b.fps || 0) - (a.fps || 0) || (b.abr || 0) - (a.abr || 0))[0];
  }, [filteredFormats]);

  /**
   * The validation state of the current trim settings.
   */
  const trimState = useMemo(() => {
    if (!enableTrim) return { ok: true };
    const s = parseHMS(start);
    const e = parseHMS(end);
    if (s < 0 || e < 0) return { ok: false, msg: 'Times must be positive' };
    if (e && s >= e) return { ok: false, msg: 'End must be after start' };
    if (analysis?.duration && e && e > analysis.duration) return { ok: false, msg: 'End exceeds video length' };
    return { ok: true };
  }, [enableTrim, start, end, analysis]);

  // Effect to update the filename preview whenever the template or related options change.
  useEffect(() => {
    if (!analysis) {
      setFilenamePreview('');
      return;
    }
    const p = previewFilename(filenameTpl, analysis, bestFormat, { sanitize });
    setFilenamePreview(p);
  }, [analysis, filenameTpl, sanitize, bestFormat]);

  /**
   * Builds the final set of download options for a queue item.
   * @param meta The video analysis object.
   * @returns The fully constructed DownloadOptions object.
   */
  const buildOptions = useCallback((meta: Analysis): DownloadOptions => {
    const fmt = bestFormat;
    return {
      mode, container: format === 'auto' ? (fmt?.container || 'mp4') : format,
      res: res === 'auto' ? (fmt?.res || null) : res,
      fps: fps === 'auto' ? (fmt?.fps || null) : Number(fps) || null,
      abr: Number(abr) || null,
      trim: enableTrim ? { start: parseHMS(start) || 0, end: parseHMS(end) || null } : null,
      subtitles, thumbnail: thumb, filenameTpl, sanitize,
    };
  }, [
    bestFormat, mode, format, res, fps, abr, enableTrim, start, end,
    subtitles, thumb, filenameTpl, sanitize
  ]);

  return {
    mode, setMode,
    format, setFormat,
    res, setRes,
    fps, setFps,
    abr, setAbr,
    start, setStart,
    end, setEnd,
    enableTrim, setEnableTrim,
    subtitles, setSubtitles,
    thumb, setThumb,
    filenameTpl, setFilenameTpl,
    sanitize, setSanitize,
    filenamePreview,
    filteredFormats,
    bestFormat,
    trimState,
    buildOptions,
  };
}