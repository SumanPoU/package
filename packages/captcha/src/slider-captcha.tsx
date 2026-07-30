"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  classifyVerifyFailure,
  createCaptchaError,
  withTimeout,
} from "./errors";
import { createChallengeId } from "./generate";
import { cn } from "./lib/utils";
import type { CaptchaError, CaptchaStatus } from "./types";

export type SliderCaptchaMessages = {
  label?: string;
  idleHint?: string;
  dragHint?: string;
  validHint?: string;
  invalidHint?: string;
  loadingHint?: string;
  errorHint?: string;
  lockedHint?: string;
  refreshLabel?: string;
  targetHint?: string;
};

export type SliderCaptchaHandle = {
  refresh: () => void;
  reset: () => void;
  getValue: () => number;
  getChallengeId: () => string;
  validate: () => boolean;
  getStatus: () => CaptchaStatus;
  getAttempts: () => number;
  unlock: (opts?: { refresh?: boolean }) => void;
};

export type SliderCaptchaProps = {
  /**
   * Inclusive low end of the success zone (0–100).
   * Release at or above this value to pass (snaps to 100).
   * @default 90
   */
  targetMin?: number;
  /**
   * Inclusive high end of the success zone.
   * @default 100
   */
  targetMax?: number;

  verify?: (payload: {
    value: number;
    challengeId: string;
    targetMin: number;
    targetMax: number;
  }) => boolean | Promise<boolean>;
  verifyTimeoutMs?: number;
  maxAttempts?: number;
  autoRefreshOnInvalid?: boolean;
  autoRefreshOnError?: boolean;
  error?: string | null;
  loading?: boolean;

  onVerified?: (valid: boolean) => void;
  onChange?: (value: number) => void;
  onStatusChange?: (status: CaptchaStatus) => void;
  onRefresh?: () => void;
  onError?: (error: CaptchaError) => void;
  onAttemptsChange?: (attempts: number) => void;
  onLock?: (error: CaptchaError) => void;

  label?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;

  showRefresh?: boolean;
  showCounter?: boolean;
  showStatus?: boolean;
  showLabel?: boolean;
  messages?: SliderCaptchaMessages;

  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
  refreshClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
};

const DEFAULT_MESSAGES = {
  label: "Security check",
  idleHint: "Drag the piece to the end, then release.",
  dragHint: "→ drag the piece",
  validHint: "Verified",
  invalidHint: "Not far enough — try again",
  loadingHint: "Verifying…",
  errorHint: "Verification failed — please try again",
  lockedHint: "Too many attempts — refresh to try again",
  refreshLabel: "Reset slider",
  targetHint: "Release in the {min}–{max}% zone to pass.",
} as const;

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const SliderCaptcha = forwardRef<
  SliderCaptchaHandle,
  SliderCaptchaProps
>(function SliderCaptcha(
  {
    targetMin: targetMinProp = 90,
    targetMax: targetMaxProp = 100,
    verify,
    verifyTimeoutMs = 15_000,
    maxAttempts = 5,
    autoRefreshOnInvalid = false,
    autoRefreshOnError = false,
    error: errorProp,
    loading: loadingProp,
    onVerified,
    onChange,
    onStatusChange,
    onRefresh,
    onError,
    onAttemptsChange,
    onLock,
    label: labelProp,
    required = false,
    disabled = false,
    id: idProp,
    name,
    showRefresh = true,
    showCounter = false,
    showStatus = true,
    showLabel = true,
    messages: messagesProp,
    className,
    trackClassName,
    thumbClassName,
    refreshClassName,
    labelClassName,
    errorClassName,
  },
  ref,
) {
  const reactId = useId();
  const inputId = idProp ?? `itzsa-slider-captcha-${reactId}`;
  const statusId = `${inputId}-status`;
  const errorId = `${inputId}-error`;

  const targetMin = clampPercent(Math.min(targetMinProp, targetMaxProp));
  const targetMax = clampPercent(Math.max(targetMinProp, targetMaxProp));

  const challengeIdRef = useRef(createChallengeId());
  const abortRef = useRef<AbortController | null>(null);
  const verifyGenRef = useRef(0);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [value, setValue] = useState(0);
  const [status, setStatus] = useState<CaptchaStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const [verifiedLatch, setVerifiedLatch] = useState(false);
  const [snapping, setSnapping] = useState(false);

  const messages = { ...DEFAULT_MESSAGES, ...messagesProp };
  const label = labelProp ?? messages.label;

  const setSlider = useCallback(
    (next: number) => {
      const clamped = clampPercent(next);
      setValue(clamped);
      onChange?.(clamped);
    },
    [onChange],
  );

  const refresh = useCallback(
    (opts?: { silent?: boolean }) => {
      abortRef.current?.abort();
      verifyGenRef.current += 1;
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      challengeIdRef.current = createChallengeId();
      setSlider(0);
      setStatus("idle");
      setVerifiedLatch(false);
      setAttempts(0);
      setSnapping(false);
      if (!opts?.silent) onRefresh?.();
    },
    [onRefresh, setSlider],
  );

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, []);

  const fail = useCallback(
    (err: CaptchaError, nextStatus: CaptchaStatus = "invalid") => {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      onAttemptsChange?.(nextAttempts);
      onError?.(err);
      setVerifiedLatch(false);
      onVerified?.(false);
      setSnapping(true);
      setSlider(0);
      snapTimerRef.current = setTimeout(() => setSnapping(false), 280);

      if (nextAttempts >= maxAttempts) {
        const locked = createCaptchaError("max_attempts", messages.lockedHint, {
          attempts: nextAttempts,
        });
        setStatus("locked");
        onLock?.(locked);
        onError?.(locked);
        return;
      }
      setStatus(nextStatus);
      if (
        (nextStatus === "invalid" && autoRefreshOnInvalid) ||
        (nextStatus === "error" && autoRefreshOnError)
      ) {
        refresh({ silent: true });
      }
    },
    [
      attempts,
      autoRefreshOnError,
      autoRefreshOnInvalid,
      maxAttempts,
      messages.lockedHint,
      onAttemptsChange,
      onError,
      onLock,
      onVerified,
      refresh,
      setSlider,
    ],
  );

  const finish = useCallback(
    async (raw: number) => {
      if (disabled || status === "locked" || loadingProp || verifiedLatch)
        return;

      const next = clampPercent(raw);
      const inZone = next >= targetMin && next <= targetMax;

      if (!inZone) {
        fail(
          createCaptchaError("invalid", messages.invalidHint, {
            attempts: attempts + 1,
          }),
        );
        return;
      }

      setSlider(100);

      if (!verify) {
        setStatus("valid");
        setVerifiedLatch(true);
        setAttempts(0);
        onVerified?.(true);
        return;
      }

      const gen = ++verifyGenRef.current;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setStatus("loading");
      try {
        const ok = await withTimeout(
          Promise.resolve(
            verify({
              value: 100,
              challengeId: challengeIdRef.current,
              targetMin,
              targetMax,
            }),
          ),
          verifyTimeoutMs,
          ac.signal,
        );
        if (gen !== verifyGenRef.current) return;
        if (!ok) {
          fail(
            createCaptchaError("verify_failed", messages.errorHint),
            "error",
          );
          return;
        }
        setStatus("valid");
        setVerifiedLatch(true);
        setAttempts(0);
        onVerified?.(true);
      } catch (cause) {
        if (gen !== verifyGenRef.current) return;
        const classified = classifyVerifyFailure(cause);
        fail(
          createCaptchaError(classified.code, messages.errorHint, { cause }),
          "error",
        );
      }
    },
    [
      attempts,
      disabled,
      fail,
      loadingProp,
      messages.errorHint,
      messages.invalidHint,
      onVerified,
      setSlider,
      status,
      targetMax,
      targetMin,
      verifiedLatch,
      verify,
      verifyTimeoutMs,
    ],
  );

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => refresh(),
      reset: () => {
        setSlider(0);
        setStatus("idle");
        setVerifiedLatch(false);
        setSnapping(false);
      },
      getValue: () => value,
      getChallengeId: () => challengeIdRef.current,
      validate: () => verifiedLatch && value >= targetMin,
      getStatus: () => status,
      getAttempts: () => attempts,
      unlock: (opts) => {
        setAttempts(0);
        setStatus("idle");
        if (opts?.refresh) refresh();
      },
    }),
    [attempts, refresh, setSlider, status, targetMin, value, verifiedLatch],
  );

  const isLoading = Boolean(loadingProp) || status === "loading";
  const isLocked = status === "locked";
  const fieldDisabled = disabled || isLocked || isLoading || verifiedLatch;
  const displayError =
    errorProp ??
    (status === "error" || status === "locked" ? messages.errorHint : null);

  const statusMessage = (() => {
    if (displayError && status === "error") return displayError;
    if (loadingProp || status === "loading") return messages.loadingHint;
    if (status === "locked") return messages.lockedHint;
    if (status === "invalid") return messages.invalidHint;
    if (status === "valid") return messages.validHint;
    return messages.idleHint;
  })();

  const targetHint = messages.targetHint
    .replace("{min}", String(targetMin))
    .replace("{max}", String(targetMax));

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-itzsa-slider-captcha=""
      data-status={status}
      data-attempts={attempts}
      data-locked={isLocked ? "" : undefined}
      data-value={value}
    >
      {showLabel ? (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={inputId}
            className={cn("text-sm font-medium text-primary", labelClassName)}
          >
            {label}
            {required ? (
              <span className="text-red-600" aria-hidden>
                {" "}
                *
              </span>
            ) : null}
          </label>
          {showRefresh ? (
            <button
              type="button"
              onClick={() => refresh()}
              disabled={disabled || isLoading}
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-secondary transition-colors hover:bg-muted hover:text-primary disabled:opacity-50",
                refreshClassName,
              )}
              title={messages.refreshLabel}
              aria-label={messages.refreshLabel}
            >
              <RefreshIcon />
            </button>
          ) : null}
        </div>
      ) : showRefresh ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={disabled || isLoading}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-secondary transition-colors hover:bg-muted hover:text-primary disabled:opacity-50",
              refreshClassName,
            )}
            title={messages.refreshLabel}
            aria-label={messages.refreshLabel}
          >
            <RefreshIcon />
          </button>
        </div>
      ) : null}

      <div className="relative max-w-sm">
        <div
          className={cn(
            "relative h-11 overflow-hidden rounded-md border border-border bg-muted/50",
            status === "valid" && "border-green-600/50",
            (status === "invalid" || status === "error") && "border-red-500/50",
            trackClassName,
          )}
        >
          <div
            className="absolute inset-y-0 left-0 bg-accent/20 transition-[width] duration-200"
            style={{ width: `${value}%` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 flex items-center text-[11px] text-secondary"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            {verifiedLatch ? messages.validHint : messages.dragHint}
          </div>
          <div
            className={cn(
              "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-card text-sm font-medium text-primary shadow-sm",
              snapping && "transition-all duration-280 ease-out",
              thumbClassName,
            )}
            style={{ left: `calc(${value}% - 18px)` }}
            aria-hidden
          >
            {verifiedLatch ? "✓" : "▸"}
          </div>
          <input
            id={inputId}
            name={name}
            type="range"
            min={0}
            max={100}
            value={value}
            disabled={fieldDisabled}
            required={required}
            aria-label={showLabel ? undefined : label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-invalid={
              status === "invalid" || status === "error" || status === "locked"
                ? true
                : undefined
            }
            aria-describedby={
              [showStatus ? statusId : null, displayError ? errorId : null]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
            onChange={(e) => {
              if (fieldDisabled) return;
              if (verifiedLatch) {
                setVerifiedLatch(false);
                setStatus("idle");
                onVerified?.(false);
              }
              setSlider(Number(e.target.value));
            }}
            onPointerUp={(e) => void finish(Number(e.currentTarget.value))}
            onKeyUp={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                void finish(value);
              }
              if (e.key === "Enter" || e.key === " ") {
                void finish(value);
              }
            }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-secondary">{targetHint}</p>
      </div>

      {displayError && status !== "invalid" ? (
        <p
          id={errorId}
          role="alert"
          className={cn("text-xs text-red-600", errorClassName)}
        >
          {displayError}
        </p>
      ) : null}

      {showStatus || showCounter ? (
        <div className="flex items-center justify-between gap-2">
          {showStatus ? (
            <p
              id={statusId}
              className="text-xs text-secondary"
              aria-live="polite"
            >
              {status === "valid" ? (
                <span className="text-green-600">{statusMessage}</span>
              ) : status === "invalid" ||
                status === "error" ||
                status === "locked" ? (
                <span className="text-red-500">{statusMessage}</span>
              ) : (
                statusMessage
              )}
            </p>
          ) : (
            <span />
          )}
          {showCounter && maxAttempts < Number.POSITIVE_INFINITY ? (
            <p className="tabular-nums text-xs text-secondary">
              {Math.max(0, maxAttempts - attempts)} left
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

SliderCaptcha.displayName = "SliderCaptcha";
