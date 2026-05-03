"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Activity, ActivityType } from "@/types";

const activityTypes: ActivityType[] = ["call", "whatsapp", "email", "meeting", "demo", "note", "follow_up"];

export function LogActivityForm({
  leadId,
  onLogged,
}: {
  leadId: number;
  onLogged?: (activity: Activity) => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<ActivityType>("call");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch(`/api/activities/${leadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, description }),
    });
    const data = (await response.json()) as { activity?: Activity };
    setSaving(false);

    if (response.ok && data.activity) {
      setDescription("");
      onLogged?.(data.activity);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="card card-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">Log activity</h2>
          <p className="section-subtitle">
          Record the latest call, message, meeting, or note.
          </p>
        </div>
      </div>
      <div className="form-grid form-grid--two">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as ActivityType)}
          className="input-field"
        >
          {activityTypes.map((activityType) => (
            <option key={activityType} value={activityType}>
              {activityType}
            </option>
          ))}
        </select>
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What happened?"
          className="input-field"
          required
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary"
      >
        {saving ? "Logging..." : "Log activity"}
      </button>
    </form>
  );
}
