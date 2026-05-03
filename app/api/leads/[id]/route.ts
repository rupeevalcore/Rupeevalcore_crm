import { calculatePriority } from "@/lib/priority";
import { deleteLead, getLead, updateLead } from "@/lib/db";
import { jsonError } from "@/lib/utils";
import type { LeadInput } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const leadId = parseId(id);
  if (!leadId) {
    return jsonError("Invalid lead id.");
  }

  const lead = getLead(leadId);
  return lead ? Response.json({ lead }) : jsonError("Lead not found.", 404);
}

export async function PUT(request: Request, context: Context) {
  return PATCH(request, context);
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const leadId = parseId(id);
  if (!leadId) {
    return jsonError("Invalid lead id.");
  }

  const current = getLead(leadId);
  if (!current) {
    return jsonError("Lead not found.", 404);
  }

  const input = (await request.json().catch(() => null)) as Partial<LeadInput> | null;
  if (!input) {
    return jsonError("Invalid request body.");
  }

  const merged = {
    ...current,
    ...input,
    dealValue: input.dealValue ?? current.dealValue,
    status: input.status ?? current.status,
  };
  const lead = updateLead(leadId, {
    ...input,
    priority: input.priority ?? calculatePriority(merged),
  });

  return lead ? Response.json({ lead }) : jsonError("Lead not found.", 404);
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const leadId = parseId(id);
  if (!leadId) {
    return jsonError("Invalid lead id.");
  }

  return deleteLead(leadId)
    ? Response.json({ ok: true })
    : jsonError("Lead not found.", 404);
}
