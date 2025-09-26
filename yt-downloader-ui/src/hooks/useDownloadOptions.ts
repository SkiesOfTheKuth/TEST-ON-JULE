import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { parseHMS, previewFilename } from '../utils';
import type { Analysis, Format, Subtitles, ThumbnailOptions, DownloadOptions } from '../types';

export function useDownloadOptions(analysis: Analysis | null) {
  const [mode, setMode] = useLocalStorage<'video+audio' | 'video-only' | 'audio-only'>('ytui_mode', 'video+audio');
  const [format, setFormat] = useLocalStorage('ytui_format', 'auto');
  const [res, setRes] = useLocalStorage('ytui_res', 'auto');
  const [fps, setFps] = useLocalStorage('ytui_fps', 'auto');
  const [abr, setAbr] = useLocalStorage('ytui_abr', 160);

  const [start, setStart] = useLocalStorage('ytui_trim_start', '');
  const [end, setEnd] = useLocalStorage('ytui_trim_end', '');
  const [enableTrim, setEnableTrim] = useLocalStorage('ytui_trim_enable', false);

  const [subtitles, setSubtitles] = useLocalStorage<Subtitles>('ytui_subs', { enabled: false, lang: 'en', burnIn: false });
  const [thumb, setThumb] = useLocalStorage<ThumbnailOptions>('ytui_thumb', { enabled: false, size: 'maxres' });

  const [filenameTpl, setFilenameTpl] = useLocalStorage('ytui_tpl', '{title} - {channel} ({res})');
  const [sanitize, setSanitize] = useLocalStorage('ytui_sanitize', true);
  const [filenamePreview, setFilenamePreview] = useState('');

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

  const bestFormat = useMemo<Format | null>(() => {
    if (!filteredFormats.length) return null;
    const rec = filteredFormats.find((f) => /recommended/i.test(f.note || ''));
    if (rec) return rec;
    const resRank = (r: string | null) => (r ? Number(String(r).replace(/p.*/, '')) : 0);
    return [...filteredFormats].sort((a, b) => resRank(b.res) - resRank(a.res) || (b.fps || 0) - (a.fps || 0) || (b.abr || 0) - (a.abr || 0))[0];
  }, [filteredFormats]);

  const trimState = useMemo(() => {
    if (!enableTrim) return { ok: true };
    const s = parseHMS(start);
    const e = parseHMS(end);
    if (s < 0 || e < 0) return { ok: false, msg: 'Times must be positive' };
    if (e && s >= e) return { ok: false, msg: 'End must be after start' };
    if (analysis?.duration && e && e > analysis.duration) return { ok: false, msg: 'End exceeds video length' };
    return { ok: true };
  }, [enableTrim, start, end, analysis]);

  useEffect(() => {
    if (!analysis) {
      setFilenamePreview('');
      return;
    }
    const p = previewFilename(filenameTpl, analysis, bestFormat, { sanitize });
    setFilenamePreview(p);
  }, [analysis, filenameTpl, sanitize, bestFormat]);

  const buildOptions = (meta: Analysis): DownloadOptions => {
    const fmt = bestFormat;
    return {
      mode, container: format === 'auto' ? (fmt?.container || 'mp4') : format,
      res: res === 'auto' ? (fmt?.res || null) : res,
      fps: fps === 'auto' ? (fmt?.fps || null) : Number(fps) || null,
      abr: Number(abr) || null,
      trim: enableTrim ? { start: parseHMS(start) || 0, end: parseHMS(end) || null } : null,
      subtitles, thumbnail: thumb, filenameTpl, sanitize,
    };
  };

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