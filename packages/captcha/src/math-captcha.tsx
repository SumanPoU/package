"use client";

import {
  type ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { Input } from "./components/ui/input";
import {
  classifyVerifyFailure,
  createCaptchaError,
  withTimeout,
} from "./errors";
import { createChallengeId } from "./generate";
import { cn } from "./lib/utils";
import {
  DEFAULT_BODMAS_CAUTION,
  generateMathChallenge,
  verifyMathAnswer,
} from "./math/generate";
import type {
  MathCaptchaChallenge,
  MathCaptchaGenerateOptions,
  MathCaptchaHandle,
  MathCaptchaMessages,
} from "./math/types";
import type { CaptchaError, CaptchaStatus } from "./types";

export type MathCaptchaLayout = "stack" | "inline";

/**
 * Server-issued challenge for secure mode.
 * Never include the expected answer — only the display prompt + opaque token.
 */
export type MathCaptchaServerChallenge = {
  prompt: string;
  /** Opaque token from your challenge API (stored server-side with the answer). */
  token: string;
};

export type MathCaptchaProps = MathCaptchaGenerateOptions & {
  /**
   * Opt-in BODMAS / PEMDAS caution under the prompt.
   * @default false
   */
  showBodmasCaution?: boolean;
  /** Override caution copy when `showBodmasCaution` is true. */
  bodmasCaution?: string;

  /**
   * Layout of prompt + input + verify.
   * - `stack` — prompt row, then input row (default)
   * - `inline` — prompt, refresh, input, and verify on one horizontal line
   * @default "stack"
   */
  layout?: MathCaptchaLayout;

  /**
   * Secure / server-driven mode: display this prompt and skip local answer checks.
   * Requires `verify` (your `/api/captcha/verify`). Refresh calls `onRequestChallenge`.
   */
  serverChallenge?: MathCaptchaServerChallenge | null;
  /** Fetch the next server challenge when refresh is clicked (server mode). */
  onRequestChallenge?: () => void | Promise<void>;

  verify?: (payload: {
    value: string;
    challengeId: string;
    challenge: MathCaptchaChallenge | null;
  }) => boolean | Promise<boolean>;
  verifyTimeoutMs?: number;
  maxAttempts?: number;
  /**
   * Generate a new problem after a wrong answer (keeps attempt count).
   * @default true
   */
  autoRefreshOnInvalid?: boolean;
  /** Generate a new problem after a failed `verify` / API error. @default false */
  autoRefreshOnError?: boolean;
  error?: string | null;
  loading?: boolean;

  onVerified?: (valid: boolean) => void;
  onChange?: (value: string) => void;
  onStatusChange?: (status: CaptchaStatus) => void;
  onRefresh?: () => void;
  onError?: (error: CaptchaError) => void;
  onAttemptsChange?: (attempts: number) => void;
  onLock?: (error: CaptchaError) => void;
  onChallengeChange?: (challenge: MathCaptchaChallenge) => void;

  label?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  name?: string;

  showRefresh?: boolean;
  showCounter?: boolean;
  showStatus?: boolean;
  showLabel?: boolean;
  showVerifyButton?: boolean;
  messages?: MathCaptchaMessages;

  /** Root container. */
  className?: string;
  /** Label element. */
  labelClassName?: string;
  /**
   * Wrapper around prompt + input (+ verify) — useful for custom flex/grid.
   * Defaults to column (`stack`) or single row (`inline`).
   */
  rowClassName?: string;
  /** Prompt expression box. */
  promptClassName?: string;
  /** Text input. */
  inputClassName?: string;
  /** Refresh button. */
  refreshClassName?: string;
  /** Verify button. */
  verifyClassName?: string;
  /** Status / hint line. */
  statusClassName?: string;
  /** Attempts counter. */
  counterClassName?: string;
  /** Host / API error text. */
  errorClassName?: string;
  /** Opt-in BODMAS caution. */
  cautionClassName?: string;
};

const DEFAULT_MESSAGES = {
  label: "Security check",
  placeholder: "Enter the answer",
  idleHint: "Solve the expression, then verify.",
  validHint: "Verified",
  invalidHint: "Incorrect — new problem loaded",
  loadingHint: "Verifying…",
  errorHint: "Verification failed — please try again",
  lockedHint: "Too many attempts — refresh to try again",
  refreshLabel: "Get a new problem",
  verifyLabel: "Verify",
  bodmasCaution: DEFAULT_BODMAS_CAUTION,
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

type RefreshOpts = {
  silent?: boolean;
  /** Keep failed-attempt count (used when auto-loading the next problem). */
  preserveAttempts?: boolean;
  status?: CaptchaStatus;
};

export const MathCaptcha = forwardRef<MathCaptchaHandle, MathCaptchaProps>(
  function MathCaptcha(
    {
      difficulty = "easy",
      operators,
      operandRange,
      termCount,
      integerDivisionOnly,
      random,
      showBodmasCaution = false,
      bodmasCaution,
      layout = "stack",
      serverChallenge = null,
      onRequestChallenge,
      verify,
      verifyTimeoutMs = 15_000,
      maxAttempts = 5,
      autoRefreshOnInvalid = true,
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
      onChallengeChange,
      label: labelProp,
      required = false,
      value: valueProp,
      defaultValue = "",
      disabled = false,
      autoFocus = false,
      id: idProp,
      name,
      showRefresh = true,
      showCounter = false,
      showStatus = true,
      showLabel = true,
      showVerifyButton = true,
      messages: messagesProp,
      className,
      labelClassName,
      rowClassName,
      promptClassName,
      inputClassName,
      refreshClassName,
      verifyClassName,
      statusClassName,
      counterClassName,
      errorClassName,
      cautionClassName,
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = idProp ?? `itzsa-math-captcha-${reactId}`;
    const statusId = `${inputId}-status`;
    const errorId = `${inputId}-error`;
    const cautionId = `${inputId}-bodmas`;

    const genOpts = {
      difficulty,
      operators,
      operandRange,
      termCount,
      integerDivisionOnly,
      random,
    };

    const [challenge, setChallenge] = useState<MathCaptchaChallenge>(() =>
      generateMathChallenge(genOpts),
    );
    const challengeIdRef = useRef(createChallengeId());
    const abortRef = useRef<AbortController | null>(null);
    const verifyGenRef = useRef(0);

    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const inputVal = isControlled ? (valueProp ?? "") : uncontrolled;

    const [status, setStatus] = useState<CaptchaStatus>("idle");
    const [attempts, setAttempts] = useState(0);
    const [verifiedLatch, setVerifiedLatch] = useState(false);

    const messages = { ...DEFAULT_MESSAGES, ...messagesProp };
    const label = labelProp ?? messages.label;
    const isInline = layout === "inline";
    const isServerMode = Boolean(
      serverChallenge?.prompt && serverChallenge?.token,
    );

    const setInput = useCallback(
      (next: string) => {
        if (!isControlled) setUncontrolled(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const refresh = useCallback(
      (opts?: RefreshOpts) => {
        abortRef.current?.abort();
        verifyGenRef.current += 1;
        setInput("");
        setVerifiedLatch(false);
        if (!opts?.preserveAttempts) setAttempts(0);
        setStatus(opts?.status ?? "idle");

        if (isServerMode) {
          if (!opts?.silent) onRefresh?.();
          void onRequestChallenge?.();
          return;
        }

        const next = generateMathChallenge(genOpts);
        setChallenge(next);
        challengeIdRef.current = createChallengeId();
        onChallengeChange?.(next);
        if (!opts?.silent) onRefresh?.();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        difficulty,
        operators,
        operandRange,
        termCount,
        integerDivisionOnly,
        random,
        isServerMode,
        setInput,
        onChallengeChange,
        onRefresh,
        onRequestChallenge,
      ],
    );

    useEffect(() => {
      if (!serverChallenge?.token) return;
      challengeIdRef.current = serverChallenge.token;
      setInput("");
      setVerifiedLatch(false);
      setStatus("idle");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverChallenge?.token, serverChallenge?.prompt]);

    useEffect(() => {
      onStatusChange?.(status);
    }, [status, onStatusChange]);

    useEffect(() => {
      onChallengeChange?.(challenge);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fail = useCallback(
      (err: CaptchaError, nextStatus: CaptchaStatus = "invalid") => {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        onAttemptsChange?.(nextAttempts);
        onError?.(err);
        setVerifiedLatch(false);
        onVerified?.(false);

        if (nextAttempts >= maxAttempts) {
          const locked = createCaptchaError(
            "max_attempts",
            messages.lockedHint,
            { attempts: nextAttempts },
          );
          setStatus("locked");
          onLock?.(locked);
          onError?.(locked);
          return;
        }

        const shouldRefresh =
          (nextStatus === "invalid" && autoRefreshOnInvalid) ||
          (nextStatus === "error" && autoRefreshOnError);

        if (shouldRefresh) {
          // New problem, keep attempt count, surface invalid/error briefly.
          refresh({
            silent: true,
            preserveAttempts: true,
            status: nextStatus,
          });
          return;
        }

        setStatus(nextStatus);
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
      ],
    );

    const runVerify = useCallback(async () => {
      if (disabled || status === "locked" || loadingProp) return;

      // Local mode: check answer in the browser first.
      if (!isServerMode) {
        const localOk = verifyMathAnswer({
          value: inputVal,
          answer: challenge.answer,
        });
        if (!localOk) {
          fail(
            createCaptchaError("invalid", messages.invalidHint, {
              attempts: attempts + 1,
            }),
          );
          return;
        }

        if (!verify) {
          setStatus("valid");
          setVerifiedLatch(true);
          setAttempts(0);
          onVerified?.(true);
          return;
        }
      } else if (!verify) {
        fail(
          createCaptchaError(
            "verify_failed",
            "Server mode requires a verify() callback.",
          ),
          "error",
        );
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
            verify!({
              value: inputVal,
              challengeId: isServerMode
                ? (serverChallenge?.token ?? challengeIdRef.current)
                : challengeIdRef.current,
              challenge: isServerMode ? null : challenge,
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
    }, [
      attempts,
      challenge,
      disabled,
      fail,
      inputVal,
      isServerMode,
      loadingProp,
      messages.errorHint,
      messages.invalidHint,
      onVerified,
      serverChallenge?.token,
      status,
      verify,
      verifyTimeoutMs,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        refresh: () => refresh(),
        reset: () => {
          setInput("");
          setStatus("idle");
          setVerifiedLatch(false);
        },
        getValue: () => inputVal,
        getChallengeId: () =>
          isServerMode
            ? (serverChallenge?.token ?? challengeIdRef.current)
            : challengeIdRef.current,
        getChallenge: () => (isServerMode ? null : challenge),
        validate: () => {
          if (!verifiedLatch) return false;
          if (isServerMode) return true;
          return verifyMathAnswer({
            value: inputVal,
            answer: challenge.answer,
          });
        },
        getStatus: () => status,
        getAttempts: () => attempts,
        unlock: (opts) => {
          setAttempts(0);
          setStatus("idle");
          if (opts?.refresh) refresh();
        },
      }),
      [
        attempts,
        challenge,
        inputVal,
        isServerMode,
        refresh,
        serverChallenge?.token,
        setInput,
        status,
        verifiedLatch,
      ],
    );

    const isLoading = Boolean(loadingProp) || status === "loading";
    const isLocked = status === "locked";
    const fieldDisabled = disabled || isLocked || isLoading;
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

    const describedBy = [
      showStatus ? statusId : null,
      showBodmasCaution ? cautionId : null,
      displayError ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ");

    const displayPrompt = isServerMode
      ? serverChallenge!.prompt
      : challenge.prompt;

    const promptEl = (
      <div
        className={cn(
          "flex h-9 min-w-[140px] items-center justify-center rounded-md border border-border bg-card px-3 font-mono text-sm tracking-wide text-primary sm:h-[62px] sm:min-w-[180px] sm:text-lg",
          isInline &&
            "h-9 min-w-[120px] flex-none sm:h-9 sm:min-w-[140px] sm:text-sm",
          promptClassName,
        )}
        aria-live="polite"
        data-itzsa-math-prompt=""
      >
        {displayPrompt}
      </div>
    );

    const refreshEl = showRefresh ? (
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
        data-itzsa-math-refresh=""
      >
        <RefreshIcon />
      </button>
    ) : null;

    const inputEl = (
      <Input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        value={inputVal}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value);
          if (verifiedLatch || status === "invalid" || status === "error") {
            setVerifiedLatch(false);
            if (status !== "locked") setStatus("idle");
            if (verifiedLatch) onVerified?.(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void runVerify();
          }
        }}
        disabled={fieldDisabled}
        autoFocus={autoFocus}
        autoComplete="off"
        required={required}
        placeholder={messages.placeholder}
        aria-label={showLabel ? undefined : label}
        aria-invalid={
          status === "invalid" || status === "error" || status === "locked"
            ? true
            : undefined
        }
        aria-describedby={describedBy || undefined}
        className={cn(
          "bg-card",
          isInline && "min-w-[6rem] flex-1",
          status === "valid" &&
            "border-green-600 focus-visible:ring-green-600/30",
          (status === "invalid" || status === "error") &&
            "border-red-500 focus-visible:ring-red-500/30",
          inputClassName,
        )}
        data-itzsa-math-input=""
      />
    );

    const verifyEl = showVerifyButton ? (
      <button
        type="button"
        onClick={() => void runVerify()}
        disabled={fieldDisabled || !inputVal.trim()}
        className={cn(
          "inline-flex h-9 shrink-0 items-center rounded-md border border-border bg-muted px-3 text-xs font-medium text-primary transition-colors hover:bg-card disabled:opacity-50",
          verifyClassName,
        )}
        data-itzsa-math-verify=""
      >
        {messages.verifyLabel}
      </button>
    ) : null;

    return (
      <div
        className={cn("flex flex-col gap-2", className)}
        data-itzsa-math-captcha=""
        data-layout={layout}
        data-mode={isServerMode ? "server" : "local"}
        data-status={status}
        data-difficulty={isServerMode ? undefined : challenge.difficulty}
        data-bodmas={!isServerMode && challenge.requiresBodmas ? "" : undefined}
        data-attempts={attempts}
        data-locked={isLocked ? "" : undefined}
      >
        {showLabel ? (
          <label
            htmlFor={inputId}
            className={cn("text-sm font-medium text-primary", labelClassName)}
            data-itzsa-math-label=""
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

        {isInline ? (
          <div
            className={cn(
              "flex min-w-0 flex-wrap items-center gap-2",
              rowClassName,
            )}
            data-itzsa-math-row=""
          >
            {promptEl}
            {refreshEl}
            {inputEl}
            {verifyEl}
          </div>
        ) : (
          <div
            className={cn("flex flex-col gap-2", rowClassName)}
            data-itzsa-math-row=""
          >
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">{promptEl}</div>
              {refreshEl}
            </div>
            <div className="flex items-center gap-2">
              {inputEl}
              {verifyEl}
            </div>
          </div>
        )}

        {showBodmasCaution ? (
          <p
            id={cautionId}
            className={cn(
              "rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-800 dark:text-amber-200",
              cautionClassName,
            )}
            role="note"
            data-itzsa-math-caution=""
          >
            {bodmasCaution ?? messages.bodmasCaution}
          </p>
        ) : null}

        {displayError && status !== "invalid" ? (
          <p
            id={errorId}
            role="alert"
            className={cn("text-xs text-red-600", errorClassName)}
            data-itzsa-math-error=""
          >
            {displayError}
          </p>
        ) : null}

        {showStatus || showCounter ? (
          <div
            className={cn(
              "flex items-center justify-between gap-2",
              statusClassName,
            )}
            data-itzsa-math-status-row=""
          >
            {showStatus ? (
              <p
                id={statusId}
                className="text-xs text-secondary"
                aria-live="polite"
                data-itzsa-math-status=""
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
              <p
                className={cn(
                  "tabular-nums text-xs text-secondary",
                  counterClassName,
                )}
                data-itzsa-math-counter=""
              >
                {Math.max(0, maxAttempts - attempts)} left
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

MathCaptcha.displayName = "MathCaptcha";
