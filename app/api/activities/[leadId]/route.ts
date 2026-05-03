import { createActivity, getActivities, getLead } from "@/lib/db";
import { jsonError } from "@/lib/utils";
import type { ActivityType } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ leadId: string }> };

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_request: Request, { params }: Context) {
  const { leadId } = await params;
  const id = parseId(leadId);
  if (!id || !getLead(id)) {
    return jsonError("Lead not found.", 404);
  }

  return Response.json({ activities: getActivities(id) });
}

export async function POST(request: Request, { params }: Context) {
  const { leadId } = await params;
  const id = parseId(leadId);
  if (!id || !getLead(id)) {
    return jsonError("Lead not found.", 404);
  }

  const body = (await request.json().catch(() => null)) as
    | { type?: ActivityType; description?: string; happenedAt?: string }
    | null;

  if (!body?.type || !body.description?.trim()) {
    return jsonError("Activity type and description are required.");
  }

  const activity = createActivity({
    leadId: id,
    type: body.type,
    description: body.description.trim(),
    happenedAt: body.happenedAt,
  });

  return Response.json({ activity }, { status: 201 });
}
