"use client";

import {
  type ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Input } from "./components/ui/input";
import { drawCaptcha } from "./draw";
import {
  classifyVerifyFailure,
  createCaptchaError,
  withTimeout,
} from "./errors";
import {
  createChallengeId,
  defaultIdleHint,
  generateCaptcha,
  inputSanitizePattern,
  normalizeCaptchaLength,
  resolveCharsetMode,
  verifyCaptcha,
} from "./generate";
import { cn } from "./lib/utils";
import type {
  CaptchaError,
  CaptchaHandle,
  CaptchaProps,
  CaptchaStatus,
  CaptchaTheme,
} from "./types";

const DEFAULT_MESSAGES = {
  label: "Security check",
  placeholder: "Enter the characters shown",
  validHint: "Verified",
  invalidHint: "Incorrect code — please try again",
  loadingHint: "Verifying…",
  errorHint: "Verification failed — please try again",
  lockedHint: "Too many attempts — refresh to try again",
  refreshLabel: "Get a new code",
  requiredHint: "Required",
} as const;

function resolveTheme(theme: CaptchaTheme): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

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

export const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(function Captcha(
  {
    length: lengthProp,
    chars,
    charsetMode: charsetModeProp = "both",
    caseSensitive: caseSensitiveProp = true,
    requireDigit,
    requireUpper,
    requireLower,
    charset,
    excludeAmbiguous = true,
    width = 210,
    height = 62,
    theme = "system",
    noise = 0.55,
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
    value: valueProp,
    defaultValue = "",
    disabled = false,
    autoFocus = false,
    id: idProp,
    name,
    showRefresh = true,
    showCounter = true,
    showStatus = true,
    showLabel = true,
    messages: messagesProp,
    className,
    canvasClassName,
    inputClassName,
    refreshClassName,
    labelClassName,
    errorClassName,
    inputProps,
  },
  ref,
) {
  const length = normalizeCaptchaLength(chars ?? lengthProp);
  const charsetMode = resolveCharsetMode(charsetModeProp);
  const caseSensitive = charsetMode === "numbers" ? false : caseSensitiveProp;

  const reactId = useId();
  const inputId = idProp ?? `itzsa-captcha-${reactId}`;
  const statusId = `${inputId}-status`;
  const errorId = `${inputId}-error`;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const challengeRef = useRef("");
  const challengeIdRef = useRef(createChallengeId());
  const abortRef = useRef<AbortController | null>(null);
  const verifyGenRef = useRef(0);

  const onVerifiedRef = useRef(onVerified);
  const onChangeRef = useRef(onChange);
  const onStatusChangeRef = useRef(onStatusChange);
  const onRefreshRef = useRef(onRefresh);
  const onErrorRef = useRef(onError);
  const onAttemptsChangeRef = useRef(onAttemptsChange);
  const onLockRef = useRef(onLock);
  const verifyRef = useRef(verify);

  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const inputVal = isControlled ? valueProp : uncontrolled;
  const [status, setStatus] = useState<CaptchaStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const externalError = errorProp ?? null;
  const isLoading = Boolean(loadingProp) || status === "loading";
  const isLocked = status === "locked";
  const displayError =
    externalError ||
    (status === "error" || status === "locked" ? localError : null);

  const messages = {
    ...DEFAULT_MESSAGES,
    idleHint: defaultIdleHint(charsetMode),
    ...messagesProp,
  };
  const label = labelProp ?? messages.label;

  useEffect(() => {
    onVerifiedRef.current = onVerified;
    onChangeRef.current = onChange;
    onStatusChangeRef.current = onStatusChange;
    onRefreshRef.current = onRefresh;
    onErrorRef.current = onError;
    onAttemptsChangeRef.current = onAttemptsChange;
    onLockRef.current = onLock;
    verifyRef.current = verify;
  }, [
    onVerified,
    onChange,
    onStatusChange,
    onRefresh,
    onError,
    onAttemptsChange,
    onLock,
    verify,
  ]);

  const setStatusSafe = useCallback((next: CaptchaStatus) => {
    setStatus((prev) => {
      if (prev !== next) onStatusChangeRef.current?.(next);
      return next;
    });
  }, []);

  const recordAttempt = useCallback(() => {
    const next = attempts + 1;
    setAttempts(next);
    onAttemptsChangeRef.current?.(next);
    return next;
  }, [attempts]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !challengeRef.current) return;
    drawCaptcha(canvas, challengeRef.current, {
      theme: resolveTheme(theme),
      noise,
    });
  }, [theme, noise]);

  const seedChallenge = useCallback(() => {
    challengeRef.current = generateCaptcha({
      length,
      charsetMode,
      requireDigit,
      requireUpper,
      requireLower,
      charset,
      excludeAmbiguous,
    });
    challengeIdRef.current = createChallengeId();
    paint();
  }, [
    length,
    charsetMode,
    requireDigit,
    requireUpper,
    requireLower,
    charset,
    excludeAmbiguous,
    paint,
  ]);

  const refresh = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    verifyGenRef.current += 1;
    seedChallenge();
    if (!isControlled) setUncontrolled("");
    onChangeRef.current?.("");
    setLocalError(null);
    setAttempts(0);
    onAttemptsChangeRef.current?.(0);
    setStatusSafe("idle");
    onVerifiedRef.current?.(false);
    onRefreshRef.current?.();
  }, [seedChallenge, isControlled, setStatusSafe]);

  const reset = useCallback(() => {
    if (!isControlled) setUncontrolled("");
    onChangeRef.current?.("");
    setLocalError(null);
    if (status !== "locked") setStatusSafe("idle");
    onVerifiedRef.current?.(false);
  }, [isControlled, setStatusSafe, status]);

  const unlock = useCallback(
    (opts?: { refresh?: boolean }) => {
      setAttempts(0);
      onAttemptsChangeRef.current?.(0);
      setLocalError(null);
      if (opts?.refresh !== false) {
        refresh();
      } else {
        setStatusSafe("idle");
      }
    },
    [refresh, setStatusSafe],
  );

  const validate = useCallback(() => {
    return (
      status === "valid" ||
      verifyCaptcha(inputVal, challengeRef.current, caseSensitive)
    );
  }, [inputVal, caseSensitive, status]);

  useImperativeHandle(
    ref,
    () => ({
      refresh,
      reset,
      getValue: () => inputVal,
      getChallengeId: () => challengeIdRef.current,
      validate,
      getStatus: () => status,
      getAttempts: () => attempts,
      unlock,
    }),
    [refresh, reset, inputVal, validate, status, attempts, unlock],
  );

  useLayoutEffect(() => {
    seedChallenge();
    if (!isControlled) setUncontrolled("");
    setLocalError(null);
    setAttempts(0);
    setStatusSafe("idle");
    onVerifiedRef.current?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    length,
    charsetMode,
    requireDigit,
    requireUpper,
    requireLower,
    charset,
    excludeAmbiguous,
    isControlled,
    setStatusSafe,
  ]);

  useEffect(() => {
    paint();
  }, [paint]);

  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChangeTheme = () => paint();
    mq.addEventListener("change", onChangeTheme);
    return () => mq.removeEventListener("change", onChangeTheme);
  }, [theme, paint]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const emitFailure = useCallback(
    (error: CaptchaError, nextAttempts: number) => {
      onErrorRef.current?.(error);
      setLocalError(error.message);

      if (nextAttempts >= maxAttempts) {
        const locked = createCaptchaError("max_attempts", messages.lockedHint, {
          attempts: nextAttempts,
          cause: error,
        });
        setStatusSafe("locked");
        setLocalError(locked.message);
        onErrorRef.current?.(locked);
        onLockRef.current?.(locked);
        return "locked" as const;
      }
      return "open" as const;
    },
    [maxAttempts, messages.lockedHint, setStatusSafe],
  );

  const runVerification = useCallback(
    async (sanitized: string) => {
      const localOk = verifyCaptcha(
        sanitized,
        challengeRef.current,
        caseSensitive,
      );

      if (!localOk) {
        const nextAttempts = recordAttempt();
        const err = createCaptchaError("invalid", messages.invalidHint, {
          attempts: nextAttempts,
        });
        const gate = emitFailure(err, nextAttempts);
        if (gate === "open") {
          setStatusSafe("invalid");
          onVerifiedRef.current?.(false);
          if (autoRefreshOnInvalid) refresh();
        } else {
          onVerifiedRef.current?.(false);
        }
        return;
      }

      const verifyFn = verifyRef.current;
      if (!verifyFn) {
        setAttempts(0);
        onAttemptsChangeRef.current?.(0);
        setLocalError(null);
        setStatusSafe("valid");
        onVerifiedRef.current?.(true);
        return;
      }

      const gen = ++verifyGenRef.current;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setStatusSafe("loading");
      setLocalError(null);

      try {
        const result = await withTimeout(
          Promise.resolve(
            verifyFn({
              value: sanitized,
              challengeId: challengeIdRef.current,
              length,
              charsetMode,
            }),
          ),
          verifyTimeoutMs,
          ac.signal,
        );
        if (gen !== verifyGenRef.current) return;

        if (result) {
          setAttempts(0);
          onAttemptsChangeRef.current?.(0);
          setLocalError(null);
          setStatusSafe("valid");
          onVerifiedRef.current?.(true);
          return;
        }

        const nextAttempts = recordAttempt();
        const err = createCaptchaError("verify_failed", messages.errorHint, {
          attempts: nextAttempts,
        });
        const gate = emitFailure(err, nextAttempts);
        if (gate === "open") {
          setStatusSafe("error");
          onVerifiedRef.current?.(false);
          if (autoRefreshOnError) refresh();
        } else {
          onVerifiedRef.current?.(false);
        }
      } catch (cause) {
        if (gen !== verifyGenRef.current) return;
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        const nextAttempts = recordAttempt();
        const classified = classifyVerifyFailure(cause);
        classified.attempts = nextAttempts;
        const gate = emitFailure(classified, nextAttempts);
        if (gate === "open") {
          setStatusSafe("error");
          onVerifiedRef.current?.(false);
          if (autoRefreshOnError) refresh();
        } else {
          onVerifiedRef.current?.(false);
        }
      }
    },
    [
      caseSensitive,
      recordAttempt,
      messages.invalidHint,
      messages.errorHint,
      emitFailure,
      setStatusSafe,
      autoRefreshOnInvalid,
      autoRefreshOnError,
      refresh,
      length,
      charsetMode,
      verifyTimeoutMs,
    ],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isLocked || disabled) return;

    const sanitized = e.target.value
      .replace(inputSanitizePattern(charsetMode), "")
      .slice(0, length);
    if (!isControlled) setUncontrolled(sanitized);
    onChangeRef.current?.(sanitized);

    if (sanitized.length < length) {
      if (status !== "idle" && status !== "loading") setStatusSafe("idle");
      setLocalError(null);
      onVerifiedRef.current?.(false);
      return;
    }

    void runVerification(sanitized);
  };

  const fieldDisabled = disabled || isLocked || isLoading;
  const describedBy =
    [showStatus ? statusId : null, displayError ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const statusMessage = (() => {
    if (loadingProp || status === "loading") return messages.loadingHint;
    if (status === "locked") return messages.lockedHint;
    if (status === "error") return displayError ?? messages.errorHint;
    if (status === "invalid") return messages.invalidHint;
    if (status === "valid") return messages.validHint;
    return messages.idleHint;
  })();

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-itzsa-captcha=""
      data-status={status}
      data-charset-mode={charsetMode}
      data-length={length}
      data-attempts={attempts}
      data-locked={isLocked ? "" : undefined}
    >
      {showLabel ? (
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
      ) : null}

      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={cn(
            "select-none rounded-md border border-border bg-card",
            canvasClassName,
          )}
          aria-hidden
        />
        {showRefresh ? (
          <button
            type="button"
            onClick={() => refresh()}
            disabled={disabled || isLoading}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-secondary transition-colors hover:bg-muted hover:text-primary disabled:opacity-50",
              refreshClassName,
            )}
            title={messages.refreshLabel}
            aria-label={messages.refreshLabel}
          >
            <RefreshIcon />
          </button>
        ) : null}
      </div>

      <Input
        id={inputId}
        name={name}
        type="text"
        value={inputVal}
        onChange={handleChange}
        maxLength={length}
        disabled={fieldDisabled}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        required={required}
        placeholder={messages.placeholder}
        aria-label={showLabel ? undefined : label}
        aria-invalid={
          status === "invalid" || status === "error" || status === "locked"
            ? true
            : undefined
        }
        aria-required={required || undefined}
        aria-busy={isLoading || undefined}
        aria-describedby={describedBy}
        className={cn(
          "bg-card tracking-[0.3em]",
          "placeholder:tracking-normal",
          status === "valid" &&
            "border-green-600 focus-visible:ring-green-600/30",
          (status === "invalid" || status === "error") &&
            "border-red-500 focus-visible:ring-red-500/30",
          status === "locked" && "border-red-600 opacity-80",
          inputClassName,
        )}
        {...inputProps}
      />

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
          {showCounter ? (
            <p className="tabular-nums text-xs text-secondary">
              {inputVal.length}/{length}
              {maxAttempts < Number.POSITIVE_INFINITY
                ? ` · ${Math.max(0, maxAttempts - attempts)} left`
                : null}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

Captcha.displayName = "Captcha";
