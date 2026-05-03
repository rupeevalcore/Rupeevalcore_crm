import { completeFollowup, getLead, updateLead } from "@/lib/db";
import { jsonError } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  const leadId = parseId(id);
  if (!leadId || !getLead(leadId)) {
    return jsonError("Lead not found.", 404);
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: "done" | "snooze";
    nextFollowupDate?: string | null;
  };

  const lead =
    body.action === "snooze"
      ? updateLead(leadId, { nextFollowupDate: body.nextFollowupDate ?? null, status: "Meeting" })
      : completeFollowup(leadId, body.nextFollowupDate ?? null);

  return Response.json({ lead });
}
