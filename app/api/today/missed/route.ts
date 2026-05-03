import { getTodayData } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const today = getTodayData();
  return Response.json({ overdue: today.overdue, stale: today.stale });
}
