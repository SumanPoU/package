import { ConfigError } from "./core/errors";
import type { PaymentGateway } from "./core/PaymentGateway";
import type { GatewayName, NepalPayConfig } from "./core/types";
import {
  createGatewayFromRegistry,
  listRegisteredGateways,
} from "./registry/GatewayRegistry";

export interface CreateGatewaysOptions extends NepalPayConfig {
  fetchImpl?: typeof fetch;
  /** Per-request timeout for gateway HTTP calls. Default 15s. */
  timeoutMs?: number;
  /** Retries on network / 5xx. Default 1. */
  retries?: number;
}

/**
 * Build a gateway adapter from config + the pluggable registry.
 */
export function createGateway(
  name: GatewayName,
  config: CreateGatewaysOptions,
): PaymentGateway {
  return createGatewayFromRegistry(name, {
    mode: config.mode,
    config,
    fetchImpl: config.fetchImpl,
    timeoutMs: config.timeoutMs,
    retries: config.retries,
  });
}

export class NepalPay {
  readonly mode: NepalPayConfig["mode"];
  private readonly gateways = new Map<GatewayName, PaymentGateway>();
  private readonly options: CreateGatewaysOptions;

  constructor(config: CreateGatewaysOptions) {
    this.mode = config.mode;
    this.options = config;

    const configured: GatewayName[] = [];
    if (config.esewa) configured.push("esewa");
    if (config.khalti) configured.push("khalti");

    // Also instantiate any custom registered gateways the consumer listed via metadata? No —
    // only built-ins auto-wire from config keys. Custom gateways: call gateway(name) lazily.

    for (const name of configured) {
      this.gateways.set(name, createGateway(name, config));
    }

    if (this.gateways.size === 0) {
      throw new ConfigError(
        "Provide at least one of esewa or khalti in NepalPay config (or register + call gateway())",
      );
    }
  }

  /**
   * Resolve a gateway by name. Built-ins must be present in constructor config.
   * Custom registered gateways are created on first access.
   */
  gateway(name: GatewayName): PaymentGateway {
    const existing = this.gateways.get(name);
    if (existing) return existing;

    if (name === "esewa" || name === "khalti") {
      throw new ConfigError(
        `Gateway "${name}" is not configured on this NepalPay instance`,
      );
    }

    const created = createGateway(name, this.options);
    this.gateways.set(name, created);
    return created;
  }

  listGateways(): GatewayName[] {
    return [...new Set([...this.gateways.keys(), ...listRegisteredGateways()])];
  }
}

export function createNepalPay(config: CreateGatewaysOptions): NepalPay {
  return new NepalPay(config);
}
