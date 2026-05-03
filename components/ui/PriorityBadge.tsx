import type { LeadPriority } from "@/types";

const priorityClasses: Record<LeadPriority, string> = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span className={`priority-badge ${priorityClasses[priority]}`}>
      <span className="priority-badge__dot" />
      {priority}
    </span>
  );
}
