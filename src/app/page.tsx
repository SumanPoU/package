import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        @itzsa
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Component library</h1>
      <p className="text-muted-foreground">
        Local documentation and demos for packages under{" "}
        <code className="text-foreground">packages/</code>.
      </p>
      <Link
        href="/table"
        className="inline-flex w-fit items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50"
      >
        @itzsa/table docs →
      </Link>
    </main>
  );
}
