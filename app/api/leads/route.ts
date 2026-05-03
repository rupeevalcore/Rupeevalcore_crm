import { calculatePriority } from "@/lib/priority";
import { createLead, getLeads } from "@/lib/db";
import { jsonError } from "@/lib/utils";
import type { LeadInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ leads: getLeads() });
}

export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as Partial<LeadInput> | null;

  if (!input?.name?.trim() || !input.organization?.trim()) {
    return jsonError("Lead name and organization are required.");
  }

  const lead = createLead({
    ...input,
    priority:
      input.priority ??
      calculatePriority({
        dealValue: input.dealValue ?? 0,
        nextFollowupDate: input.nextFollowupDate ?? null,
        lastContactedAt: input.lastContactedAt ?? null,
        status: input.status ?? "New",
      }),
  });

  return Response.json({ lead }, { status: 201 });
}
