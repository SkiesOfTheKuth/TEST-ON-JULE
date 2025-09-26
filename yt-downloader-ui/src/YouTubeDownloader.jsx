import React, { useEffect, useMemo, useState, useCallback } from "react";

// Refactored Components & Logic
import { Header } from './components/Header';
import { URLInputSection } from './components/URLInputSection';
import { AnalysisSection } from './components/AnalysisSection';
import { OptionsSection } from './components/OptionsSection';
import { QueueSection } from './components/QueueSection';
import { HelpOverlay, QAPanel, ToastContainer } from './components/Overlays';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToasts } from './hooks/useToasts';
import { isYouTubeUrl, parseHMS, previewFilename } from './utils';
import { simulateAnalyze, simulateDownload } from './api/mock';

// ----------------------------- Main Application Component ----------------------------- //
export default function YouTubeDownloaderUI() {
  // State Management
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

  // Effects
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
  }, [analysis, addToast]);

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

  // Derived State & Memoized Values
  const isPlaylist = useMemo(() => /[?&]list=/.test(url), [url]);
  const canAnalyze = isYouTubeUrl(url);

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

  function buildOptions(meta) {
    const fmt = bestFormat;
    return {
      mode,
      container: format === "auto" ? (fmt?.container || "mp4") : format,
      res: res === "auto" ? (fmt?.res || null) : res,
      fps: fps === "auto" ? (fmt?.fps || null) : Number(fps) || null,
      abr: Number(abr) || null,
      trim: enableTrim ? { start: parseHMS(start) || 0, end: parseHMS(end) || null } : null,
      subtitles,
      thumbnail: thumb,
      filenameTpl,
      sanitize,
    };
  }

  useEffect(() => {
    if (!analysis) {
      setFilenamePreview("");
      return;
    }
    const p = previewFilename(filenameTpl, analysis, bestFormat, { sanitize });
    setFilenamePreview(p);
  }, [analysis, filenameTpl, sanitize, bestFormat]);

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

  const qaTests = useMemo(() => {
    // This could be moved to its own file too, but is fine here for now.
    const cases = [];
    const add = (name, fn) => {
      try { fn(); cases.push({ name, ok: true, msg: "" }); }
      catch (e) { cases.push({ name, ok: false, msg: e.message }); }
    };
    const eq = (a, b) => {
      const sa = JSON.stringify(a); const sb = JSON.stringify(b);
      if (sa !== sb) throw new Error(`Expected ${sb}, got ${sa}`);
    };
    add("parseHMS: empty/null", () => { eq(parseHMS(""), 0); eq(parseHMS(null), 0); });
    add("isYouTubeUrl: standard", () => eq(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), true));
    return cases;
  }, []);

  // JSX Render
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-amber-300 text-black px-3 py-1 rounded">Skip to content</a>
      <Header dark={dark} setDark={setDark} compact={compact} setCompact={setCompact} />

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <URLInputSection {...{ url, setUrl, multi, setMulti, error, setError, isPlaylist, canAnalyze, analyzing, handleAnalyze, addUrl, queue }} />

        <section className="grid lg:grid-cols-12 gap-6">
          <AnalysisSection
            analysis={analysis}
            filteredFormats={filteredFormats}
            chosenFormat={bestFormat}
            mode={mode}
            format={format}
            res={res}
            fps={fps}
            enableTrim={enableTrim}
            start={start}
            end={end}
            subtitles={subtitles}
          />
          <OptionsSection
            analysis={analysis}
            mode={mode} setMode={setMode}
            format={format} setFormat={setFormat}
            res={res} setRes={setRes}
            fps={fps} setFps={setFps}
            abr={abr} setAbr={setAbr}
            filenameTpl={filenameTpl} setFilenameTpl={setFilenameTpl}
            filenamePreview={filenamePreview}
            sanitize={sanitize} setSanitize={setSanitize}
            enableTrim={enableTrim} setEnableTrim={setEnableTrim}
            start={start} setStart={setStart}
            end={end} setEnd={setEnd}
            trimState={trimState}
            subtitles={subtitles} setSubtitles={setSubtitles}
            thumb={thumb} setThumb={setThumb}
            concurrency={concurrency} setConcurrency={setConcurrency}
            handleAddToQueue={handleAddToQueue}
            startAll={startAll}
            queue={queue}
          />
        </section>

        <QueueSection
          queue={queue}
          startItem={startItem}
          cancelItem={cancelItem}
          removeItem={removeItem}
          startAll={startAll}
          clearFinished={clearFinished}
        />
      </main>

      <HelpOverlay open={showHelp} onClose={() => setShowHelp(false)} />
      <QAPanel open={showQAPanel} onClose={() => setShowQAPanel(false)} tests={qaTests} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}