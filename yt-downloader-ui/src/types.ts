/**
 * Represents a single available download format for a video.
 */
export interface Format {
  id: string;
  container: string;
  kind: 'video+audio' | 'video-only' | 'audio-only';
  res: string | null;
  fps: number | null;
  abr: number | null;
  vbr: number | null;
  sizeMB: number;
  note?: string;
}

/**
 * Represents the result of a video URL analysis, containing its metadata and available formats.
 */
export interface Analysis {
  id: string;
  url: string;
  title: string;
  channel: string;
  duration: number;
  thumbnail: string;
  published: string;
  isPlaylist: boolean;
  formats: Format[];
}

/**
 * Represents the start and end times for a video trim.
 */
export interface Trim {
  start: number;
  end: number | null;
}

/**
 * Represents the user's subtitle preferences.
 */
export interface Subtitles {
  enabled: boolean;
  lang: string;
  burnIn: boolean;
}

/**
 * Represents the user's thumbnail download preferences.
 */
export interface ThumbnailOptions {
  enabled: boolean;
  size: string;
}

/**
 * Represents the complete set of user-selected options for a download.
 */
export interface DownloadOptions {
  mode: 'video+audio' | 'video-only' | 'audio-only';
  container: string;
  res: string | null;
  fps: number | null;
  abr: number | null;
  trim: Trim | null;
  subtitles: Subtitles;
  thumbnail: ThumbnailOptions;
  filenameTpl: string;
  sanitize: boolean;
}

/**
 * Represents a single item in the download queue.
 */
export interface QueueItem {
  id: string;
  meta: Analysis;
  opts: DownloadOptions;
  status: 'queued' | 'downloading' | 'finished' | 'canceled';
  progress: number;
  eta: number | null;
  speedKB: number | null;
  cancel: (() => void) | null;
}

/**
 * Represents the result of a single internal QA test case.
 */
export interface QATest {
  name: string;
  ok: boolean;
  msg: string;
}

/**
 * Represents a single toast notification.
 */
export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

/**
 * Defines the complete shape of the application's global state, provided by the AppContext.
 */
export interface AppContextType {
  dark: boolean; setDark: React.Dispatch<React.SetStateAction<boolean>>;
  compact: boolean; setCompact: React.Dispatch<React.SetStateAction<boolean>>;
  url: string; setUrl: React.Dispatch<React.SetStateAction<string>>;
  multi: string[]; setMulti: React.Dispatch<React.SetStateAction<string[]>>;
  analyzing: boolean;
  analysis: Analysis | null;
  error: string; setError: React.Dispatch<React.SetStateAction<string>>;
  mode: 'video+audio' | 'video-only' | 'audio-only'; setMode: React.Dispatch<React.SetStateAction<'video+audio' | 'video-only' | 'audio-only'>>;
  format: string; setFormat: React.Dispatch<React.SetStateAction<string>>;
  res: string; setRes: React.Dispatch<React.SetStateAction<string>>;
  fps: string; setFps: React.Dispatch<React.SetStateAction<string>>;
  abr: number; setAbr: React.Dispatch<React.SetStateAction<number>>;
  start: string; setStart: React.Dispatch<React.SetStateAction<string>>;
  end: string; setEnd: React.Dispatch<React.SetStateAction<string>>;
  enableTrim: boolean; setEnableTrim: React.Dispatch<React.SetStateAction<boolean>>;
  subtitles: Subtitles; setSubtitles: React.Dispatch<React.SetStateAction<Subtitles>>;
  thumb: ThumbnailOptions; setThumb: React.Dispatch<React.SetStateAction<ThumbnailOptions>>;
  filenameTpl: string; setFilenameTpl: React.Dispatch<React.SetStateAction<string>>;
  sanitize: boolean; setSanitize: React.Dispatch<React.SetStateAction<boolean>>;
  concurrency: number; setConcurrency: React.Dispatch<React.SetStateAction<number>>;
  queue: QueueItem[];
  toasts: Toast[];
  showHelp: boolean; setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
  showQAPanel: boolean; setShowQAPanel: React.Dispatch<React.SetStateAction<boolean>>;
  filenamePreview: string;
  isPlaylist: boolean;
  canAnalyze: boolean;
  filteredFormats: Format[];
  bestFormat: Format | null;
  trimState: { ok: boolean; msg?: string };
  addUrl: (u: string) => void;
  handleAnalyze: (u?: string) => Promise<void>;
  handleAddToQueue: () => void;
  startItem: (id: string) => void;
  cancelItem: (id: string) => void;
  removeItem: (id: string) => void;
  startAll: () => void;
  clearFinished: () => void;
  qaTests: QATest[];
}