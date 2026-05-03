"use client";

import { useState } from "react";
import type { Demo, DemoStatus, Lead } from "@/types";

const statuses: DemoStatus[] = ["Scheduled", "Completed", "Converted", "Not Converted"];

export function DemoForm({
  leads,
  leadId,
  onSaved,
}: {
  leads: Lead[];
  leadId?: number;
  onSaved?: (demo: Demo) => void;
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(leadId ?? leads[0]?.id ?? 0);
  const [demoDate, setDemoDate] = useState("");
  const [status, setStatus] = useState<DemoStatus>("Scheduled");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/demos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: selectedLeadId,
        demoDate: new Date(demoDate).toISOString(),
        status,
        notes: notes || null,
      }),
    });
    const data = (await response.json()) as { demo?: Demo };
    setSaving(false);

    if (response.ok && data.demo) {
      setDemoDate("");
      setNotes("");
      onSaved?.(data.demo);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card card-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">Schedule demo</h2>
          <p className="section-subtitle">
            Track demo commitments and outcomes against this lead.
          </p>
        </div>
      </div>
      <div className="form-grid form-grid--three">
        <select
          value={selectedLeadId}
          onChange={(event) => setSelectedLeadId(Number(event.target.value))}
          className="input-field"
          disabled={Boolean(leadId)}
        >
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={demoDate}
          onChange={(event) => setDemoDate(event.target.value)}
          className="input-field"
          required
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as DemoStatus)}
          className="input-field"
        >
          {statuses.map((demoStatus) => (
            <option key={demoStatus} value={demoStatus}>
              {demoStatus}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Demo notes"
        className="input-field"
      />
      <button
        type="submit"
        disabled={saving || selectedLeadId === 0}
        className="btn btn-primary"
      >
        {saving ? "Saving..." : "Schedule demo"}
      </button>
    </form>
  );
}
