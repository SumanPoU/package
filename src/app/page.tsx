import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Component library</h1>
      <p className="text-muted-foreground">
        Local demos for packages under <code>packages/</code>.
      </p>
      <Link
        href="/table"
        className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Open DataTable demo →
      </Link>
    </main>
  );
}
