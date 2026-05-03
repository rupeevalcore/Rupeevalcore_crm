import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/activities/ActivityTimeline";
import { LogActivityForm } from "@/components/activities/LogActivityForm";
import { DemoForm } from "@/components/demos/DemoForm";
import { DemoSection } from "@/components/demos/DemoSection";
import { LeadForm } from "@/components/leads/LeadForm";
import { DueStateChip } from "@/components/ui/DueStateChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { getActivities, getDemos, getLead, getLeads } from "@/lib/db";
import { formatCurrency, formatDate, formatDateTime, startOfToday } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function followupChip(value: string | null) {
  if (!value) {
    return <DueStateChip state="clear" label="No follow-up" />;
  }

  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const followup = new Date(value);

  if (followup < today) {
    return <DueStateChip state="missed" />;
  }

  if (followup < tomorrow) {
    return <DueStateChip state="today" />;
  }

  return <DueStateChip state="upcoming" />;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = getLead(Number(id));
  if (!lead) {
    notFound();
  }

  const activities = getActivities(lead.id);
  const demos = getDemos().filter((demo) => demo.leadId === lead.id);
  const scheduledDemo = demos.find((demo) => demo.status === "Scheduled");
  const leads = getLeads();

  return (
    <div className="page-stack">
      <section className="card">
        <div className="card-header">
          <div>
            <h1 className="page-title">{lead.name}</h1>
            <p className="page-subtitle">
              {lead.organization} | {lead.role || "Role not added"} | {lead.location || "Location not added"}
            </p>
          </div>
          <div className="record-row__actions">
            <TypeBadge type={lead.type} />
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-field">
            <div className="detail-field__label">Phone</div>
            <div className="detail-field__value">{lead.phone ?? "Not added"}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field__label">Email</div>
            <div className="detail-field__value">{lead.email ?? "Not added"}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field__label">Deal value</div>
            <div className="detail-field__value">{formatCurrency(lead.dealValue)}</div>
          </div>
          <div className="detail-field">
            <div className="detail-field__label">Lead source</div>
            <div className="detail-field__value">{lead.leadSource ?? "Not added"}</div>
          </div>
        </div>
      </section>

      <section className="stat-grid stat-grid--three">
        <div className="card card-stat card-stat--accent">
          <div className="stat-label">Next follow-up</div>
          <div className="stat-helper">{followupChip(lead.nextFollowupDate)}</div>
          <div className="stat-helper">{formatDate(lead.nextFollowupDate)}</div>
        </div>
        <StatCard
          label="Last contacted"
          value={formatDate(lead.lastContactedAt)}
          helper="Contact discipline marker"
        />
        <StatCard
          label="Next demo"
          value={scheduledDemo ? formatDateTime(scheduledDemo.demoDate) : "No demo scheduled"}
          helper={scheduledDemo?.status ?? "Schedule when discovery is qualified"}
        />
      </section>

      <section className="panel-grid panel-grid--two">
        <LogActivityForm leadId={lead.id} />
        <DemoForm leads={leads} leadId={lead.id} />
      </section>

      <section className="panel-grid panel-grid--asym">
        <div>
          <div className="section-header">
            <h2 className="section-title">Activity timeline</h2>
          </div>
          <ActivityTimeline activities={activities} />
        </div>
        <div>
          <div className="section-header">
            <h2 className="section-title">Demos</h2>
          </div>
          {demos.length === 0 ? (
            <EmptyState title="No demos scheduled." description="Use the demo form above when this lead is ready." />
          ) : (
            <DemoSection demos={demos} />
          )}
        </div>
      </section>

      <section className="card card-panel">
        <div className="section-header">
          <h2 className="section-title">Edit lead details</h2>
        </div>
        <LeadForm lead={lead} />
      </section>
    </div>
  );
}
