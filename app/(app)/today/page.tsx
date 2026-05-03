import { DemoRow } from "@/components/today/DemoRow";
import { SectionBlock } from "@/components/today/SectionBlock";
import { TodayRow } from "@/components/today/TodayRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTodayData } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function TodayPage() {
  const data = getTodayData();
  const missedIds = new Set(data.overdue.map((lead) => lead.id));
  const staleOnly = data.stale.filter((lead) => !missedIds.has(lead.id));

  return (
    <div className="page-stack">
      <PageHeader
        title="Today's Execution"
        meta="Live workboard"
        description="Work the highest-priority follow-ups, missed commitments, stale accounts, and scheduled demos from one screen."
      />

      {data.overdue.length === 0 && data.today.length === 0 && staleOnly.length === 0 ? (
        <EmptyState
          title="All clear for today."
          description="No missed follow-ups, due follow-ups, or stale leads need attention right now."
        />
      ) : null}

      <SectionBlock
        title="Top 3 Priority Leads"
        description="Highest value and urgency first. Work these before scanning the rest."
        count={data.pinned.length}
      >
        {data.pinned.length === 0 ? (
          <EmptyState title="No active leads yet." description="Add leads to start building the execution queue." />
        ) : (
          data.pinned.map((lead) => <TodayRow key={lead.id} lead={lead} queue="pinned" />)
        )}
      </SectionBlock>

      <div className="panel-grid panel-grid--two">
        <SectionBlock
          title="Missed Follow-ups"
          description="Follow-ups due before today that were not completed."
          count={data.overdue.length}
        >
          {data.overdue.length === 0 ? (
            <EmptyState title="No missed follow-ups." description="Every prior scheduled follow-up is clear." />
          ) : (
            data.overdue.map((lead) => <TodayRow key={lead.id} lead={lead} queue="missed" />)
          )}
        </SectionBlock>

        <SectionBlock
          title="Due Today"
          description="Scheduled follow-ups that should be closed or rescheduled today."
          count={data.today.length}
        >
          {data.today.length === 0 ? (
            <EmptyState title="Nothing due today." description="No scheduled follow-ups are due before tomorrow." />
          ) : (
            data.today.map((lead) => <TodayRow key={lead.id} lead={lead} queue="today" />)
          )}
        </SectionBlock>

        <SectionBlock
          title="Stale Leads"
          description="No contact or activity for 7+ days, excluding missed scheduled follow-ups."
          count={staleOnly.length}
        >
          {staleOnly.length === 0 ? (
            <EmptyState
              title="No stale leads."
              description="All active leads have recent contact or a missed follow-up queue entry."
            />
          ) : (
            staleOnly.map((lead) => <TodayRow key={lead.id} lead={lead} queue="stale" />)
          )}
        </SectionBlock>

        <SectionBlock
          title="Upcoming Demos"
          description="Scheduled demos that need preparation and follow-through."
          count={data.upcomingDemos.length}
        >
          {data.upcomingDemos.length === 0 ? (
            <EmptyState
              title="No upcoming demos."
              description="Schedule demos from a lead record when a prospect is ready."
            />
          ) : (
            data.upcomingDemos.map((demo) => <DemoRow key={demo.id} demo={demo} />)
          )}
        </SectionBlock>
      </div>
    </div>
  );
}
