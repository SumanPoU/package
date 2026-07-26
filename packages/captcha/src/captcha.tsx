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
  defaultIdleHint,
  generateCaptcha,
  inputSanitizePattern,
  normalizeCaptchaLength,
  resolveCharsetMode,
  verifyCaptcha,
} from "./generate";
import { cn } from "./lib/utils";
import type {
  CaptchaHandle,
  CaptchaProps,
  CaptchaStatus,
  CaptchaTheme,
} from "./types";

const DEFAULT_MESSAGES = {
  placeholder: "Type the characters above",
  validHint: "Verified",
  invalidHint: "Incorrect — refresh for a new challenge",
  refreshLabel: "Generate new captcha",
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
    width = 210,
    height = 62,
    theme = "system",
    noise = 0.7,
    onVerified,
    onChange,
    onStatusChange,
    onRefresh,
    value: valueProp,
    defaultValue = "",
    disabled = false,
    autoFocus = false,
    id: idProp,
    name,
    showRefresh = true,
    showCounter = true,
    showStatus = true,
    messages: messagesProp,
    className,
    canvasClassName,
    inputClassName,
    refreshClassName,
    inputProps,
  },
  ref,
) {
  const length = normalizeCaptchaLength(chars ?? lengthProp);
  const charsetMode = resolveCharsetMode(charsetModeProp);
  const caseSensitive = charsetMode === "numbers" ? false : caseSensitiveProp;

  const reactId = useId();
  const inputId = idProp ?? `itzsa-captcha-${reactId}`;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const challengeRef = useRef("");
  const onVerifiedRef = useRef(onVerified);
  const onChangeRef = useRef(onChange);
  const onStatusChangeRef = useRef(onStatusChange);
  const onRefreshRef = useRef(onRefresh);

  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const inputVal = isControlled ? valueProp : uncontrolled;
  const [status, setStatus] = useState<CaptchaStatus>("idle");

  const messages = {
    ...DEFAULT_MESSAGES,
    idleHint: defaultIdleHint(charsetMode),
    ...messagesProp,
  };

  useEffect(() => {
    onVerifiedRef.current = onVerified;
    onChangeRef.current = onChange;
    onStatusChangeRef.current = onStatusChange;
    onRefreshRef.current = onRefresh;
  }, [onVerified, onChange, onStatusChange, onRefresh]);

  const setStatusSafe = useCallback((next: CaptchaStatus) => {
    setStatus((prev) => {
      if (prev !== next) onStatusChangeRef.current?.(next);
      return next;
    });
  }, []);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !challengeRef.current) return;
    drawCaptcha(canvas, challengeRef.current, {
      theme: resolveTheme(theme),
      noise,
    });
  }, [theme, noise]);

  const refresh = useCallback(() => {
    challengeRef.current = generateCaptcha({
      length,
      charsetMode,
      requireDigit,
      requireUpper,
      requireLower,
      charset,
    });
    paint();
    if (!isControlled) setUncontrolled("");
    onChangeRef.current?.("");
    setStatusSafe("idle");
    onVerifiedRef.current?.(false);
    onRefreshRef.current?.();
  }, [
    length,
    charsetMode,
    requireDigit,
    requireUpper,
    requireLower,
    charset,
    paint,
    isControlled,
    setStatusSafe,
  ]);

  const reset = useCallback(() => {
    if (!isControlled) setUncontrolled("");
    onChangeRef.current?.("");
    setStatusSafe("idle");
    onVerifiedRef.current?.(false);
  }, [isControlled, setStatusSafe]);

  const validate = useCallback(() => {
    return verifyCaptcha(inputVal, challengeRef.current, caseSensitive);
  }, [inputVal, caseSensitive]);

  useImperativeHandle(
    ref,
    () => ({
      refresh,
      reset,
      getValue: () => inputVal,
      validate,
      getStatus: () => status,
    }),
    [refresh, reset, inputVal, validate, status],
  );

  useLayoutEffect(() => {
    challengeRef.current = generateCaptcha({
      length,
      charsetMode,
      requireDigit,
      requireUpper,
      requireLower,
      charset,
    });
    const canvas = canvasRef.current;
    if (canvas && challengeRef.current) {
      drawCaptcha(canvas, challengeRef.current, {
        theme: resolveTheme(theme),
        noise,
      });
    }
    if (!isControlled) setUncontrolled("");
    setStatusSafe("idle");
    onVerifiedRef.current?.(false);
    // theme/noise only affect paint — see effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    length,
    charsetMode,
    requireDigit,
    requireUpper,
    requireLower,
    charset,
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value
      .replace(inputSanitizePattern(charsetMode), "")
      .slice(0, length);
    if (!isControlled) setUncontrolled(sanitized);
    onChangeRef.current?.(sanitized);

    if (sanitized.length < length) {
      setStatusSafe("idle");
      onVerifiedRef.current?.(false);
      return;
    }

    const valid = verifyCaptcha(sanitized, challengeRef.current, caseSensitive);
    setStatusSafe(valid ? "valid" : "invalid");
    onVerifiedRef.current?.(valid);
  };

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-itzsa-captcha=""
      data-status={status}
      data-charset-mode={charsetMode}
      data-length={length}
    >
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={cn(
            "select-none rounded-md border border-border",
            canvasClassName,
          )}
          aria-hidden
        />
        {showRefresh ? (
          <button
            type="button"
            onClick={refresh}
            disabled={disabled}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-secondary transition-colors hover:bg-muted hover:text-primary disabled:opacity-50",
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
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={messages.placeholder}
        aria-label={messages.placeholder}
        aria-invalid={status === "invalid" || undefined}
        className={cn(
          "tracking-[0.3em]",
          "placeholder:tracking-normal",
          status === "valid" &&
            "border-green-600 focus-visible:ring-green-600/30",
          status === "invalid" &&
            "border-red-500 focus-visible:ring-red-500/30",
          inputClassName,
        )}
        {...inputProps}
      />

      {showStatus || showCounter ? (
        <div className="flex items-center justify-between gap-2">
          {showStatus ? (
            <p className="text-xs text-secondary" aria-live="polite">
              {status === "idle" && messages.idleHint}
              {status === "valid" && (
                <span className="text-green-600">{messages.validHint}</span>
              )}
              {status === "invalid" && (
                <span className="text-red-500">{messages.invalidHint}</span>
              )}
            </p>
          ) : (
            <span />
          )}
          {showCounter ? (
            <p className="tabular-nums text-xs text-secondary">
              {inputVal.length}/{length}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
