import React from 'react';
import { Icon, Select, TextField } from './UI';

export function OptionsSection({
  analysis,
  mode, setMode,
  format, setFormat,
  res, setRes,
  fps, setFps,
  abr, setAbr,
  filenameTpl, setFilenameTpl,
  filenamePreview,
  sanitize, setSanitize,
  enableTrim, setEnableTrim,
  start, setStart,
  end, setEnd,
  trimState,
  subtitles, setSubtitles,
  thumb, setThumb,
  concurrency, setConcurrency,
  handleAddToQueue,
  startAll,
  queue,
}) {
  return (
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
          <button className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white ${analysis ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400 cursor-not-allowed"}`} onClick={handleAddToQueue} disabled={!analysis}><Icon.Plus/> Add to queue</button>
          <button className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white ${queue.length ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400 cursor-not-allowed"}`} onClick={startAll} disabled={!queue.length}><Icon.Download/> Download All</button>
          <div aria-live="polite" className="text-xs text-slate-500">{queue.filter(q => q.status === 'downloading').length} active</div>
        </div>
      </div>
    </div>
  );
}