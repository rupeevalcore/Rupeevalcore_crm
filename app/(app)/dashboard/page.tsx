import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getDashboardData, getTodayData } from "@/lib/db";
import { formatCurrency, formatDateTime, statusLabel } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function truncate(value: string, length = 80) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

export default function DashboardPage() {
  const data = getDashboardData();
  const today = getTodayData();
  const lastActivity = data.recentActivity[0]?.happenedAt;

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        meta="Pipeline control"
        description="A compact read on pipeline health, revenue, demo movement, and the newest sales activity."
      />

      <section className="stat-grid">
        <StatCard label="Total leads" value={data.pipeline.totalLeads} helper="All prospects in CRM" />
        <StatCard
          label="Active leads"
          value={data.pipeline.activeLeads}
          helper={`${today.overdue.length} missed follow-ups`}
          accent
        />
        <StatCard
          label="Demos scheduled"
          value={data.pipeline.demosScheduled}
          helper={`${today.upcomingDemos.length} upcoming`}
        />
        <StatCard label="Deals closed" value={data.pipeline.dealsClosed} helper="Closed Won leads" />
      </section>

      <section className="stat-grid stat-grid--three">
        <StatCard
          label="Pipeline value"
          value={formatCurrency(data.revenue.totalPipelineValue)}
          helper="Open and won value"
        />
        <StatCard
          label="Revenue closed"
          value={formatCurrency(data.revenue.revenueClosed)}
          helper="Closed Won value"
          accent
        />
        <StatCard
          label="Average deal"
          value={formatCurrency(data.revenue.avgDealSize)}
          helper="Closed Won average"
        />
      </section>

      <section className="panel-grid panel-grid--two">
        <div className="card card-panel">
          <div className="section-header">
            <div>
              <h2 className="section-title">Leads by status</h2>
              <p className="section-subtitle">Workflow distribution from New to Closed.</p>
            </div>
            <span className="helper-text">
              {lastActivity ? `Last activity ${formatDateTime(lastActivity)}` : "No activity yet"}
            </span>
          </div>
          <div className="stat-grid">
            {data.leadsByStatus.map((status) => (
              <StatCard key={status.label} label={status.label} value={status.count} helper="Current leads" />
            ))}
          </div>
        </div>

        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="section-title">Recent activity</h2>
              <p className="section-subtitle">Latest logged sales work across leads.</p>
            </div>
            <span className="badge badge-gray">{data.recentActivity.length}</span>
          </div>
          {data.recentActivity.length === 0 ? (
            <div className="card-body">
              <EmptyState
                title="No activity logged yet."
                description="Activity appears here after calls, notes, emails, or demos are logged."
              />
            </div>
          ) : (
            <div className="activity-feed">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div>
                    <div className="activity-item__title">
                      {statusLabel(activity.type)} | {activity.leadName}
                    </div>
                    <div className="activity-item__description">{truncate(activity.description)}</div>
                  </div>
                  <span className="activity-item__time">{formatDateTime(activity.happenedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
