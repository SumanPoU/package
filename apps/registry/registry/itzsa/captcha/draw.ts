import { DIGITS } from "./generate";
import type { CaptchaDrawOptions } from "./types";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function applyPixelNoise(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  intensity: number,
) {
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;
  const amp = 45 * intensity;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() + Math.random() + Math.random() - 1.5) * amp;
    data[i] = Math.min(255, Math.max(0, data[i]! + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1]! + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2]! + noise));
  }

  const saltCount = W * H * 0.025 * intensity;
  for (let i = 0; i < saltCount; i++) {
    const px = Math.floor(Math.random() * W);
    const py = Math.floor(Math.random() * H);
    const idx = (py * W + px) * 4;
    const val = Math.random() > 0.5 ? 255 : 0;
    data[idx] = data[idx + 1] = data[idx + 2] = val;
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyBlockPixelation(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  intensity: number,
) {
  const blockSize = 3;
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;
  const attempts = Math.round(120 * intensity);

  for (let attempt = 0; attempt < attempts; attempt++) {
    const bx = Math.floor(Math.random() * Math.max(1, W - blockSize));
    const by = Math.floor(Math.random() * Math.max(1, H - blockSize));
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let dy = 0; dy < blockSize; dy++) {
      for (let dx = 0; dx < blockSize; dx++) {
        const idx = ((by + dy) * W + (bx + dx)) * 4;
        r += data[idx]!;
        g += data[idx + 1]!;
        b += data[idx + 2]!;
        count++;
      }
    }
    r /= count;
    g /= count;
    b /= count;
    for (let dy = 0; dy < blockSize; dy++) {
      for (let dx = 0; dx < blockSize; dx++) {
        const idx = ((by + dy) * W + (bx + dx)) * 4;
        const jitter = (Math.random() - 0.5) * 15 * intensity;
        data[idx] = Math.min(255, Math.max(0, r + jitter));
        data[idx + 1] = Math.min(255, Math.max(0, g + jitter));
        data[idx + 2] = Math.min(255, Math.max(0, b + jitter));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Paint a challenge onto a canvas. Pure (aside from Math.random / matchMedia).
 */
export function drawCaptcha(
  canvas: HTMLCanvasElement,
  text: string,
  options: CaptchaDrawOptions = {},
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const intensity = clamp01(options.noise ?? 0.7);
  const isDark =
    options.theme === "dark"
      ? true
      : options.theme === "light"
        ? false
        : typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = isDark ? "#18181b" : "#f0f0ee";
  ctx.fillRect(0, 0, W, H);

  const grain = W * H * 0.4 * intensity;
  for (let i = 0; i < grain; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const alpha = 0.03 + Math.random() * 0.07;
    ctx.fillStyle = isDark
      ? `rgba(255,255,255,${alpha})`
      : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  for (let y = 0; y < H; y += 2 + Math.floor(Math.random() * 3)) {
    ctx.strokeStyle = isDark
      ? `rgba(255,255,255,${0.03 + Math.random() * 0.05})`
      : `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const curves = Math.round(6 * intensity);
  for (let i = 0; i < curves; i++) {
    ctx.strokeStyle = isDark
      ? `rgba(255,255,255,${0.12 + Math.random() * 0.15})`
      : `rgba(0,0,0,${0.1 + Math.random() * 0.14})`;
    ctx.lineWidth = 1.2 + Math.random() * 1.8;
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, Math.random() * H);
    ctx.bezierCurveTo(
      Math.random() * W,
      Math.random() * H,
      Math.random() * W,
      Math.random() * H,
      Math.random() * W,
      Math.random() * H,
    );
    ctx.stroke();
  }

  const length = text.length || 1;
  const slotW = W / length;
  const letterColors = isDark
    ? ["#93c5fd", "#86efac", "#fde68a", "#c4b5fd", "#a5f3fc"]
    : ["#1d4ed8", "#15803d", "#b45309", "#6d28d9", "#0e7490"];
  const digitColors = isDark
    ? ["#fb923c", "#f87171", "#e879f9"]
    : ["#c2410c", "#b91c1c", "#86198f"];

  for (let i = 0; i < length; i++) {
    const char = text[i]!;
    const isDigit = DIGITS.includes(char);

    ctx.save();
    ctx.translate(
      slotW * i + slotW / 2 + (Math.random() - 0.5) * 5,
      H / 2 + (Math.random() - 0.5) * 8,
    );
    ctx.rotate((Math.random() - 0.5) * 0.55);
    const skew = (Math.random() - 0.5) * 0.25;
    ctx.transform(1, skew, 0, 1, 0, 0);

    const fontSize = Math.max(
      14,
      Math.round(H * 0.37) + Math.floor(Math.random() * 5),
    );
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    const colorPool = isDigit ? digitColors : letterColors;
    ctx.fillStyle = colorPool[Math.floor(Math.random() * colorPool.length)]!;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.92 + Math.random() * 0.08;
    ctx.shadowColor = isDark ? "rgba(0,0,0,0.9)" : "rgba(180,180,180,0.9)";
    ctx.shadowBlur = 4 + Math.random() * 4;
    ctx.shadowOffsetX = (Math.random() - 0.5) * 2;
    ctx.shadowOffsetY = (Math.random() - 0.5) * 2;
    ctx.fillText(char, 0, 0);
    ctx.globalAlpha = 0.15 + Math.random() * 0.15;
    ctx.shadowBlur = 0;
    ctx.fillText(char, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    ctx.restore();
  }

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = isDark
      ? `rgba(200,200,200,${0.04 + Math.random() * 0.06})`
      : `rgba(60,60,60,${0.04 + Math.random() * 0.06})`;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    const y1 = Math.random() * H;
    const y2 = y1 + (Math.random() - 0.5) * H * 0.5;
    ctx.moveTo(0, y1);
    ctx.lineTo(W, y2);
    ctx.stroke();
  }

  if (intensity > 0.05) {
    applyPixelNoise(ctx, W, H, intensity);
    applyBlockPixelation(ctx, W, H, intensity);
  }

  const scatter = W * H * 0.008 * intensity;
  for (let i = 0; i < scatter; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillStyle = isDark
      ? `rgba(255,255,255,${0.1 + Math.random() * 0.2})`
      : `rgba(0,0,0,${0.08 + Math.random() * 0.15})`;
    ctx.fillRect(x, y, 1 + Math.random(), 1 + Math.random());
  }
}
