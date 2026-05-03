type DueStateTone = "missed" | "today" | "stale" | "upcoming" | "clear";

const labels: Record<DueStateTone, string> = {
  missed: "Missed",
  today: "Due today",
  stale: "Stale",
  upcoming: "Upcoming",
  clear: "Clear",
};

const classes: Record<DueStateTone, string> = {
  missed: "due-missed",
  today: "due-today",
  stale: "due-stale",
  upcoming: "due-upcoming",
  clear: "due-clear",
};

export function DueStateChip({
  state,
  label,
}: {
  state: DueStateTone;
  label?: string;
}) {
  return (
    <span className={`due-chip ${classes[state]}`}>
      <span className="due-chip__dot" />
      {label ?? labels[state]}
    </span>
  );
}
