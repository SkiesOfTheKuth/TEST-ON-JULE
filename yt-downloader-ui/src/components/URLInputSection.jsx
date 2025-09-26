import React from 'react';
import { Icon, Kbd, cx } from './UI';
import { useApp } from '../context/AppContext';

function prevent(e) { e.preventDefault(); }

export function URLInputSection() {
  const {
    url, setUrl,
    multi, setMulti,
    error, setError,
    isPlaylist,
    canAnalyze,
    analyzing,
    handleAnalyze,
    addUrl,
    queue,
  } = useApp();

  function handleDrop(ev) {
    ev.preventDefault();
    const text = ev.dataTransfer.getData("text");
    if (text) text.split(/\s+/).forEach(addUrl);
  }

  return (
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
  );
}