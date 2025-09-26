import type { Analysis, Format } from '../types';

/**
 * Regular expression for validating YouTube video and playlist URLs.
 */
export const YT_REGEX: RegExp = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)[^\s]+/i;

/**
 * Checks if a given string is a valid YouTube URL.
 * @param s The string to test.
 * @returns True if the string is a valid YouTube URL, false otherwise.
 */
export const isYouTubeUrl = (s: string | null | undefined): boolean => YT_REGEX.test(String(s).trim());

/**
 * Clamps a number between a minimum and maximum value.
 * @param n The number to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped number.
 */
export const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));

/**
 * Pads a number with a leading zero if it is less than 10.
 * @param n The number to pad.
 * @returns The zero-padded string.
 */
export const pad2 = (n: number): string => String(n).padStart(2, "0");

/**
 * Parses a time string in `mm:ss` or `hh:mm:ss` format into total seconds.
 * @param input The time string to parse.
 * @returns The total number of seconds.
 */
export function parseHMS(input: string | null | undefined): number {
  if (!input) return 0;
  const parts = String(input).trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return 0;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/**
 * Formats a total number of seconds into a `mm:ss` or `hh:mm:ss` time string.
 * @param totalSeconds The total seconds to format.
 * @returns The formatted time string.
 */
export function formatHMS(totalSeconds: number = 0): string {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
}

/**
 * Sanitizes a string to be used as a valid filename.
 * @param name The filename to sanitize.
 * @returns The sanitized filename.
 */
export function sanitizeFilename(name: string): string {
  if (!name) return 'untitled';
  // Strip illegal characters
  name = name.replace(/[\\/:*?"<>|\x00-\x1F]/g, ' ');
  // Collapse whitespace and trim dots from edges
  name = name.replace(/\s+/g, ' ').trim().replace(/^\.+|\.+$/g, '');
  // Prevent reserved names on Windows
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;
  if (reserved.test(name)) name = `_${name}`;
  // Enforce a reasonable length
  if (name.length > 150) name = name.slice(0, 150).trim();
  return name;
}

interface PreviewOptions {
  sanitize?: boolean;
}

/**
 * Generates a filename preview based on a template and video metadata.
 * @param tpl The filename template string.
 * @param meta The video analysis object.
 * @param fmt The chosen format object.
 * @param opts Additional options, e.g., whether to sanitize the filename.
 * @returns The generated filename preview.
 */
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
  // Clean up empty placeholders and dangling separators
  out = out.replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, '');
  out = out.replace(/[\s-_.]+$/, '');
  out = out.replace(/^[\s-_.]+/, '');
  out = out.replace(/\s+/g, ' ').trim();
  return opts.sanitize ? sanitizeFilename(out) : out;
}