export const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)[^\s]+/i;
export const isYouTubeUrl = (s) => YT_REGEX.test(String(s).trim());
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const pad2 = (n) => String(n).padStart(2, "0");

export function parseHMS(input) {
  if (!input) return 0;
  const parts = String(input).trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return 0;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export function formatHMS(totalSeconds = 0) {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
}

export function sanitizeFilename(name) {
  if (!name) return 'untitled';
  name = name.replace(/[\\/:*?"<>|\x00-\x1F]/g, ' ');
  name = name.replace(/\s+/g, ' ').trim().replace(/^\.+|\.+$/g, '');
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;
  if (reserved.test(name)) name = `_${name}`;
  if (name.length > 150) name = name.slice(0, 150).trim();
  return name;
}

export function previewFilename(tpl, meta, fmt, opts = {}) {
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
  out = out.replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, '');
  out = out.replace(/[\s-_.]+$/, '');
  out = out.replace(/^[\s-_.]+/, '');
  out = out.replace(/\s+/g, ' ').trim();
  return opts.sanitize ? sanitizeFilename(out) : out;
}