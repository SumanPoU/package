"use client";

import Link from "next/link";

import { InstallCommand } from "@/components/install-command";
import {
  CLASSNAMES_PROPS,
  EDITOR_PROPS,
  HANDLE_PROPS,
  MEDIA_PROPS,
  SECURITY_HELPERS,
  SETTINGS_PROPS,
  TOOLBAR_PROPS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import { EditorDemo } from "./examples";
import { DOC_NAV } from "./nav";

const CSS_SETUP = `@source "../node_modules/@itzsa/editor";
@import "@itzsa/editor/styles.css";`;

const STARTER = `"use client";

import { useState } from "react";
import {
  RichTextEditor,
  type EditorUploadHandler,
} from "@itzsa/editor";
import "@itzsa/editor/styles.css";

const onUpload: EditorUploadHandler = async (file, { signal, onProgress }) => {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body, signal });
  if (!res.ok) throw new Error("Upload failed");
  onProgress({ ratio: 1 });
  const { url } = await res.json();
  return url; // https://cdn.example.com/...
};

export function Example() {
  const [html, setHtml] = useState("<p>Hello</p>");

  return (
    <RichTextEditor
      value={html}
      onChange={setHtml}
      onUpload={onUpload}
      settings={{
        nepali: "unicode",
        maxLength: 5000,
        media: { maxImageBytes: 5_000_000 },
      }}
    />
  );
}`;

const SETTINGS_EXAMPLE = `settings={{
  nepali: "unicode",
  maxLength: 5000,
  compact: true,
  showStatusBar: true,
  allowHtmlMode: true,
  sanitize: true,
  toolbar: { video: false, html: false },
  media: {
    onUpload,
    maxImageBytes: 5_000_000,
    maxVideoBytes: 50_000_000,
    allowUrlInsert: true,
  },
  locale: { placeholder: "लेख्नुहोस्…" },
  classNames: { root: "my-editor" },
}}`;

export function DocsContent() {
  return (
    <DocsShell>
      <div className="flex flex-col gap-14">
        <header
          id="introduction"
          className="scroll-mt-28 flex flex-col gap-3 border-b-[0.5px] border-border pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
            Documentation · itzsa
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            Editor
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            TipTap rich text editor with toolbar, HTML mode, tables and media,
            Nepali Unicode/Preeti, language lock, and sanitized HTML/URL
            ingress.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/editor
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              TipTap
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              Unicode / Preeti
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

        <DocSection
          id="installation"
          title="Installation"
          description="Peer-friendly TipTap editor. Add nepali-input when using Nepali modes."
        >
          <InstallCommand packages={["@itzsa/editor", "@itzsa/nepali-input"]} />
          <CodeBlock language="css" code={CSS_SETUP} />
        </DocSection>

        <DocSection id="demo" title="Live demo">
          <EditorDemo />
        </DocSection>

        <DocSection
          id="starter"
          title="Starter"
          description="Controlled HTML plus a host-owned upload handler."
        >
          <CodeBlock language="tsx" code={STARTER} />
        </DocSection>

        <DocSection
          id="uploads"
          title="Uploads"
          description="Files are never inlined as base64."
        >
          <p className="text-sm leading-relaxed text-secondary">
            Pass{" "}
            <code className="font-mono text-primary">onUpload</code> or{" "}
            <code className="font-mono text-primary">
              settings.media.onUpload
            </code>{" "}
            that returns a durable{" "}
            <code className="font-mono text-primary">https://</code> CDN URL.
            URL paste still works without an uploader when{" "}
            <code className="font-mono text-primary">allowUrlInsert</code> is
            true.
          </p>
          <PropsTable caption="settings.media" rows={MEDIA_PROPS} />
        </DocSection>

        <DocSection
          id="settings"
          title="Settings"
          description="Prefer the settings bag for production wiring; flat props still merge."
        >
          <CodeBlock language="tsx" code={SETTINGS_EXAMPLE} />
          <PropsTable caption="EditorSettings" rows={SETTINGS_PROPS} />
        </DocSection>

        <DocSection
          id="security"
          title="Security"
          description="Sanitization on ingress — still sanitize again when rendering stored HTML."
        >
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-secondary">
            <li>HTML sanitizer on value, paste, and HTML mode</li>
            <li>
              URL allowlist — blocks{" "}
              <code className="font-mono text-primary">javascript:</code>,{" "}
              <code className="font-mono text-primary">data:</code> (unless
              explicitly allowed), and protocol-relative phishing URLs
            </li>
            <li>Safe CSS lengths only for width / font-size</li>
            <li>Video via schema node — no HTML string injection</li>
            <li>
              Prefer <code className="font-mono text-primary">onUpload</code>{" "}
              for production media
            </li>
          </ul>
          <Callout title="Rendering">
            Sanitize again before{" "}
            <code className="font-mono text-primary">
              dangerouslySetInnerHTML
            </code>
            . See the{" "}
            <Link
              href="https://github.com/SumanPoU/package/tree/main/packages/editor"
              className="text-accent underline-offset-2 hover:underline"
            >
              package README
            </Link>
            .
          </Callout>
          <PropsTable caption="Security helpers" rows={SECURITY_HELPERS} />
        </DocSection>

        <DocSection
          id="props"
          title="Props API"
          description="Full prop tables for RichTextEditor, toolbar, classNames, and the ref handle."
        >
          <div className="flex flex-col gap-10">
            <DocSection
              id="props-editor"
              level={3}
              title="RichTextEditor"
              description="Top-level component props. Flat props merge with settings."
            >
              <PropsTable
                caption="RichTextEditorProps"
                rows={EDITOR_PROPS}
              />
            </DocSection>

            <DocSection
              id="props-toolbar"
              level={3}
              title="Toolbar features"
              description="Pass via toolbar or settings.toolbar."
            >
              <PropsTable
                caption="EditorToolbarFeatures"
                rows={TOOLBAR_PROPS}
              />
            </DocSection>

            <DocSection
              id="props-classnames"
              level={3}
              title="Class names"
              description="Slot class names for chrome regions."
            >
              <PropsTable
                caption="EditorClassNames"
                rows={CLASSNAMES_PROPS}
              />
            </DocSection>

            <DocSection
              id="props-handle"
              level={3}
              title="Ref handle"
              description="Imperative API via ref."
            >
              <PropsTable
                caption="RichTextEditorHandle"
                rows={HANDLE_PROPS}
              />
            </DocSection>
          </div>
        </DocSection>
      </div>
    </DocsShell>
  );
}
