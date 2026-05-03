import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getLeads } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const leads = getLeads();
  const totalLeads = leads.length;
  const activeLeads = leads.filter((lead) => lead.status !== "Closed Won" && lead.status !== "Closed Lost");
  const wonLeads = leads.filter((lead) => lead.status === "Closed Won");
  const statusCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1;
    return acc;
  }, {});
  const activeValue = activeLeads.reduce((sum, lead) => sum + lead.dealValue, 0);
  const wonValue = wonLeads.reduce((sum, lead) => sum + lead.dealValue, 0);

  return (
    <div className="page-stack">
      <PageHeader
        title="Reports"
        meta="Performance"
        description="Simple pipeline signals for reviewing status mix, active value, and closed revenue."
      />

      {totalLeads === 0 ? (
        <EmptyState title="No report data yet." description="Add leads to see pipeline and revenue reports." />
      ) : (
        <>
          <section className="stat-grid">
            <StatCard label="Total leads" value={totalLeads} helper="All prospects" />
            <StatCard
              label="Active pipeline"
              value={activeLeads.length}
              helper={`${formatCurrency(activeValue)} open value`}
            />
            <StatCard
              label="Closed deals"
              value={wonLeads.length}
              helper={`${formatCurrency(wonValue)} won revenue`}
              accent
            />
            <StatCard
              label="Win rate"
              value={totalLeads > 0 ? `${Math.round((wonLeads.length / totalLeads) * 100)}%` : "0%"}
              helper="Won leads divided by total"
            />
          </section>

          <section className="card card-panel">
            <div className="section-header">
              <div>
                <h2 className="section-title">Lead status breakdown</h2>
                <p className="section-subtitle">Share of prospects in each workflow stage.</p>
              </div>
            </div>
            <div className="data-table-panel">
              <table className="data-table data-table--compact">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Leads</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <tr key={status}>
                      <td className="cell-strong">{status}</td>
                      <td>{count}</td>
                      <td>{Math.round((count / totalLeads) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
