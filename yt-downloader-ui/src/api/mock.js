import { isYouTubeUrl, clamp } from '../utils';

export function simulateAnalyze(url) {
  return new Promise((resolve, reject) => {
    const bad = !isYouTubeUrl(url);
    setTimeout(() => {
      if (bad) return reject(new Error("Not a valid YouTube URL"));
      const id = Math.random().toString(36).slice(2, 10);
      const duration = 742;
      const title = "Sample: I Shot the Sheriff (Live at RAH) — Orchestral";
      const channel = "Eric Clapton";
      const thumbnail = `https://i.ytimg.com/vi/2ZBtPf7FOoM/hqdefault.jpg`;
      const published = "2019-03-14";
      const isPlaylist = /[?&]list=/.test(url);
      const formats = [
        { id: "mp4-1080p-60", container: "mp4", kind: "video+audio", res: "1080p", fps: 60, abr: 160, vbr: 4500, sizeMB: 180, note: "Recommended" },
        { id: "mp4-720p-60", container: "mp4", kind: "video+audio", res: "720p", fps: 60, abr: 160, vbr: 2800, sizeMB: 120 },
        { id: "m4a-160", container: "m4a", kind: "audio-only", res: null, fps: null, abr: 160, vbr: null, sizeMB: 18 },
        { id: "mp4-4k-60", container: "mp4", kind: "video-only", res: "2160p", fps: 60, abr: 0, vbr: 14000, sizeMB: 850 },
      ];
      resolve({ id, url, title, channel, duration, thumbnail, published, isPlaylist, formats });
    }, 800);
  });
}

export function simulateDownload(item, onProgress) {
  const total = 100;
  let current = 0;
  const speedKB = 512 + Math.random() * 2048;
  const interval = setInterval(() => {
    current = clamp(current + Math.random() * 12, 0, total);
    const eta = Math.max(1, Math.round((total - current) / 7));
    onProgress({ percent: current, speedKB, eta });
    if (current >= total) clearInterval(interval);
  }, 300);
  return () => clearInterval(interval);
}