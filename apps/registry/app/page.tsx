import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-medium tracking-tight">itzsa registry</h1>
      <p className="text-muted-foreground">
        Static shadcn registry for @itzsa packages. Primary install path is
        still npm. JSON items are served from{" "}
        <code className="text-sm">/r/[name].json</code>.
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        <li>
          <Link className="underline" href="/r/data-table.json">
            /r/data-table.json
          </Link>
        </li>
        <li>
          <Link className="underline" href="/r/editor.json">
            /r/editor.json
          </Link>
        </li>
        <li>
          <Link className="underline" href="/r/registry.json">
            /r/registry.json
          </Link>
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Docs UI (install commands): run the monorepo docs app on port 3000 →{" "}
        <code>/registry</code>. This app defaults to port 3001.
      </p>
    </main>
  );
}
