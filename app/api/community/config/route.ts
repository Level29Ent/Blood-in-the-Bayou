import { NextResponse } from "next/server";
import { publicConfig } from "../../../../lib/community-config.cjs";
export const dynamic = "force-dynamic";
export function GET() {
  // Expose only explicitly validated public configuration, never admin keys.
  const config = publicConfig(process.env);
  return NextResponse.json(config, {
    status: config.ready ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
