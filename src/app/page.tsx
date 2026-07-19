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
          Documentation and demos for packages under{" "}
          <code className="font-mono text-primary">packages/</code> — including{" "}
          <span className="pkg">@itzsa/table</span>,{" "}
          <span className="pkg">@itzsa/nepali-input</span>,{" "}
          <span className="pkg">@itzsa/nepali-datepicker</span>, and{" "}
          <span className="pkg">@itzsa/editor</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" asChild>
          <Link href="/table">Table docs</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/nepali-input">Nepali input</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/nepali-datepicker">Datepicker</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/editor">Editor</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/registry">Registry</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-secondary">Install table</p>
          <CodeBlock
            language="bash"
            showPrompt
            code="pnpm add @itzsa/table"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-secondary">Install nepali-input</p>
          <CodeBlock
            language="bash"
            showPrompt
            code="pnpm add @itzsa/nepali-input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-secondary">Install nepali-datepicker</p>
          <CodeBlock
            language="bash"
            showPrompt
            code="pnpm add @itzsa/nepali-datepicker"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-secondary">Install editor</p>
          <CodeBlock
            language="bash"
            showPrompt
            code="pnpm add @itzsa/editor @itzsa/nepali-input"
          />
        </div>
      </div>
    </main>
  );
}
