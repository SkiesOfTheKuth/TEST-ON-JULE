import type { Analysis, Format } from '../types';

export const YT_REGEX: RegExp = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)[^\s]+/i;
export const isYouTubeUrl = (s: string | null | undefined): boolean => YT_REGEX.test(String(s).trim());
export const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));
export const pad2 = (n: number): string => String(n).padStart(2, "0");

export function parseHMS(input: string | null | undefined): number {
  if (!input) return 0;
  const parts = String(input).trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return 0;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export function formatHMS(totalSeconds: number = 0): string {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
}

export function sanitizeFilename(name: string): string {
  if (!name) return 'untitled';
  name = name.replace(/[\\/:*?"<>|\x00-\x1F]/g, ' ');
  name = name.replace(/\s+/g, ' ').trim().replace(/^\.+|\.+$/g, '');
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;
  if (reserved.test(name)) name = `_${name}`;
  if (name.length > 150) name = name.slice(0, 150).trim();
  return name;
}

interface PreviewOptions {
  sanitize?: boolean;
}

export function previewFilename(tpl: string, meta: Analysis | null, fmt: Format | null, opts: PreviewOptions = {}): string {
  const tokens: Record<string, string> = {
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