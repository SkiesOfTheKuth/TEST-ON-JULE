import React from 'react';
import { Badge, cx } from './UI';

function formatHMS(totalSeconds = 0) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

function VideoPreview({ analysis, mode, format, res, fps, enableTrim, start, end, subtitles }) {
  if (!analysis) {
    return (
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm min-h-[160px]">
        <div className="h-28 grid place-items-center text-slate-500 dark:text-slate-400">No video analyzed yet.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm min-h-[160px]">
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
    </div>
  );
}

function FormatList({ analysis, filteredFormats, chosenFormat }) {
    return (
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Available formats</h3>
                <div className="text-xs text-slate-500">{filteredFormats.length} match{filteredFormats.length !== 1 && "es"}</div>
            </div>
            {!analysis ? <div className="h-24 grid place-items-center text-slate-500 dark:text-slate-400">Analyze a URL to see formats.</div> :
             !filteredFormats.length ? <div className="h-24 grid place-items-center text-slate-500 dark:text-slate-400">No formats match filters.</div> :
              <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                      <thead className="text-left text-slate-600 dark:text-slate-300">
                          <tr className="border-b border-slate-200/70 dark:border-slate-800/70">
                              <th className="py-2 pr-3">Container</th>
                              <th className="py-2 pr-3">Type</th>
                              <th className="py-2 pr-3">Resolution</th>
                              <th className="py-2 pr-3">FPS</th>
                              <th className="py-2 pr-3">Audio</th>
                              <th className="py-2 pr-3">~Size</th>
                              <th className="py-2 pr-3">Note</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredFormats.map(f => (
                              <tr key={f.id} className={cx("border-b border-slate-100/60 dark:border-slate-800/50", chosenFormat?.id === f.id && "bg-blue-50/60 dark:bg-blue-950/40")}>
                                  <td className="py-2 pr-3 font-medium">{f.container}</td>
                                  <td className="py-2 pr-3">{f.kind}</td>
                                  <td className="py-2 pr-3">{f.res || "—"}</td>
                                  <td className="py-2 pr-3">{f.fps || "—"}</td>
                                  <td className="py-2 pr-3">{f.abr ? `${f.abr} kbps` : "—"}</td>
                                  <td className="py-2 pr-3">{f.sizeMB ? `${f.sizeMB} MB` : "—"}</td>
                                  <td className="py-2 pr-3 text-slate-500">{f.note || ""}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            }
        </div>
    );
}


export function AnalysisSection({ analysis, filteredFormats, chosenFormat, ...previewProps }) {
  return (
    <div className="lg:col-span-7 space-y-4">
      <VideoPreview analysis={analysis} {...previewProps} />
      <FormatList analysis={analysis} filteredFormats={filteredFormats} chosenFormat={chosenFormat} />
    </div>
  );
}