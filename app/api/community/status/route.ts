import { NextResponse } from "next/server";
import { publicConfig } from "../../../../lib/community-config.cjs";
export const dynamic = "force-dynamic";
export async function GET() {
  const config = publicConfig(process.env);
  if (!config.ready)
    return NextResponse.json(
      { configured: false, authReachable: false, schema: "unknown" },
      { status: 503 },
    );
  try {
    const headers = { apikey: config.key };
    const [auth, db] = await Promise.all([
      fetch(`${config.url}/auth/v1/health`, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${config.url}/rest/v1/bitb_profiles?select=id&limit=0`, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
    ]);
    const body = await db.json().catch(() => ({}));
    const schema = ["PGRST205", "42P01"].includes(body.code)
      ? "missing"
      : body.code === "42501"
        ? "protected"
        : db.ok
          ? "reachable"
          : "unknown";
    return NextResponse.json(
      { configured: true, authReachable: auth.ok, schema },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { configured: true, authReachable: false, schema: "unknown" },
      { status: 502 },
    );
  }
}
