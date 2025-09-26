import React from 'react';
import { Icon } from './UI';
import { useApp } from '../context/AppContext';

export function Header() {
  const { dark, setDark, compact, setCompact } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur bg-white/70 dark:bg-slate-950/70">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">YT</div>
          <h1 className="font-semibold tracking-tight">YouTube Downloader</h1>
          <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-slate-200/70 dark:bg-slate-800/70">UI Preview</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-slate-300/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setCompact(v => !v)} aria-pressed={compact}>
            <Icon.Settings /> <span className="hidden sm:inline">{compact ? "Comfort" : "Compact"}</span>
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-slate-300/70 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setDark(v => !v)} aria-pressed={dark}>
            {dark ? <Icon.Sun/> : <Icon.Moon/>} <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}