"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, MessageCircle, NotebookPen, Phone } from "lucide-react";
import { DueStateChip } from "@/components/ui/DueStateChip";
import { StatusBadge } from "@/components/ui/Badge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { ActivityType, Lead } from "@/types";
import { addDays, formatCurrency, formatDate, startOfToday, statusLabel } from "@/lib/utils";

type QueueType = "pinned" | "missed" | "today" | "stale";

const quickActivityTypes: ActivityType[] = ["call", "whatsapp", "email", "meeting", "note"];

function whatsappHref(phone: string | null) {
  if (!phone) {
    return undefined;
  }

  const digits = phone.replace(/\D/g, "").replace(/^91/, "");
  return digits ? `https://wa.me/91${digits}` : undefined;
}

function dueStateFor(queue: QueueType) {
  if (queue === "missed") {
    return "missed";
  }

  if (queue === "today") {
    return "today";
  }

  if (queue === "stale") {
    return "stale";
  }

  return "upcoming";
}

export function TodayRow({ lead, queue }: { lead: Lead; queue: QueueType }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [activityNote, setActivityNote] = useState("");
  const dueState = dueStateFor(queue);

  async function updateFollowup(action: "done" | "snooze") {
    setBusy(true);
    const nextFollowupDate =
      action === "snooze" ? addDays(startOfToday(), 1).toISOString() : null;

    const response = await fetch(`/api/leads/${lead.id}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, nextFollowupDate }),
    });

    setBusy(false);
    if (response.ok) {
      setHidden(true);
      router.refresh();
    }
  }

  async function logActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    const description =
      activityNote.trim() ||
      `${statusLabel(activityType)} logged from Today's Execution.`;

    const response = await fetch(`/api/activities/${lead.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activityType, description }),
    });

    setBusy(false);
    if (response.ok) {
      setActivityNote("");
      setLogOpen(false);
      router.refresh();
    }
  }

  if (hidden) {
    return null;
  }

  return (
    <div className={`record-row ${queue === "pinned" ? "record-row--emphasis" : ""}`}>
      <div className="record-row__main">
        <div className="record-row__title-line">
          <a href={`/leads/${lead.id}`} className="record-row__title">
            {lead.name}
          </a>
          <DueStateChip state={dueState} />
          <PriorityBadge priority={lead.priority} />
          <StatusBadge status={lead.status} />
        </div>
        <div className="record-row__meta meta-list">
          <span>{lead.organization}</span>
          <span>{lead.type}</span>
          <span>{lead.phone || lead.email || "No contact"}</span>
        </div>
        <div className="record-row__meta meta-list">
          <span className="meta-pill">Deal {formatCurrency(lead.dealValue)}</span>
          <span className="meta-pill">Next {formatDate(lead.nextFollowupDate)}</span>
          <span className="meta-pill">Last {formatDate(lead.lastContactedAt)}</span>
        </div>
      </div>

      <div className="record-row__actions">
        <a
          aria-label={`Call ${lead.name}`}
          title={lead.phone ? "Call" : "No phone added"}
          href={lead.phone ? `tel:${lead.phone}` : undefined}
          className="btn btn-secondary btn-icon"
        >
          <Phone size={15} />
        </a>
        <a
          aria-label={`WhatsApp ${lead.name}`}
          title={lead.phone ? "WhatsApp" : "No phone added"}
          href={whatsappHref(lead.phone)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-icon"
        >
          <MessageCircle size={15} />
        </a>
        <button
          type="button"
          title="Log activity"
          disabled={busy}
          onClick={() => setLogOpen((current) => !current)}
          className="btn btn-secondary btn-icon"
        >
          <NotebookPen size={15} />
        </button>
        <button
          type="button"
          title="Mark follow-up done"
          disabled={busy}
          onClick={() => updateFollowup("done")}
          className="btn btn-primary"
        >
          <Check size={15} />
          Done
        </button>
        <button
          type="button"
          title="Snooze to tomorrow"
          disabled={busy}
          onClick={() => updateFollowup("snooze")}
          className="btn btn-secondary"
        >
          <Clock size={15} />
          Snooze
        </button>
      </div>

      {logOpen ? (
        <form className="quick-form" onSubmit={logActivity}>
          <div className="quick-form__row">
            <select
              value={activityType}
              onChange={(event) => setActivityType(event.target.value as ActivityType)}
              className="input-field"
            >
              {quickActivityTypes.map((type) => (
                <option key={type} value={type}>
                  {statusLabel(type)}
                </option>
              ))}
            </select>
            <input
              value={activityNote}
              onChange={(event) => setActivityNote(event.target.value)}
              placeholder="Optional note"
              className="input-field"
            />
            <button type="submit" disabled={busy} className="btn btn-primary">
              Save log
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
