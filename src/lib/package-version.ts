import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Read package version from monorepo package.json (Node-only).
 * Keep this out of `@/lib/seo` so client modules can import SITE_URL safely.
 */
export function getLocalPackageVersion(packageName: string): string {
  try {
    const dir = packageName.replace("@itzsa/", "");
    const raw = readFileSync(
      join(process.cwd(), "packages", dir, "package.json"),
      "utf8",
    );
    const version = (JSON.parse(raw) as { version?: string }).version;
    return version?.trim() || "latest";
  } catch {
    return "latest";
  }
}
