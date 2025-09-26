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

export interface Trim {
  start: number;
  end: number | null;
}

export interface Subtitles {
  enabled: boolean;
  lang: string;
  burnIn: boolean;
}

export interface ThumbnailOptions {
  enabled: boolean;
  size: string;
}

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

export interface QATest {
  name: string;
  ok: boolean;
  msg: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}