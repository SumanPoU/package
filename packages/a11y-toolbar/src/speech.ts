/**
 * Web Speech API helpers — SSR-safe no-ops when unsupported.
 * Leave `onBoundary` / active-element hooks for a future highlight-while-reading pass.
 */

export const SPEECH_RATE_MIN = 0.5;
export const SPEECH_RATE_MAX = 2;
export const SPEECH_RATE_STEP = 0.1;
export const SPEECH_RATE_DEFAULT = 1;

export const READ_ALOUD_SELECTOR =
  "p, h1, h2, h3, h4, h5, h6, li, blockquote, [data-a11y-readable]";

export type ReadSpeechOptions = {
  rate: number;
  lang?: string;
  /**
   * Reserved for v2 follow-along highlight (`utterance.onboundary`).
   * Wired through so ReadAloud does not need a rewrite to attach it.
   */
  onBoundary?: (event: SpeechSynthesisEvent) => void;
  onStart?: (event: SpeechSynthesisEvent) => void;
  onEnd?: (event: SpeechSynthesisEvent) => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
};

function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechSynthesisSupported(): boolean {
  return canSpeak();
}

/** Normalize panel locale codes to utterance BCP-47 tags engines recognize. */
export function normalizeSpeechLang(lang: string): string {
  const raw = lang.trim().replace(/_/g, "-");
  if (!raw) return "en-US";
  const lower = raw.toLowerCase();
  if (lower === "ne" || lower.startsWith("ne-")) return "ne-NP";
  if (lower === "en") return "en-US";
  if (lower === "hi") return "hi-IN";
  return raw;
}

function voiceLang(voice: SpeechSynthesisVoice): string {
  return voice.lang.replace(/_/g, "-").toLowerCase();
}

/**
 * Pick the best installed voice for `lang`.
 * For Nepali (`ne`), also accepts Hindi Devanagari voices as a last resort —
 * many OSes ship Hindi TTS but not Nepali.
 */
export function pickSpeechVoice(lang?: string): SpeechSynthesisVoice | null {
  if (!canSpeak() || !lang) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const normalized = normalizeSpeechLang(lang).toLowerCase();
  const prefix = normalized.split("-")[0] ?? normalized;

  const exact = voices.find((v) => voiceLang(v) === normalized);
  if (exact) return exact;

  const byPrefix = voices.find(
    (v) => voiceLang(v).startsWith(`${prefix}-`) || voiceLang(v) === prefix,
  );
  if (byPrefix) return byPrefix;

  // ponytail: Nepali TTS is rare; Hindi Devanagari is the common OS fallback.
  if (prefix === "ne") {
    const hindi = voices.find(
      (v) => voiceLang(v).startsWith("hi-") || voiceLang(v) === "hi",
    );
    if (hindi) return hindi;
  }

  return null;
}

/** True when a matching (or Nepali→Hindi fallback) voice is installed. */
export function hasSpeechVoiceForLang(lang?: string): boolean {
  return pickSpeechVoice(lang) != null;
}

/** Clamp to 0.5–2 in 0.1 steps (matches the panel range input). */
export function clampSpeechRate(
  value: unknown,
  fallback: number = SPEECH_RATE_DEFAULT,
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const stepped = Math.round(n / SPEECH_RATE_STEP) * SPEECH_RATE_STEP;
  const clamped = Math.min(SPEECH_RATE_MAX, Math.max(SPEECH_RATE_MIN, stepped));
  // Avoid 0.30000000004-style floats in storage / UI.
  return Math.round(clamped * 10) / 10;
}

export function stopReading(): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

export function pauseReading(): void {
  if (!canSpeak()) return;
  window.speechSynthesis.pause();
}

export function resumeReading(): void {
  if (!canSpeak()) return;
  window.speechSynthesis.resume();
}

export function readText(text: string, rate: number): void;
export function readText(text: string, options: ReadSpeechOptions): void;
export function readText(
  text: string,
  rateOrOptions: number | ReadSpeechOptions,
): void {
  if (!canSpeak()) return;
  const trimmed = text.trim();
  if (!trimmed) return;

  const options: ReadSpeechOptions =
    typeof rateOrOptions === "number" ? { rate: rateOrOptions } : rateOrOptions;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = clampSpeechRate(options.rate);
  if (options.lang) {
    utterance.lang = normalizeSpeechLang(options.lang);
    const voice = pickSpeechVoice(options.lang);
    if (voice) utterance.voice = voice;
  }
  if (options.onBoundary) utterance.onboundary = options.onBoundary;
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;
  window.speechSynthesis.speak(utterance);
}

export function readElement(root: HTMLElement, rate: number): void;
export function readElement(
  root: HTMLElement,
  options: ReadSpeechOptions,
): void;
export function readElement(
  root: HTMLElement,
  rateOrOptions: number | ReadSpeechOptions,
): void {
  readText(root.innerText ?? "", rateOrOptions as ReadSpeechOptions);
}
