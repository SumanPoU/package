import type { CaptchaError, CaptchaErrorCode } from "./types";

export function createCaptchaError(
  code: CaptchaErrorCode,
  message: string,
  extras?: Pick<CaptchaError, "attempts" | "cause">,
): CaptchaError {
  return {
    code,
    message,
    ...extras,
  };
}

export function classifyVerifyFailure(cause: unknown): CaptchaError {
  if (cause instanceof DOMException && cause.name === "AbortError") {
    return createCaptchaError("aborted", "Verification was cancelled.", {
      cause,
    });
  }
  if (cause instanceof Error) {
    const msg = cause.message.toLowerCase();
    if (msg.includes("timeout") || cause.name === "TimeoutError") {
      return createCaptchaError(
        "timeout",
        "Verification timed out. Please try again.",
        { cause },
      );
    }
    if (
      msg.includes("network") ||
      msg.includes("fetch") ||
      cause.name === "TypeError"
    ) {
      return createCaptchaError(
        "network",
        "Network error while verifying captcha.",
        { cause },
      );
    }
    return createCaptchaError(
      "verify_failed",
      cause.message || "Captcha verification failed.",
      { cause },
    );
  }
  if (typeof cause === "string" && cause.trim()) {
    return createCaptchaError("verify_failed", cause, { cause });
  }
  return createCaptchaError(
    "unknown",
    "Captcha verification failed. Please try again.",
    { cause },
  );
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  signal?: AbortSignal,
): Promise<T> {
  if (ms <= 0) return promise;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            Object.assign(new Error("Verification timed out"), {
              name: "TimeoutError",
            }),
          );
        }, ms);
        signal?.addEventListener(
          "abort",
          () => {
            reject(
              typeof DOMException !== "undefined"
                ? new DOMException("Aborted", "AbortError")
                : Object.assign(new Error("Aborted"), { name: "AbortError" }),
            );
          },
          { once: true },
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
