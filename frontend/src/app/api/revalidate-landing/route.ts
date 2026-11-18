import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const secret =
      request.headers.get("x-revalidate-secret") ||
      request.nextUrl.searchParams.get("secret");

    const expectedSecret =
      process.env.INTERNAL_REVALIDATION_SECRET || "tukodhub-internal-secret-2026";

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Invalidate root path and cache tags
    revalidatePath("/", "page");
    revalidateTag("landing-page", { expire: 0 });

    let version: string | number | undefined;
    try {
      const body = await request.json();
      version = body?.version;
    } catch {
      // Body is optional
    }

    return NextResponse.json({
      revalidated: true,
      path: "/",
      tag: "landing-page",
      version,
      now: Date.now(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Revalidation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
