import type { MetalRateLogger } from "../types";

export const defaultLogger: MetalRateLogger = (message, meta) => {
  if (meta) {
    console.info(`[nepal-metal-rate] ${message}`, meta);
  } else {
    console.info(`[nepal-metal-rate] ${message}`);
  }
};
