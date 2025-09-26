import React from 'react';
import { Icon, cx } from './UI';
import { useApp } from '../context/AppContext';

/**
 * A component section that displays the list of items in the download queue.
 * It provides controls for starting, canceling, and removing items, as well as managing the overall queue.
 */
export const QueueSection: React.FC = () => {
  const {
    queue,
    startItem,
    cancelItem,
    removeItem,
    startAll,
    clearFinished,
  } = useApp();

  return (
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
  );
}