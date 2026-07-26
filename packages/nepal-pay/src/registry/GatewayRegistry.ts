import { ConfigError } from "../core/errors";
import type { PaymentGateway } from "../core/PaymentGateway";
import type { GatewayName, NepalPayConfig, PaymentMode } from "../core/types";
import { ConnectIpsGateway } from "../gateways/connectips/ConnectIpsGateway";
import { EsewaGateway } from "../gateways/esewa/EsewaGateway";
import { KhaltiGateway } from "../gateways/khalti/KhaltiGateway";

export interface GatewayFactoryContext {
  mode: PaymentMode;
  config: NepalPayConfig;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retries?: number;
}

export type GatewayFactory = (ctx: GatewayFactoryContext) => PaymentGateway;

const factories = new Map<GatewayName, GatewayFactory>([
  [
    "esewa",
    (ctx) => {
      if (!ctx.config.esewa) {
        throw new ConfigError(
          "esewa config is required to use the eSewa gateway",
        );
      }
      return new EsewaGateway({
        mode: ctx.mode,
        config: ctx.config.esewa,
        fetchImpl: ctx.fetchImpl,
        timeoutMs: ctx.timeoutMs,
        retries: ctx.retries,
      });
    },
  ],
  [
    "khalti",
    (ctx) => {
      if (!ctx.config.khalti) {
        throw new ConfigError(
          "khalti config is required to use the Khalti gateway",
        );
      }
      return new KhaltiGateway({
        mode: ctx.mode,
        config: ctx.config.khalti,
        fetchImpl: ctx.fetchImpl,
        timeoutMs: ctx.timeoutMs,
        retries: ctx.retries,
      });
    },
  ],
  [
    "connectips",
    (ctx) => {
      if (!ctx.config.connectips) {
        throw new ConfigError(
          "connectips config is required to use the connectIPS gateway",
        );
      }
      return new ConnectIpsGateway({
        mode: ctx.mode,
        config: ctx.config.connectips,
        fetchImpl: ctx.fetchImpl,
        timeoutMs: ctx.timeoutMs,
        retries: ctx.retries,
      });
    },
  ],
]);

/**
 * Register an additional gateway (Fonepay, IME Pay, …) without forking the SDK.
 * Built-ins can also be overridden for tests.
 */
export function registerGateway(
  name: GatewayName,
  factory: GatewayFactory,
): void {
  factories.set(name, factory);
}

export function unregisterGateway(name: GatewayName): boolean {
  if (name === "esewa" || name === "khalti" || name === "connectips") {
    // Keep builtins; allow override via registerGateway only.
    return false;
  }
  return factories.delete(name);
}

export function listRegisteredGateways(): GatewayName[] {
  return [...factories.keys()];
}

export function createGatewayFromRegistry(
  name: GatewayName,
  ctx: GatewayFactoryContext,
): PaymentGateway {
  const factory = factories.get(name);
  if (!factory) {
    throw new ConfigError(
      `Gateway "${name}" is not registered. Call registerGateway() or configure a built-in adapter.`,
    );
  }
  return factory(ctx);
}
