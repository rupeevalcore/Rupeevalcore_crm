import { createDemo, getDemos, getLead } from "@/lib/db";
import { jsonError } from "@/lib/utils";
import type { DemoStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ demos: getDemos() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { leadId?: number; demoDate?: string; status?: DemoStatus; notes?: string | null }
    | null;

  if (!body?.leadId || !body.demoDate || !getLead(body.leadId)) {
    return jsonError("A valid lead and demo date are required.");
  }

  const demo = createDemo({
    leadId: body.leadId,
    demoDate: body.demoDate,
    status: body.status,
    notes: body.notes ?? null,
  });

  return Response.json({ demo }, { status: 201 });
}
