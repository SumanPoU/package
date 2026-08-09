import { assertRevisionMatch, validateAuthorCode } from "@itzsa/page-builder";
import { NextResponse } from "next/server";

type Body = {
  page?: unknown;
  expectedRevision?: string;
};

/**
 * Host save gate: revision check + author CSS/JS re-validation (§22 / ADR-16).
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const page = body.page as
    | { revision?: string; globalCss?: string; blocks?: unknown[] }
    | undefined;
  if (!page || typeof page !== "object") {
    return NextResponse.json({ error: "page required" }, { status: 400 });
  }

  const revision = assertRevisionMatch(page, body.expectedRevision);
  if (!revision.ok) {
    return NextResponse.json(
      {
        conflict: true,
        expectedRevision: revision.expectedRevision,
        currentRevision: revision.currentRevision,
      },
      { status: 409 },
    );
  }

  const code = validateAuthorCode(
    page as Parameters<typeof validateAuthorCode>[0],
    {
      allowedUrlOrigins: ["https://placehold.co", "https://picsum.photos"],
    },
  );
  if (!code.ok) {
    return NextResponse.json(
      {
        error: "author code rejected",
        cssErrors: code.cssErrors,
        jsErrors: code.jsErrors,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    ok: true,
    revision: page.revision,
  });
}
