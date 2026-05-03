import type { Lead, LeadInput, LeadPriority } from "@/types";
import { startOfToday } from "@/lib/utils";

type PrioritySource = Pick<
  Lead | LeadInput,
  "dealValue" | "nextFollowupDate" | "lastContactedAt" | "status"
>;

export function calculatePriority(lead: PrioritySource): LeadPriority {
  const today = startOfToday();
  const followup = lead.nextFollowupDate ? new Date(lead.nextFollowupDate) : null;
  const lastContacted = lead.lastContactedAt ? new Date(lead.lastContactedAt) : null;

  if (lead.status === "Demo" || (followup && followup < today)) {
    return "High";
  }

  if ((followup && followup.toDateString() === today.toDateString()) || lead.dealValue >= 100000) {
    return "High";
  }

  if (!lastContacted || today.getTime() - lastContacted.getTime() > 7 * 24 * 60 * 60 * 1000) {
    return "Medium";
  }

  return "Low";
}

export function priorityScore(priority: LeadPriority) {
  const scores: Record<LeadPriority, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return scores[priority];
}

export function sortByPriority<T extends { priority: LeadPriority }>(items: T[]) {
  return [...items].sort((left, right) => priorityScore(right.priority) - priorityScore(left.priority));
}

export const priorityOptions: LeadPriority[] = ["High", "Medium", "Low"];
