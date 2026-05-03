import { deleteDemo, getDemo, updateDemo } from "@/lib/db";
import { jsonError } from "@/lib/utils";
import type { DemoStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const demoId = parseId(id);
  if (!demoId) {
    return jsonError("Invalid demo id.");
  }

  const demo = getDemo(demoId);
  return demo ? Response.json({ demo }) : jsonError("Demo not found.", 404);
}

export async function PUT(request: Request, context: Context) {
  return PATCH(request, context);
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const demoId = parseId(id);
  if (!demoId || !getDemo(demoId)) {
    return jsonError("Demo not found.", 404);
  }

  const body = (await request.json().catch(() => null)) as
    | Partial<{ leadId: number; demoDate: string; status: DemoStatus; notes: string | null }>
    | null;

  if (!body) {
    return jsonError("Invalid request body.");
  }

  const demo = updateDemo(demoId, body);
  return Response.json({ demo });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const demoId = parseId(id);
  if (!demoId) {
    return jsonError("Invalid demo id.");
  }

  return deleteDemo(demoId)
    ? Response.json({ ok: true })
    : jsonError("Demo not found.", 404);
}
