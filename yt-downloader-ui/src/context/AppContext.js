import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToasts } from '../hooks/useToasts';
import { isYouTubeUrl, parseHMS, previewFilename } from '../utils';
import { simulateAnalyze, simulateDownload } from '../api/mock';
import { runQATests } from '../utils/qaTests';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  // --- State Management ---
  const [dark, setDark] = useLocalStorage("ytui_dark", true);
  const [compact, setCompact] = useLocalStorage("ytui_compact", false);
  const [url, setUrl] = useState("");
  const [multi, setMulti] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const [mode, setMode] = useLocalStorage("ytui_mode", "video+audio");
  const [format, setFormat] = useLocalStorage("ytui_format", "auto");
  const [res, setRes] = useLocalStorage("ytui_res", "auto");
  const [fps, setFps] = useLocalStorage("ytui_fps", "auto");
  const [abr, setAbr] = useLocalStorage("ytui_abr", 160);

  const [start, setStart] = useLocalStorage("ytui_trim_start", "");
  const [end, setEnd] = useLocalStorage("ytui_trim_end", "");
  const [enableTrim, setEnableTrim] = useLocalStorage("ytui_trim_enable", false);

  const [subtitles, setSubtitles] = useLocalStorage("ytui_subs", { enabled: false, lang: "en", burnIn: false });
  const [thumb, setThumb] = useLocalStorage("ytui_thumb", { enabled: false, size: "maxres" });

  const [filenameTpl, setFilenameTpl] = useLocalStorage("ytui_tpl", "{title} - {channel} ({res})");
  const [sanitize, setSanitize] = useLocalStorage("ytui_sanitize", true);
  const [concurrency, setConcurrency] = useLocalStorage("ytui_concurrency", 2);

  const [queue, setQueue] = useState([]);
  const { toasts, addToast } = useToasts();
  const [showHelp, setShowHelp] = useState(false);
  const [showQAPanel, setShowQAPanel] = useState(false);
  const [filenamePreview, setFilenamePreview] = useState("");

  // --- Effects ---
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
    if (compact) root.classList.add("compact"); else root.classList.remove("compact");
  }, [dark, compact]);

  const handleAddToQueue = useCallback(() => {
    if (!analysis) return;
    const trimValid = trimState;
    if (!trimValid.ok) {
      setError(trimValid.msg);
      return;
    }
    const opts = buildOptions(analysis);
    const id = Math.random().toString(36).slice(2);
    setQueue(prev => [{ id, meta: analysis, opts, status: "queued", progress: 0, eta: null, speedKB: null, cancel: null }, ...prev]);
    addToast("Added to queue!", "success");
  }, [analysis, addToast]); // Note: trimState and buildOptions should be dependencies if they aren't stable

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); document.getElementById("yt-url-input")?.focus(); }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleAddToQueue(); }
      if (e.key === '?') { e.preventDefault(); setShowHelp(v => !v); }
      if (e.key.toLowerCase() === 't' && e.altKey) { e.preventDefault(); setShowQAPanel(v => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAddToQueue]);

  // --- Derived State & Memoized Values ---
  const isPlaylist = useMemo(() => /[?&]list=/.test(url), [url]);
  const canAnalyze = isYouTubeUrl(url);

  const filteredFormats = useMemo(() => {
    if (!analysis) return [];
    return analysis.formats.filter((f) => {
      if (mode !== "video+audio" && f.kind !== mode) return false;
      if (format !== "auto" && f.container !== format) return false;
      if (res !== "auto" && f.res !== res) return false;
      if (fps !== "auto" && f.fps !== Number(fps)) return false;
      if (mode === "audio-only" && abr && f.abr && Math.abs(Number(abr) - f.abr) > 32) return false;
      return true;
    });
  }, [analysis, mode, format, res, fps, abr]);

  const bestFormat = useMemo(() => {
    if (!filteredFormats.length) return null;
    const rec = filteredFormats.find((f) => /recommended/i.test(f.note || ""));
    if (rec) return rec;
    const resRank = (r) => (r ? Number(String(r).replace(/p.*/, "")) : 0);
    return [...filteredFormats].sort((a, b) => (resRank(b.res) - resRank(a.res)) || ((b.fps || 0) - (a.fps || 0)) || ((b.abr || 0) - (a.abr || 0)))[0];
  }, [filteredFormats]);

  const trimState = useMemo(() => {
    if (!enableTrim) return { ok: true };
    const s = parseHMS(start);
    const e = parseHMS(end);
    if (s < 0 || e < 0) return { ok: false, msg: "Times must be positive" };
    if (e && s >= e) return { ok: false, msg: "End must be after start" };
    if (analysis?.duration && e && e > analysis.duration) return { ok: false, msg: "End exceeds video length" };
    return { ok: true };
  }, [enableTrim, start, end, analysis]);

  const buildOptions = useCallback((meta) => {
    const fmt = bestFormat;
    return {
      mode, container: format === "auto" ? (fmt?.container || "mp4") : format,
      res: res === "auto" ? (fmt?.res || null) : res,
      fps: fps === "auto" ? (fmt?.fps || null) : Number(fps) || null,
      abr: Number(abr) || null,
      trim: enableTrim ? { start: parseHMS(start) || 0, end: parseHMS(end) || null } : null,
      subtitles, thumbnail: thumb, filenameTpl, sanitize,
    };
  }, [mode, format, res, fps, abr, enableTrim, start, end, subtitles, thumb, filenameTpl, sanitize, bestFormat]);

  useEffect(() => {
    if (!analysis) {
      setFilenamePreview("");
      return;
    }
    const p = previewFilename(filenameTpl, analysis, bestFormat, { sanitize });
    setFilenamePreview(p);
  }, [analysis, filenameTpl, sanitize, bestFormat]);

  // --- Handlers ---
  function addUrl(u) {
    const s = String(u).trim();
    if (s && isYouTubeUrl(s)) setMulti((prev) => Array.from(new Set([...prev, s])));
  }

  async function handleAnalyze(u = url) {
    setError("");
    setAnalyzing(true);
    try {
      const meta = await simulateAnalyze(u);
      setAnalysis(meta);
    } catch (err) {
      setAnalysis(null);
      setError(err.message || "Failed to analyze URL");
    } finally {
      setAnalyzing(false);
    }
  }

  function startItem(id) {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: "downloading" } : q));
    const item = queue.find(q => q.id === id);
    if (!item) return;
    const cancel = simulateDownload(item, ({ percent, speedKB, eta }) => {
      setQueue(prev => prev.map(q => q.id === id ? { ...q, progress: percent, speedKB, eta, status: percent >= 100 ? "finished" : "downloading" } : q));
    });
    setQueue(prev => prev.map(q => q.id === id ? { ...q, cancel } : q));
  }

  function cancelItem(id) {
    const item = queue.find((q) => q.id === id);
    item?.cancel?.();
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: "canceled" } : q)));
  }

  function removeItem(id) {
    const item = queue.find((q) => q.id === id);
    item?.cancel?.();
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  function startAll() {
    let running = queue.filter(q => q.status === 'downloading').length;
    queue.filter(q => q.status === 'queued').forEach((q, i) => {
      if (running < Number(concurrency)) {
        startItem(q.id);
        running++;
      } else {
        setTimeout(() => startItem(q.id), (i + 1) * 500);
      }
    });
  }

  function clearFinished() {
    setQueue(prev => prev.filter(q => q.status !== "finished"));
  }

  const qaTests = useMemo(() => runQATests(), []);

  // --- Context Value ---
  const value = {
    dark, setDark,
    compact, setCompact,
    url, setUrl,
    multi, setMulti,
    analyzing,
    analysis,
    error, setError,
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
    concurrency, setConcurrency,
    queue,
    toasts,
    showHelp, setShowHelp,
    showQAPanel, setShowQAPanel,
    filenamePreview,
    isPlaylist,
    canAnalyze,
    filteredFormats,
    bestFormat,
    trimState,
    addUrl,
    handleAnalyze,
    handleAddToQueue,
    startItem,
    cancelItem,
    removeItem,
    startAll,
    clearFinished,
    qaTests,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}