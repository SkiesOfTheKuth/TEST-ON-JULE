import { parseHMS, isYouTubeUrl, sanitizeFilename, previewFilename, formatHMS } from './index';

export function runQATests() {
  const cases = [];
  const add = (name, fn) => {
    try {
      fn();
      cases.push({ name, ok: true, msg: "" });
    } catch (e) {
      cases.push({ name, ok: false, msg: e.message });
    }
  };
  const eq = (a, b) => {
    const sa = JSON.stringify(a);
    const sb = JSON.stringify(b);
    if (sa !== sb) throw new Error(`Expected ${sb}, got ${sa}`);
  };

  // --- Test parseHMS ---
  add("parseHMS: empty/null", () => { eq(parseHMS(""), 0); eq(parseHMS(null), 0); });
  add("parseHMS: seconds only", () => eq(parseHMS("75"), 75));
  add("parseHMS: mm:ss", () => eq(parseHMS("01:15"), 75));
  add("parseHMS: hh:mm:ss", () => eq(parseHMS("1:01:01"), 3661));
  add("parseHMS: invalid char", () => eq(parseHMS("1x:02"), 0));
  add("parseHMS: negative parts", () => eq(parseHMS("-1:00"), 0));

  // --- Test formatHMS ---
  add("formatHMS: zero/null", () => { eq(formatHMS(0), "0:00"); eq(formatHMS(), "0:00"); });
  add("formatHMS: under 1 min", () => eq(formatHMS(59), "0:59"));
  add("formatHMS: over 1 min", () => eq(formatHMS(61), "1:01"));
  add("formatHMS: over 1 hour", () => eq(formatHMS(3661), "1:01:01"));
  add("formatHMS: large hour", () => eq(formatHMS(36610), "10:10:10"));

  // --- Test isYouTubeUrl ---
  add("isYouTubeUrl: standard", () => eq(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), true));
  add("isYouTubeUrl: shorts", () => eq(isYouTubeUrl("https://www.youtube.com/shorts/abc123"), true));
  add("isYouTubeUrl: youtu.be", () => eq(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ"), true));
  add("isYouTubeUrl: with playlist", () => eq(isYouTubeUrl("https://www.youtube.com/watch?v=...&list=..."), true));
  add("isYouTubeUrl: invalid", () => eq(isYouTubeUrl("https://example.com"), false));

  // --- Test sanitizeFilename ---
  add("sanitize: illegal chars", () => eq(sanitizeFilename('a/b:c*d"e<f>g|h?i\\j'), "a b c d e f g h i j"));
  add("sanitize: whitespace", () => eq(sanitizeFilename("  a  b  "), "a b"));
  add("sanitize: edge dots", () => eq(sanitizeFilename(".a."), "a"));
  add("sanitize: reserved names", () => eq(sanitizeFilename("CON.mp4"), "_CON.mp4"));
  add("sanitize: long name", () => eq(sanitizeFilename("a".repeat(200)).length, 150));

  // --- Test previewFilename ---
  const mockMeta = { title: "Title", channel: "Channel" };
  const mockFmt = { res: "1080p", fps: 60, container: "mp4" };
  add("preview: basic", () => eq(previewFilename("{title} - {channel}", mockMeta, mockFmt), "Title - Channel"));
  add("preview: with res", () => eq(previewFilename("{title} ({res})", mockMeta, mockFmt), "Title (1080p)"));
  add("preview: with sanitize", () => eq(previewFilename("{title}: illegal", { ...mockMeta, title: "Title:"}, mockFmt, { sanitize: true }), "Title illegal"));
  add("preview: empty parens", () => eq(previewFilename("{title} ({res})", mockMeta, { ...mockFmt, res: ""}), "Title"));
  add("preview: dangling separator", () => eq(previewFilename("{title} - {res}", mockMeta, { ...mockFmt, res: ""}), "Title"));

  return cases;
}