export function StatCard({
  label,
  value,
  helper,
  accent = false,
}: {
  label: string;
  value: string | number;
  helper: string;
  accent?: boolean;
}) {
  return (
    <div className={`card card-stat ${accent ? "card-stat--accent" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-helper">{helper}</div>
    </div>
  );
}
