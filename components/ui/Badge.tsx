import type { LeadPriority, LeadStatus, LeadType } from "@/types";
import { statusLabel } from "@/lib/utils";

type BadgeTone = "gray" | "blue" | "green" | "yellow" | "orange" | "red" | "purple";

const toneClasses: Record<BadgeTone, string> = {
  gray: "badge-gray",
  blue: "badge-blue",
  green: "badge-green",
  yellow: "badge-yellow",
  orange: "badge-blue",
  red: "badge-red",
  purple: "badge-blue",
};

const statusTone: Record<LeadStatus, BadgeTone> = {
  New: "blue",
  Contacted: "yellow",
  Meeting: "orange",
  Demo: "green",
  "Closed Won": "green",
  "Closed Lost": "red",
};

const typeTone: Record<LeadType, BadgeTone> = {
  School: "blue",
  College: "purple",
  Corporate: "gray",
};

const priorityTone: Record<LeadPriority, BadgeTone> = {
  Low: "gray",
  Medium: "yellow",
  High: "red",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return <span className={`badge ${toneClasses[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabel(status)}</Badge>;
}

export function TypeBadge({ type }: { type: LeadType }) {
  return <Badge tone={typeTone[type]}>{statusLabel(type)}</Badge>;
}

export function PriorityVariantBadge({ priority }: { priority: LeadPriority }) {
  return <Badge tone={priorityTone[priority]}>{statusLabel(priority)}</Badge>;
}
