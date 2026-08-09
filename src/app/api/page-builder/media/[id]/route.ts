import { NextResponse } from "next/server";

import { getMedia } from "@/app/page-builder/media-store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const row = getMedia(id);
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(row.bytes), {
    status: 200,
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
