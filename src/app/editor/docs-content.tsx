"use client";

import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { EditorDemo } from "./examples";

const INSTALL = `pnpm add @itzsa/editor @itzsa/nepali-input
# or: npm install @itzsa/editor @itzsa/nepali-input`;

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

export function DocsContent() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <div className="mb-10 flex flex-col gap-3">
        <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          editor
        </p>
        <h1 className="text-3xl tracking-tight text-primary sm:text-4xl">
          <span className="pkg">@itzsa/editor</span>
        </h1>
        <p className="max-w-xl text-base text-secondary">
          Company-standard TipTap editor — toolbar, HTML mode, tables/media,
          Nepali Unicode/Preeti, language lock, and sanitized HTML/URL ingress.
        </p>
      </div>

      <section className="mb-12 flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Install</h2>
        <CodeBlock language="bash" showPrompt code={INSTALL} />
        <CodeBlock language="css" code={CSS_SETUP} />
      </section>

      <section className="mb-12 flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Live demo</h2>
        <EditorDemo />
      </section>

      <section className="mb-12 flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Starter</h2>
        <CodeBlock language="tsx" code={STARTER} />
      </section>

      <section className="mb-12 flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Uploads</h2>
        <p className="text-sm text-secondary">
          Files are never inlined as base64. Pass{" "}
          <code className="font-mono text-primary">onUpload</code> (or{" "}
          <code className="font-mono text-primary">settings.media.onUpload</code>
          ) that returns a durable <code className="font-mono text-primary">https://</code>{" "}
          CDN URL. URL paste still works without an uploader.
        </p>
      </section>

      <section className="mb-12 flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Security</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-secondary">
          <li>HTML sanitizer on value, paste, and HTML mode</li>
          <li>
            URL allowlist — blocks <code className="font-mono text-primary">javascript:</code>,{" "}
            <code className="font-mono text-primary">data:</code> (unless{" "}
            <code className="font-mono text-primary">allowBase64</code>), and{" "}
            <code className="font-mono text-primary">//</code> phishing URLs
          </li>
          <li>Safe CSS lengths only for width / font-size</li>
          <li>Video via schema node — no HTML string injection</li>
          <li>
            Prefer <code className="font-mono text-primary">onUpload</code> for production media
          </li>
        </ul>
        <p className="text-sm text-secondary">
          Still sanitize when rendering stored HTML with{" "}
          <code className="font-mono text-primary">dangerouslySetInnerHTML</code>. See{" "}
          <Link
            href="https://github.com/SumanPoU/package/tree/main/packages/editor"
            className="text-accent underline-offset-2 hover:underline"
          >
            package README
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Key props</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-secondary">
          <li>
            <code className="font-mono text-primary">ref</code> — getHTML, getJSON, setContent,
            clear, focus
          </li>
          <li>
            <code className="font-mono text-primary">nepali</code> — unicode | preeti | false
          </li>
          <li>
            <code className="font-mono text-primary">readOnly</code> /{" "}
            <code className="font-mono text-primary">disabled</code> /{" "}
            <code className="font-mono text-primary">maxLength</code>
          </li>
          <li>
            <code className="font-mono text-primary">toolbar</code> /{" "}
            <code className="font-mono text-primary">locale</code> /{" "}
            <code className="font-mono text-primary">classNames</code>
          </li>
          <li>
            <code className="font-mono text-primary">onUpload</code> /{" "}
            <code className="font-mono text-primary">allowBase64</code>
          </li>
        </ul>
      </section>
    </main>
  );
}
