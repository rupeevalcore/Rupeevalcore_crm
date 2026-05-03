import { CalendarClock } from "lucide-react";
import { DueStateChip } from "@/components/ui/DueStateChip";
import type { Demo } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function DemoRow({ demo }: { demo: Demo }) {
  return (
    <div
      className="record-row record-row--media"
    >
      <div
        className="btn btn-secondary btn-icon"
      >
        <CalendarClock size={17} />
      </div>
      <div className="record-row__main">
        <div className="record-row__title-line">
          <span className="record-row__title">
            {demo.leadName ?? `Lead #${demo.leadId}`}
          </span>
          <DueStateChip state="upcoming" />
        </div>
        <div className="record-row__meta meta-list">
          <span>{demo.organization ?? "Demo"}</span>
          <span>{formatDateTime(demo.demoDate)}</span>
          <span>{demo.status}</span>
        </div>
      </div>
    </div>
  );
}
