import { NextResponse } from "next/server";
import { env } from "@/server/env";
import { syncPendingDimonaOrders } from "@/server/services/dimona-sync.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const header = request.headers.get("x-internal-secret");
  const secret = env.stripe.internalRetrySecret;

  if (!header || header !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncPendingDimonaOrders();
  return NextResponse.json(result);
}

