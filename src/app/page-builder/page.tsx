import type { Metadata } from "next";
import { InstallCommand } from "@/components/install-command";
import { PackageJsonLd } from "@/components/package-json-ld";
import { buildPackageMetadata, getPackageByPath } from "@/lib/seo";

import { PageBuilderDemo } from "./page-builder-demo";

const entry = getPackageByPath("/page-builder")!;

export const metadata: Metadata = buildPackageMetadata(entry);

export default function PageBuilderDocsPage() {
  return (
    <>
      <PackageJsonLd entry={entry} />
      <main className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="flex max-w-3xl flex-col gap-3">
          <p className="text-[11px] font-medium tracking-[0.18em] text-secondary uppercase">
            @itzsa/page-builder
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            Page Builder
          </h1>
          <p className="text-base leading-relaxed text-secondary">
            Visual page builder with one React render path for canvas, preview,
            and open page. Author-owned CSS, first-class locales, and no
            engine-decorated skins.
          </p>
          <InstallCommand packages={["@itzsa/page-builder"]} />
          <p className="pt-2">
            <a
              href="/page-builder/create"
              className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg no-underline"
            >
              Open create builder →
            </a>
          </p>
        </header>

        <section aria-label="Interactive demo" className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-primary">Try it</h2>
          <PageBuilderDemo />
        </section>
      </main>
    </>
  );
}
