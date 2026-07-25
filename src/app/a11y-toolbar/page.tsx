import type { Metadata } from "next";

import { CodeBlock } from "@/components/code-block";
import { InstallCommand } from "@/components/install-command";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/a11y-toolbar — Accessibility preference toolbar",
  description:
    "React accessibility tools panel — text size, contrast, spacing, motion, and related reading aids with localStorage persistence.",
  path: "/a11y-toolbar",
  packageName: "@itzsa/a11y-toolbar",
  keywords: ["accessibility", "a11y", "toolbar", "preferences"],
});

const INSTALL = `pnpm add @itzsa/a11y-toolbar`;

const USAGE = `import { A11yToolbar } from "@itzsa/a11y-toolbar";
import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";
import "@itzsa/a11y-toolbar/styles.css";

// 1. FOUC script in <head> (Server Component–safe import)
<script dangerouslySetInnerHTML={{ __html: getA11yFoucScript() }} />

// 2. SSR content root — required for FOUC + scoped effects
<main data-a11y-content>{children}</main>

// 3. Mount once from a Client Component, outside the content root
<A11yToolbar position="bottom-right" accentColor="#1663d7" />`;

export default function A11yToolbarDocsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <p className="font-mono text-[12px] text-tertiary">@itzsa/a11y-toolbar</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-primary">
        Accessibility toolbar
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-secondary">
        Site preference panel for text size, contrast, spacing, motion, and
        related reading aids. Preferences persist in localStorage and apply via
        CSS under{" "}
        <code className="font-mono text-primary">[data-a11y-content]</code>. The
        floating control on this site is the live demo.
      </p>

      <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[13px] text-secondary">
        This toolbar does not make a broken page WCAG-compliant. Use semantic
        HTML, keyboard support, and sufficient contrast in your base UI.
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-primary">Install</h2>
        <div className="mt-3">
          <InstallCommand command={INSTALL} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-primary">Usage</h2>
        <p className="mt-2 text-[14px] text-secondary">
          Attributes are set on <code className="font-mono">{"<html>"}</code>.
          Effects only run inside an SSR{" "}
          <code className="font-mono">data-a11y-content</code> wrapper — do not
          add that wrapper only after hydration or FOUC prevention will fail.
        </p>
        <div className="mt-4">
          <CodeBlock code={USAGE} language="tsx" />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-primary">Defaults</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] text-secondary">
          <li>
            Hotkey <kbd className="font-mono text-primary">Alt+A</kbd> opens the
            panel (ignored in form fields). Pass{" "}
            <code className="font-mono">hotkey={"{null}"}</code> to disable —
            document overrides if AT or extensions claim the combo.
          </li>
          <li>
            Pause Animations is additive with{" "}
            <code className="font-mono">prefers-reduced-motion</code>.
          </li>
          <li>Dyslexia Friendly is spacing-only in v1 (no bundled font).</li>
          <li>
            Text Size uses content <code className="font-mono">zoom</code> so
            Tailwind utilities scale; Bigger Cursor uses a 32×32 SVG cursor.
          </li>
          <li>
            Reading Guide (pointer band) and Highlight Links match Astral/Sienna
            assist features. Panel is sectioned: Content, Color &amp; vision,
            Motion &amp; assist.
          </li>
          <li>
            Configure <code className="font-mono">position</code> and{" "}
            <code className="font-mono">accentColor</code> for brand placement.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-primary">Try it</h2>
        <p className="mt-2 text-[14px] text-secondary">
          Use the floating accessibility button (bottom-right), or press{" "}
          <kbd className="font-mono text-primary">Alt+A</kbd>. Changes apply to
          this page&apos;s content immediately.
        </p>
      </section>
    </div>
  );
}
