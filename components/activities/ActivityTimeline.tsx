import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Activity } from "@/types";
import { formatDateTime, statusLabel } from "@/lib/utils";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activities logged yet."
        description="Calls, WhatsApp messages, demos, and notes will appear here in chronological order."
      />
    );
  }

  return (
    <div className="timeline">
      {activities.map((activity) => (
        <div key={activity.id} className="timeline-item">
          <span className="timeline-item__dot" />
          <div>
            <div className="timeline-item__header">
              <Badge tone="blue">{statusLabel(activity.type)}</Badge>
              <span className="timeline-item__time">
                {formatDateTime(activity.happenedAt)}
              </span>
            </div>
            <p className="timeline-item__description">{activity.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
