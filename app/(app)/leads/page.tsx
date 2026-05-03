import { LeadsTable } from "@/components/leads/LeadsTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLeads } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function LeadsPage() {
  const leads = getLeads();

  return (
    <div className="page-stack">
      <PageHeader
        title="Leads"
        meta="Pipeline"
        description="Track schools, colleges, corporates, outreach status, follow-up discipline, and demo readiness from one dense list."
      />
      <LeadsTable initialLeads={leads} />
    </div>
  );
}
