import { NextResponse } from "next/server";

import { putMedia } from "@/app/page-builder/media-store";

const MAX_BYTES = 2_000_000;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

/** Demo CDN upload — returns a same-origin media URL. */
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `unsupported type ${file.type}` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const row = putMedia(file.type, bytes);
  const url = new URL(`/api/page-builder/media/${row.id}`, request.url);

  return NextResponse.json({ url: url.pathname, id: row.id });
}
