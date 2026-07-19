import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-20">
      <div className="flex flex-col gap-4">
        <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          Component library
        </p>
        <h1 className="text-4xl tracking-tight text-primary sm:text-5xl">
          itzsa
        </h1>
        <p className="max-w-xl text-base text-secondary">
          Local documentation and demos for packages under{" "}
          <code className="font-mono text-primary">packages/</code>. Start with
          the table package — installable as{" "}
          <span className="pkg">@itzsa/table</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" asChild>
          <Link href="/table">Open table docs</Link>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://www.npmjs.com/package/@itzsa/table"
            target="_blank"
            rel="noreferrer"
          >
            View on npm
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] text-secondary">Install</p>
        <CodeBlock
          language="bash"
          showPrompt
          code="pnpm add @itzsa/table"
        />
      </div>
    </main>
  );
}
