import { createActivity, getActivities, getLead } from "@/lib/db";
import { jsonError } from "@/lib/utils";
import type { ActivityType } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ activities: getActivities() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { leadId?: number; type?: ActivityType; description?: string; happenedAt?: string }
    | null;

  if (!body?.leadId || !body.type || !body.description?.trim() || !getLead(body.leadId)) {
    return jsonError("A valid lead, activity type, and description are required.");
  }

  const activity = createActivity({
    leadId: body.leadId,
    type: body.type,
    description: body.description.trim(),
    happenedAt: body.happenedAt,
  });

  return Response.json({ activity }, { status: 201 });
}
