import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * YouTube Downloader — UX-First Frontend (No backend required yet)
 * ... (omitted for brevity in thought process)
 */

// ----------------------------- Utilities ----------------------------- //
const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)[^\s]+/i;
const isYouTubeUrl = (s) => YT_REGEX.test(String(s).trim());
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const pad2 = (n) => String(n).padStart(2, "0");

function parseHMS(input) {
  if (!input) return 0;
  const parts = String(input).trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return 0;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatHMS(totalSeconds = 0) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

// Filename sanitization and preview utilities (refactored from tail patch)
function sanitizeFilename(name) {
  if (!name) return 'untitled';
  name = name.replace(/[\\/:*?"<>|\x00-\x1F]/g, ' ');
  name = name.replace(/\s+/g, ' ').trim().replace(/^\.+|\.+$/g, '');
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;
  if (reserved.test(name)) name = `_${name}`;
  if (name.length > 150) name = name.slice(0, 150).trim();
  return name;
}

function previewFilename(tpl, meta, fmt, opts = {}) {
  const tokens = {
    '{title}': meta?.title || 'title',
    '{channel}': meta?.channel || 'channel',
    '{res}': fmt?.res || '',
    '{fps}': String(fmt?.fps ?? ''),
    '{container}': (fmt?.container || 'mp4'),
  };
  let out = tpl || '{title} - {channel} ({res})';
  for (const [k, v] of Object.entries(tokens)) {
    out = out.replaceAll(k, v);
  }
  // remove empty constructs like `()`, `[]`, etc.
  out = out.replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, '');
  // clean up dangling separators and extra whitespace
  out = out.replace(/[\s-_.]+$/, ''); // remove trailing separators/spaces
  out = out.replace(/^[\s-_.]+/, ''); // remove leading separators/spaces
  out = out.replace(/\s+/g, ' ').trim(); // collapse whitespace and trim
  return opts.sanitize ? sanitizeFilename(out) : out;
}


// ----------------------------- UI Components ----------------------------- //

const Icon = {
  Paste: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M19 7h-4V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2m-6 0h-2V5h2z"/></svg>,
  Moon: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M12 2a9 9 0 0 0 0 18 8.8 8.8 0 0 0 6.32-2.68A7 7 0 0 1 12 4a7 7 0 0 1 0-2"/></svg>,
  Sun: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79L6.76 4.84M1 13h3v-2H1v2m10 10h2v-3h-2v3m9.83-2.37l-1.79-1.79-1.79 1.79 1.79 1.79 1.79-1.79M20 13h3v-2h-3v2M6.76 19.16L4.97 21l1.79 1.79 1.79-1.79-1.79-1.84M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0-7h2v3h-2V1z"/></svg>,
  Settings: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8m8.94 2.66-1.73-.29a6.94 6.94 0 0 0-.7-1.69l1.06-1.4-1.42-1.42-1.4 1.06c-.53-.3-1.1-.54-1.69-.7L14.66 3h-2.32l-.39 1.73c-.59.16-1.16.4-1.69.7L8.86 4.37 7.44 5.79l1.06 1.4c-.3.53-.54 1.1-.7 1.69L6.07 9.66v2.32l1.73.39c.16.59.4 1.16.7 1.69l-1.06 1.4 1.42 1.42 1.4-1.06c.53.3 1.1.54 1.69.7l.39 1.73h2.32l.39-1.73c.59-.16 1.16-.4 1.69-.7l1.4 1.06 1.42-1.42-1.06-1.4c.3-.53.54-1.1.7-1.69l1.73-.39z"/></svg>,
  Download: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M5 20h14v-2H5m7-16-5 5h3v6h4v-6h3z"/></svg>,
  Plus: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>,
  Trash: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M9 3v1H4v2h16V4h-5V3H9M6 21a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"/></svg>,
  Play: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M8 5v14l11-7z"/></svg>,
  Stop: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M6 6h12v12H6z"/></svg>,
  ChevronDown: (p) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>,
};

function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    violet: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  };
  return <span className={cx("rounded-full px-2 py-0.5 text-xs", colors[color])}>{children}</span>;
}

function Select({ label, value, onChange, options, small = false }) {
  return (
    <div className={small ? "" : "flex-1"}>
      {label && <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>}
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cx("w-full appearance-none rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-transparent pl-3 pr-8 py-2 focus:ring-2 focus:ring-blue-500/40", small ? "text-sm" : "")}>
          {options.map((opt) => <option key={opt.value} value={opt.value} className="dark:bg-slate-800">{opt.label}</option>)}
        </select>
        <Icon.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
      </div>
    </div>
  );
}

function TextField({ label, placeholder, value, onChange }) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500/40"/>
    </div>
  );
}

// ----------------------------- Mock Backend ----------------------------- //
function simulateAnalyze(url) {
  return new Promise((resolve, reject) => {
    const bad = !isYouTubeUrl(url);
    setTimeout(() => {
      if (bad) return reject(new Error("Not a valid YouTube URL"));
      const id = Math.random().toString(36).slice(2, 10);
      const duration = 742;
      const title = "Sample: I Shot the Sheriff (Live at RAH) — Orchestral";
      const channel = "Eric Clapton";
      const thumbnail = `https://i.ytimg.com/vi/2ZBtPf7FOoM/hqdefault.jpg`;
      const published = "2019-03-14";
      const isPlaylist = /[?&]list=/.test(url);
      const formats = [
        { id: "mp4-1080p-60", container: "mp4", kind: "video+audio", res: "1080p", fps: 60, abr: 160, vbr: 4500, sizeMB: 180, note: "Recommended" },
        { id: "mp4-720p-60", container: "mp4", kind: "video+audio", res: "720p", fps: 60, abr: 160, vbr: 2800, sizeMB: 120 },
        { id: "m4a-160", container: "m4a", kind: "audio-only", res: null, fps: null, abr: 160, vbr: null, sizeMB: 18 },
        { id: "mp4-4k-60", container: "mp4", kind: "video-only", res: "2160p", fps: 60, abr: 0, vbr: 14000, sizeMB: 850 },
      ];
      resolve({ id, url, title, channel, duration, thumbnail, published, isPlaylist, formats });
    }, 800);
  });
}

function simulateDownload(item, onProgress) {
  const total = 100;
  let current = 0;
  const speedKB = 512 + Math.random() * 2048;
  const interval = setInterval(() => {
    current = clamp(current + Math.random() * 12, 0, total);
    const eta = Math.max(1, Math.round((total - current) / 7));
    onProgress({ percent: current, speedKB, eta });
    if (current >= total) clearInterval(interval);
  }, 300);
  return () => clearInterval(interval);
}

// ----------------------------- Refactored Tail-Patch Components ----------------------------- //

const Kbd = ({ children }) => <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-md dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700">{children}</kbd>;

function HelpOverlay({ open, onClose }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-800/70 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Shortcuts & Tips</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Focus URL input</span><div><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></div></div>
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Add to queue</span><div><Kbd>Ctrl</Kbd> + <Kbd>D</Kbd></div></div>
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Toggle this help</span><div><Kbd>?</Kbd></div></div>
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Toggle QA tests</span><div><Kbd>Alt</Kbd> + <Kbd>T</Kbd></div></div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function QAPanel({ open, onClose }) {
  const tests = useMemo(() => {
    const cases = [];
    const add = (name, fn) => {
      try {
        fn();
        cases.push({ name, ok: true, msg: "" });
      } catch (e) {
        cases.push({ name, ok: false, msg: e.message });
      }
    };
    const eq = (a, b) => {
      const sa = JSON.stringify(a);
      const sb = JSON.stringify(b);
      if (sa !== sb) throw new Error(`Expected ${sb}, got ${sa}`);
    };

    // --- Test parseHMS ---
    add("parseHMS: empty/null", () => { eq(parseHMS(""), 0); eq(parseHMS(null), 0); });
    add("parseHMS: seconds only", () => eq(parseHMS("75"), 75));
    add("parseHMS: mm:ss", () => eq(parseHMS("01:15"), 75));
    add("parseHMS: hh:mm:ss", () => eq(parseHMS("1:01:01"), 3661));
    add("parseHMS: invalid char", () => eq(parseHMS("1x:02"), 0));
    add("parseHMS: negative parts", () => eq(parseHMS("-1:00"), 0));

    // --- Test formatHMS ---
    add("formatHMS: zero/null", () => { eq(formatHMS(0), "0:00"); eq(formatHMS(), "0:00"); });
    add("formatHMS: under 1 min", () => eq(formatHMS(59), "0:59"));
    add("formatHMS: over 1 min", () => eq(formatHMS(61), "1:01"));
    add("formatHMS: over 1 hour", () => eq(formatHMS(3661), "1:01:01"));
    add("formatHMS: large hour", () => eq(formatHMS(36610), "10:10:10"));

    // --- Test isYouTubeUrl ---
    add("isYouTubeUrl: standard", () => eq(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), true));
    add("isYouTubeUrl: shorts", () => eq(isYouTubeUrl("https://www.youtube.com/shorts/abc123"), true));
    add("isYouTubeUrl: youtu.be", () => eq(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ"), true));
    add("isYouTubeUrl: with playlist", () => eq(isYouTubeUrl("https://www.youtube.com/watch?v=...&list=..."), true));
    add("isYouTubeUrl: invalid", () => eq(isYouTubeUrl("https://example.com"), false));

    // --- Test sanitizeFilename ---
    add("sanitize: illegal chars", () => eq(sanitizeFilename('a/b:c*d"e<f>g|h?i\\j'), "a b c d e f g h i j"));
    add("sanitize: whitespace", () => eq(sanitizeFilename("  a  b  "), "a b"));
    add("sanitize: edge dots", () => eq(sanitizeFilename(".a."), "a"));
    add("sanitize: reserved names", () => eq(sanitizeFilename("CON.mp4"), "_CON.mp4"));
    add("sanitize: long name", () => eq(sanitizeFilename("a".repeat(200)).length, 150));

    // --- Test previewFilename ---
    const mockMeta = { title: "Title", channel: "Channel" };
    const mockFmt = { res: "1080p", fps: 60, container: "mp4" };
    add("preview: basic", () => eq(previewFilename("{title} - {channel}", mockMeta, mockFmt), "Title - Channel"));
    add("preview: with res", () => eq(previewFilename("{title} ({res})", mockMeta, mockFmt), "Title (1080p)"));
    add("preview: with sanitize", () => eq(previewFilename("{title}: illegal", { ...mockMeta, title: "Title:"}, mockFmt, { sanitize: true }), "Title illegal"));
    add("preview: empty parens", () => eq(previewFilename("{title} ({res})", mockMeta, { ...mockFmt, res: ""}), "Title"));
    add("preview: dangling separator", () => eq(previewFilename("{title} - {res}", mockMeta, { ...mockFmt, res: ""}), "Title"));

    return cases;
  }, []);

  if (!open) return null;
  return createPortal(
    <div className="fixed right-3 bottom-3 z-50 w-80 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-800/70 p-4 text-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">QA Tests</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
      </div>
      <ul>
        {tests.map(t => (
          <li key={t.name} className="flex items-center gap-2">
            <span className={t.ok ? "text-emerald-500" : "text-red-500"}>{t.ok ? "✓" : "✗"}</span>
            <span className="text-slate-600 dark:text-slate-300">{t.name}</span>
            {t.msg && <span className="text-slate-500 truncate" title={t.msg}>{t.msg}</span>}
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
}

const useToasts = (timeout = 3000) => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(current => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, timeout);
  }, [timeout]);
  return { toasts, addToast };
};

function ToastContainer({ toasts }) {
  const colors = {
    info: "border-blue-500/50",
    success: "border-emerald-500/50",
    error: "border-red-500/50",
  };
  return createPortal(
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
      {toasts.map(toast => (
        <div key={toast.id} className={cx(
          "px-4 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg border",
          colors[toast.type]
        )}>
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ----------------------------- Main Component ----------------------------- //
export default function YouTubeDownloaderUI() {
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
  const rootRef = useRef(null);

  const { toasts, addToast } = useToasts();
  const [showHelp, setShowHelp] = useState(false);
  const [showQAPanel, setShowQAPanel] = useState(false);
  const [filenamePreview, setFilenamePreview] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
    if (compact) root.classList.add("compact"); else root.classList.remove("compact");
  }, [dark, compact]);

  const handleAddToQueue = useCallback(() => {
    if (!analysis) return;
    const trimValid = validateTrim(analysis);
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

  function handleDrop(ev) {
    ev.preventDefault();
    const text = ev.dataTransfer.getData("text");
    if (text) text.split(/\s+/).forEach(addUrl);
  }

  function prevent(e) { e.preventDefault(); }

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

  const chosen = bestFormat;

  return (
    <div ref={rootRef} className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-amber-300 text-black px-3 py-1 rounded">Skip to content</a>

      <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur bg-white/70 dark:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">YT</div>
            <h1 className="font-semibold tracking-tight">YouTube Downloader</h1>
            <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-slate-200/70 dark:bg-slate-800/70">UI Preview</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-slate-300/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setCompact(v => !v)} aria-pressed={compact}><Icon.Settings /> <span className="hidden sm:inline">{compact ? "Comfort" : "Compact"}</span></button>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-slate-300/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setDark(v => !v)} aria-pressed={dark}>{dark ? <Icon.Sun/> : <Icon.Moon/>} <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span></button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <label htmlFor="yt-url-input" className="text-sm font-medium text-slate-600 dark:text-slate-300">YouTube URL</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input id="yt-url-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a video or playlist URL (Ctrl/Cmd+K to focus)" className={cx("w-full rounded-xl border bg-transparent px-4 py-3 outline-none transition", "border-slate-300/70 dark:border-slate-700/70 focus:ring-2 focus:ring-blue-500/50")} aria-invalid={!!error && !canAnalyze}/>
                {isPlaylist && <span className="absolute -bottom-5 left-2 text-xs text-blue-600 dark:text-blue-400">Playlist detected</span>}
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={async () => { try { setUrl(await navigator.clipboard.readText()); } catch { setError("Clipboard unavailable—paste manually"); } }}><Icon.Paste/> Paste</button>
                <button className={cx("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white", canAnalyze ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400 cursor-not-allowed")} disabled={!canAnalyze || analyzing} onClick={() => handleAnalyze(url)}>{analyzing ? "Analyzing…" : "Analyze"}</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-3">
                <button className="underline underline-offset-2 decoration-dotted hover:text-slate-900 dark:hover:text-slate-200" onClick={() => setUrl("https://www.youtube.com/watch?v=2ZBtPf7FOoM")}>Try demo URL</button>
                <span>•</span><span>Drag & drop URLs here</span><span>•</span><span>Press <Kbd>?</Kbd> for help</span>
              </div>
              <div className="flex items-center gap-2"><span className="opacity-70">Queued:</span><span className="font-medium">{queue.length}</span></div>
            </div>
            <div onDragOver={prevent} onDragEnter={prevent} onDrop={handleDrop} className="mt-2 rounded-xl border border-dashed border-slate-300/70 dark:border-slate-700/70 p-3" aria-label="Drop URLs here">
              {multi.length === 0 ? <div className="text-sm text-center text-slate-500 dark:text-slate-400">Drop multiple links to build a batch.</div> :
                <div className="flex flex-wrap gap-2">
                  {multi.map(u => <span key={u} className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs"><span className="truncate max-w-[18ch]" title={u}>{u}</span><button className="opacity-70 hover:opacity-100" onClick={() => setMulti(prev => prev.filter(x => x !== u))}>×</button></span>)}
                  <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1 text-xs hover:bg-blue-700" onClick={async () => { for (const u of multi) { try { await handleAnalyze(u); } catch {} } }}>Analyze All</button>
                </div>
              }
            </div>
            {error && <div role="alert" className="mt-2 rounded-xl border border-red-300/70 bg-red-50 text-red-800 dark:border-red-800/70 dark:bg-red-950/50 dark:text-red-200 px-3 py-2 text-sm">{error}</div>}
          </div>
        </section>

        <section className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm min-h-[160px]">
              {!analysis ? <div className="h-28 grid place-items-center text-slate-500 dark:text-slate-400">No video analyzed yet.</div> :
                <div className="flex flex-col sm:flex-row gap-4">
                  <img src={analysis.thumbnail} alt="Video thumbnail" className="aspect-video w-full sm:w-56 rounded-xl object-cover border border-slate-200/70 dark:border-slate-800/70"/>
                  <div className="flex-1 space-y-2 min-w-0">
                    <h2 className="text-lg font-semibold leading-tight truncate" title={analysis.title}>{analysis.title}</h2>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span>{analysis.channel}</span><span>•</span><span>{formatHMS(analysis.duration)}</span><span>•</span><span>{new Date(analysis.published).toLocaleDateString()}</span>
                      {analysis.isPlaylist && <Badge>Playlist</Badge>}
                    </div>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <Badge>Mode: {mode}</Badge><Badge>Format: {format}</Badge><Badge>Quality: {res}/{fps === "auto" ? "auto" : fps + "fps"}</Badge>
                      {enableTrim && <Badge color="amber">Trim: {start || "0:00"} → {end || formatHMS(analysis.duration)}</Badge>}
                      {subtitles.enabled && <Badge color="violet">Subs: {subtitles.lang}{subtitles.burnIn ? " (burn-in)" : " (soft)"}</Badge>}
                    </div>
                  </div>
                </div>
              }
            </div>
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Available formats</h3><div className="text-xs text-slate-500">{filteredFormats.length} match{filteredFormats.length !== 1 && "es"}</div></div>
              {!analysis ? <div className="h-24 grid place-items-center text-slate-500 dark:text-slate-400">Analyze a URL to see formats.</div> :
               !filteredFormats.length ? <div className="h-24 grid place-items-center text-slate-500 dark:text-slate-400">No formats match filters.</div> :
                <div className="mt-3 overflow-x-auto"><table className="w-full text-sm">
                  <thead className="text-left text-slate-600 dark:text-slate-300"><tr className="border-b border-slate-200/70 dark:border-slate-800/70"><th className="py-2 pr-3">Container</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Resolution</th><th className="py-2 pr-3">FPS</th><th className="py-2 pr-3">Audio</th><th className="py-2 pr-3">~Size</th><th className="py-2 pr-3">Note</th></tr></thead>
                  <tbody>{filteredFormats.map(f => <tr key={f.id} className={cx("border-b border-slate-100/60 dark:border-slate-800/50", chosen?.id === f.id && "bg-blue-50/60 dark:bg-blue-950/40")}><td className="py-2 pr-3 font-medium">{f.container}</td><td className="py-2 pr-3">{f.kind}</td><td className="py-2 pr-3">{f.res || "—"}</td><td className="py-2 pr-3">{f.fps || "—"}</td><td className="py-2 pr-3">{f.abr ? `${f.abr} kbps` : "—"}</td><td className="py-2 pr-3">{f.sizeMB ? `${f.sizeMB} MB` : "—"}</td><td className="py-2 pr-3 text-slate-500">{f.note || ""}</td></tr>)}</tbody>
                </table></div>
              }
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
              <h3 className="font-semibold mb-3">Download options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select label="Mode" value={mode} onChange={setMode} options={[{ value: "video+audio", label: "Video + Audio" }, { value: "video-only", label: "Video only" }, { value: "audio-only", label: "Audio only" }]}/>
                <Select label="Container" value={format} onChange={setFormat} options={[{ value: "auto", label: "Auto" }, { value: "mp4", label: "MP4" }, { value: "webm", label: "WebM" }, { value: "m4a", label: "M4A" }, { value: "mp3", label: "MP3" }, { value: "opus", label: "Opus" }]}/>
                <Select label="Resolution" value={res} onChange={setRes} options={[{ value: "auto", label: "Auto" }, { value: "2160p", label: "4K" }, { value: "1440p", label: "2K" }, { value: "1080p", label: "1080p" }, { value: "720p", label: "720p" }]}/>
                <Select label="Frame rate" value={fps} onChange={setFps} options={[{ value: "auto", label: "Auto" }, { value: "60", label: "60 fps" }, { value: "30", label: "30 fps" }]}/>
                {mode === "audio-only" && <Select label="Audio bitrate" value={String(abr)} onChange={v => setAbr(Number(v))} options={[{ value: "96", label: "96 kbps" }, { value: "128", label: "128 kbps" }, { value: "160", label: "160 kbps" }, { value: "192", label: "192 kbps" }]}/>}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Filename pattern</label>
                  <input value={filenameTpl} onChange={(e) => setFilenameTpl(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500/40" placeholder="{title} - {channel} ({res})"/>
                  <div className="mt-1 text-xs text-slate-500">Preview: <span className="font-mono bg-slate-100 dark:bg-slate-800/70 p-1 rounded">{filenamePreview}</span></div>
                  <div className="mt-1 flex items-center gap-2 text-xs"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={sanitize} onChange={e => setSanitize(e.target.checked)}/> Sanitize</label></div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Trim</h3><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={enableTrim} onChange={e => setEnableTrim(e.target.checked)}/> Enable</label></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end"><TextField label="Start" placeholder="mm:ss" value={start} onChange={setStart}/><TextField label="End" placeholder="end" value={end} onChange={setEnd}/></div>
              {!trimState.ok && <div className="mt-2 text-sm text-red-600 dark:text-red-400">{trimState.msg}</div>}
            </div>
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
              <h3 className="font-semibold mb-3">Extras</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-slate-600 dark:text-slate-300">Subtitles</legend>
                  <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={subtitles.enabled} onChange={e => setSubtitles({ ...subtitles, enabled: e.target.checked })}/> Include</label>
                  {subtitles.enabled && <div className="flex items-center gap-2">
                    <Select small value={subtitles.lang} onChange={v => setSubtitles({ ...subtitles, lang: v })} options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }]}/>
                    <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={subtitles.burnIn} onChange={e => setSubtitles({ ...subtitles, burnIn: e.target.checked })}/> Burn-in</label>
                  </div>}
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-slate-600 dark:text-slate-300">Thumbnail</legend>
                  <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={thumb.enabled} onChange={e => setThumb({ ...thumb, enabled: e.target.checked })}/> Save</label>
                  {thumb.enabled && <Select small value={thumb.size} onChange={v => setThumb({ ...thumb, size: v })} options={[{ value: "maxres", label: "Max" }, { value: "hq", label: "HQ" }]}/>}
                </fieldset>
                <fieldset className="space-y-2 sm:col-span-2">
                  <legend className="text-sm font-medium text-slate-600 dark:text-slate-300">Queue</legend>
                  <div className="flex items-center gap-3"><label className="text-sm">Concurrency: {concurrency}</label><input type="range" min={1} max={4} value={concurrency} onChange={e => setConcurrency(Number(e.target.value))} className="accent-blue-600 w-24"/></div>
                </fieldset>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button className={cx("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white", analysis ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400 cursor-not-allowed")} onClick={handleAddToQueue} disabled={!analysis}><Icon.Plus/> Add to queue</button>
                <button className={cx("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white", queue.length ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400 cursor-not-allowed")} onClick={startAll} disabled={!queue.length}><Icon.Download/> Download All</button>
                <div aria-live="polite" className="text-xs text-slate-500">{queue.filter(q => q.status === 'downloading').length} active</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Queue</h3>
            <div className="flex items-center gap-2">
              <button onClick={startAll} className="inline-flex items-center gap-2 text-sm rounded-xl bg-blue-600 text-white px-3 py-2 hover:bg-blue-700"><Icon.Play/> Start all</button>
              <button onClick={clearFinished} className="inline-flex items-center gap-2 text-sm rounded-xl border border-slate-300/70 dark:border-slate-700/70 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"><Icon.Trash/> Clear finished</button>
            </div>
          </div>
          {queue.length === 0 ? <div className="h-24 grid place-items-center text-slate-500 dark:text-slate-400">No items yet.</div> :
            <ul className="space-y-3">
              {queue.map(q => (
                <li key={q.id} className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/60 p-3">
                  <div className="flex items-center gap-3">
                    <img src={q.meta.thumbnail} alt="thumb" className="size-14 rounded-lg object-cover border border-slate-200/70 dark:border-slate-800/70"/>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate" title={q.meta.title}>{q.meta.title}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{q.meta.channel} • {q.opts.container.toUpperCase()} {q.opts.res}</div>
                      <div className="mt-2 h-2 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${q.progress || 0}%` }} />
                        <span className={cx("absolute inset-0 text-center text-[10px] font-bold", q.progress > 50 ? 'text-white' : 'text-blue-800')}>{q.progress?.toFixed(0)}%</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {q.status === "downloading" && <span>~{Math.round(q.speedKB || 0)} KB/s • ETA {q.eta || "—"}s</span>}
                        {q.status === "finished" && <span className="text-emerald-500">Completed</span>}
                        {q.status === "canceled" && <span className="text-red-500">Canceled</span>}
                        {q.status === "queued" && <span>Waiting…</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cx("text-xs rounded-full px-2 py-0.5", q.status === "queued" && "bg-slate-200 text-slate-700", q.status === "downloading" && "bg-blue-600 text-white", q.status === "finished" && "bg-emerald-600 text-white", q.status === "canceled" && "bg-red-600 text-white")}>{q.status}</span>
                      {q.status === "queued" && <button onClick={() => startItem(q.id)} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" aria-label="Start"><Icon.Play/></button>}
                      {q.status === "downloading" && <button onClick={() => cancelItem(q.id)} className="p-2 rounded-lg border border-slate-300/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Cancel"><Icon.Stop/></button>}
                      <button onClick={() => removeItem(q.id)} className="p-2 rounded-lg border border-slate-300/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Remove"><Icon.Trash/></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          }
        </section>
      </main>

      <HelpOverlay open={showHelp} onClose={() => setShowHelp(false)} />
      <QAPanel open={showQAPanel} onClose={() => setShowQAPanel(false)} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}