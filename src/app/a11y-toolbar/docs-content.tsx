"use client";

import { CdnUrlList } from "@/components/cdn-url-list";
import { InstallCommand } from "@/components/install-command";
import {
  BEHAVIOR_ROWS,
  BROWSER_API,
  DISPLAY_FEATURES,
  HEADLESS_API,
  I18N_PROPS,
  MOTION_FEATURES,
  PLACEMENT_PROPS,
  THEME_PROPS,
  TOOLBAR_PROPS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import {
  CDN_CSS,
  CDN_JS,
  FEATURES_FLAG,
  I18N_SYNC,
  JSDELIVR_CSS,
  JSDELIVR_JS,
  STARTER,
  WP_HTML,
  WP_PHP,
} from "./examples";
import { DOC_NAV } from "./nav";

export function DocsContent() {
  return (
    <DocsShell>
      <div className="flex flex-col gap-8 sm:gap-14">
        <header
          id="introduction"
          className="scroll-mt-28 flex flex-col gap-3 border-b-[0.5px] border-border pb-6 sm:pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
            Documentation · itzsa
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            A11y Toolbar
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Floating preference panel for text size, contrast, spacing, motion,
            and reading aids. Preferences persist in localStorage and apply via
            CSS under{" "}
            <code className="font-mono text-primary">[data-a11y-content]</code>.
            The floating control on this site is the live demo.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/a11y-toolbar
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              React 18 / 19
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              i18n · FOUC
            </span>
          </div>
        </header>

        <nav aria-label="Jump to" className="flex flex-wrap gap-2 lg:hidden">
          {DOC_NAV.filter((n) => !n.indent).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1 text-xs text-secondary hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Callout title="Scope">
          This toolbar is{" "}
          <strong className="font-medium text-primary">
            WCAG-grounded chrome
          </strong>{" "}
          — dialog patterns, focus, live regions, spacing presets. It does{" "}
          <strong className="font-medium text-primary">not</strong> make an
          inaccessible host page WCAG-compliant. Keep semantic HTML, keyboard
          support, and contrast in your base UI.
        </Callout>

        <DocSection
          id="installation"
          title="Installation"
          description="Add the package and import styles. Load Outfit / Poppins / Noto Sans Devanagari in the host for locale fonts."
        >
          <InstallCommand packages="@itzsa/a11y-toolbar" />
          <Callout title="Peers">
            Peer deps: <code className="font-mono text-primary">react</code> and{" "}
            <code className="font-mono text-primary">react-dom</code> ^18 or
            ^19.
          </Callout>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-secondary">
              Prefer a script tag instead of npm? Copy a CDN URL (same assets as{" "}
              <a
                href="#wordpress"
                className="text-accent underline-offset-2 hover:underline"
              >
                WordPress / CDN
              </a>
              ):
            </p>
            <CdnUrlList
              assets={[
                { label: "CSS", url: CDN_CSS },
                { label: "JS", url: CDN_JS },
              ]}
            />
          </div>
        </DocSection>

        <DocSection
          id="getting-started"
          title="Getting started"
          description="Three pieces: FOUC script in head, SSR content wrapper, Client Component mount outside that wrapper."
        >
          <CodeBlock code={STARTER} language="tsx" />
          <Callout title="Try it">
            Use the floating accessibility button, or press{" "}
            <kbd className="font-mono text-primary">Alt+A</kbd>. Open Language
            in the header to switch English / नेपाली.
          </Callout>
        </DocSection>

        <DocSection
          id="features"
          title="Features"
          description="Defined in A11Y_FEATURE_REGISTRY. Hide any control with the features prop."
        >
          <CodeBlock code={FEATURES_FLAG} language="tsx" />
          <div className="flex flex-col gap-10">
            <DocSection
              id="features-display"
              level={3}
              title="Display"
              description="Text, contrast, filters, and link/image aids."
            >
              <PropsTable caption="Display controls" rows={DISPLAY_FEATURES} />
            </DocSection>
            <DocSection
              id="features-motion"
              level={3}
              title="Motion & assist"
              description="Motion reduction and pointer reading aids."
            >
              <PropsTable caption="Motion & assist" rows={MOTION_FEATURES} />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="props"
          title="Props API"
          description="Public surface of A11yToolbar. Theme and i18n are nested props."
        >
          <div className="flex flex-col gap-10">
            <DocSection
              id="props-toolbar"
              level={3}
              title="A11yToolbar"
              description="Core open state, storage, hotkey, and feature flags."
            >
              <PropsTable caption="A11yToolbarProps" rows={TOOLBAR_PROPS} />
            </DocSection>

            <DocSection
              id="props-theme"
              level={3}
              title="theme"
              description="Chrome colors and fonts. Header pair defaults clear ~4.9:1; keep brand accent for launcher/icons."
            >
              <PropsTable caption="A11yToolbarTheme" rows={THEME_PROPS} />
            </DocSection>

            <DocSection
              id="props-i18n"
              level={3}
              title="i18n"
              description="English by default. Resolution: en → locales[active] → messages. Panel sets lang={locale}."
            >
              <PropsTable caption="Locale props" rows={I18N_PROPS} />
              <CodeBlock code={I18N_SYNC} language="tsx" />
              <Callout title="Fonts">
                Defaults: English → Outfit, Nepali → Poppins, with Noto Sans
                Devanagari fallbacks so names like नेपाली render. Override with{" "}
                <code className="font-mono text-accent">fontFamily</code> or{" "}
                <code className="font-mono text-accent">
                  fontFamilyByLocale
                </code>
                .
              </Callout>
            </DocSection>

            <DocSection
              id="props-placement"
              level={3}
              title="Placement & size"
              description="position places the launcher; panelAlign places the panel horizontally; height props size the dialog."
            >
              <PropsTable caption="Placement" rows={PLACEMENT_PROPS} />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="behavior"
          title="Behavior & a11y"
          description="Chrome patterns grounded in WCAG / APG. See package BEHAVIOR.md for control-level detail."
        >
          <PropsTable caption="Behavior" rows={BEHAVIOR_ROWS} />
          <Callout title="Known risks">
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>
                Default hotkey <kbd className="font-mono">Alt+A</kbd> may clash
                with screen readers — remap or disable as needed.
              </li>
              <li>
                Stepped cards use dash indicators; full level names live in the
                accessible name + live region.
              </li>
              <li>
                Launcher focus-ring contrast on dark host backgrounds is
                host-dependent — verify in your theme.
              </li>
            </ul>
          </Callout>
        </DocSection>

        <DocSection
          id="headless"
          title="Headless / FOUC"
          description="Server-safe helpers live on @itzsa/a11y-toolbar/headless — do not import the React entry from RSC layouts."
        >
          <PropsTable caption="Headless exports" rows={HEADLESS_API} />
          <Callout title="FOUC">
            Prefs attrs and{" "}
            <code className="font-mono text-accent">data-a11y-locale</code> are
            set before paint. Translated chrome strings resolve in React — for
            SSR-safe locale copy, pass controlled{" "}
            <code className="font-mono text-accent">locale</code> from the host.
          </Callout>
        </DocSection>

        <DocSection
          id="wordpress"
          title="WordPress / CDN"
          description="Minified IIFE with React bundled — use on classic WordPress, Webflow, or any static HTML site without a React build."
        >
          <PropsTable caption="window.ItzsaA11yToolbar" rows={BROWSER_API} />
          <div className="flex flex-col gap-3">
            <p className="text-sm text-secondary">
              Hosted on this docs site — copy a URL and paste into{" "}
              <code className="font-mono text-accent">&lt;link&gt;</code> /{" "}
              <code className="font-mono text-accent">&lt;script&gt;</code>.
            </p>
            <CdnUrlList
              assets={[
                { label: "CSS", url: CDN_CSS },
                { label: "JS", url: CDN_JS },
              ]}
            />
            <p className="text-sm text-secondary">
              After the package is on npm, jsDelivr mirrors{" "}
              <code className="font-mono text-accent">dist/</code> (pin a
              version in production instead of{" "}
              <code className="font-mono text-accent">@latest</code>).
            </p>
            <CdnUrlList
              assets={[
                { label: "jsDelivr CSS", url: JSDELIVR_CSS },
                { label: "jsDelivr JS", url: JSDELIVR_JS },
              ]}
            />
          </div>
          <CodeBlock code={WP_HTML} language="html" />
          <CodeBlock code={WP_PHP} language="php" />
          <Callout title="Content root">
            Put your page content in an element with{" "}
            <code className="font-mono text-accent">data-a11y-content</code>, or
            pass{" "}
            <code className="font-mono text-accent">contentRoot: true</code> to
            stamp it on{" "}
            <code className="font-mono text-accent">&lt;body&gt;</code>. Prefer
            printing{" "}
            <code className="font-mono text-accent">getA11yFoucScript()</code>{" "}
            in <code className="font-mono text-accent">&lt;head&gt;</code> to
            avoid preference flash.
          </Callout>
        </DocSection>
      </div>
    </DocsShell>
  );
}
