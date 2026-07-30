"use client";

import { useEffect, useRef, useState } from "react";
import {
  pauseReading,
  READ_ALOUD_SELECTOR,
  type ReadSpeechOptions,
  readElement,
  resumeReading,
  SPEECH_RATE_MAX,
  SPEECH_RATE_MIN,
  SPEECH_RATE_STEP,
  stopReading,
} from "./speech";
import { A11Y_CONTENT_ATTR } from "./types";

export type ReadAloudLabels = {
  pause: string;
  resume: string;
  stop: string;
  rate: string;
  unsupported: string;
};

type ReadAloudListenerProps = {
  active: boolean;
  rate: number;
  /** Panel / content language hint for SpeechSynthesisUtterance.lang */
  lang?: string;
};

/**
 * Click-to-speak under `[data-a11y-content]` only (not a document-wide listener).
 * Cleanup always calls `stopReading()`.
 *
 * Structure leaves room for v2: `onBoundary` + `activeTargetRef` for highlight.
 */
export function ReadAloudListener({
  active,
  rate,
  lang,
}: ReadAloudListenerProps) {
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const langRef = useRef(lang);
  langRef.current = lang;
  /** Current block being spoken — reserved for v2 follow-along highlight. */
  const activeTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      stopReading();
      activeTargetRef.current = null;
      return;
    }

    const root = document.querySelector<HTMLElement>(`[${A11Y_CONTENT_ATTR}]`);
    if (!root) return;

    const clearActive = () => {
      const prev = activeTargetRef.current;
      if (prev) {
        prev.removeAttribute("data-a11y-reading");
        activeTargetRef.current = null;
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const block = target.closest(READ_ALOUD_SELECTOR);
      if (!(block instanceof HTMLElement) || !root.contains(block)) return;

      event.preventDefault();

      clearActive();
      activeTargetRef.current = block;
      // Hook for v2 CSS / highlight — no visual style in v1 beyond this marker.
      block.setAttribute("data-a11y-reading", "1");

      const options: ReadSpeechOptions = {
        rate: rateRef.current,
        lang: langRef.current,
        // Reserved: attach utterance.onboundary here for word/sentence highlight.
        onBoundary: undefined,
        onEnd: () => clearActive(),
        onError: () => clearActive(),
      };
      readElement(block, options);
    };

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      clearActive();
      stopReading();
    };
  }, [active]);

  return null;
}

type ReadAloudControlsProps = {
  rate: number;
  onRateChange: (rate: number) => void;
  labels: ReadAloudLabels;
  supported: boolean;
};

/** Play/pause/stop + rate slider shown in the panel while Read Aloud is on. */
export function ReadAloudControls({
  rate,
  onRateChange,
  labels,
  supported,
}: ReadAloudControlsProps) {
  const [paused, setPaused] = useState(false);

  if (!supported) {
    return (
      <div
        className="itzsa-a11y-read-aloud"
        role="group"
        aria-label={labels.rate}
      >
        <p className="itzsa-a11y-read-aloud-note">{labels.unsupported}</p>
      </div>
    );
  }

  return (
    <div
      className="itzsa-a11y-read-aloud"
      role="group"
      aria-label={labels.rate}
    >
      <div className="itzsa-a11y-read-aloud-actions">
        <button
          type="button"
          className="itzsa-a11y-read-aloud-btn"
          onClick={() => {
            if (paused) {
              resumeReading();
              setPaused(false);
            } else {
              pauseReading();
              setPaused(true);
            }
          }}
        >
          {paused ? labels.resume : labels.pause}
        </button>
        <button
          type="button"
          className="itzsa-a11y-read-aloud-btn"
          onClick={() => {
            stopReading();
            setPaused(false);
          }}
        >
          {labels.stop}
        </button>
      </div>
      <label className="itzsa-a11y-read-aloud-rate">
        <span>
          {labels.rate} ({rate.toFixed(1)}×)
        </span>
        <input
          type="range"
          min={SPEECH_RATE_MIN}
          max={SPEECH_RATE_MAX}
          step={SPEECH_RATE_STEP}
          value={rate}
          onChange={(event) => {
            onRateChange(Number(event.target.value));
          }}
        />
      </label>
    </div>
  );
}
