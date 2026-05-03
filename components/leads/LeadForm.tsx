"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadInput, LeadStatus, LeadType } from "@/types";
import { toDateInputValue } from "@/lib/utils";

const leadTypes: LeadType[] = ["School", "College", "Corporate"];
const statuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Meeting",
  "Demo",
  "Closed Won",
  "Closed Lost",
];

type FormState = Omit<LeadInput, "dealValue"> & { dealValue: string };

function createInitialState(lead?: Lead): FormState {
  return {
    name: lead?.name ?? "",
    organization: lead?.organization ?? "",
    type: lead?.type ?? "School",
    role: lead?.role ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    location: lead?.location ?? "",
    leadSource: lead?.leadSource ?? "",
    status: lead?.status ?? "New",
    priority: lead?.priority ?? "Medium",
    dealValue: String(lead?.dealValue ?? 0),
    nextFollowupDate: toDateInputValue(lead?.nextFollowupDate),
    lastContactedAt: toDateInputValue(lead?.lastContactedAt),
    notes: lead?.notes ?? "",
  };
}

export function LeadForm({
  lead,
  onSaved,
}: {
  lead?: Lead;
  onSaved?: (lead: Lead) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => createInitialState(lead));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Partial<LeadInput> = {
      ...form,
      dealValue: Number(form.dealValue || 0),
      role: form.role || null,
      phone: form.phone || null,
      email: form.email || null,
      location: form.location || null,
      leadSource: form.leadSource || null,
      nextFollowupDate: form.nextFollowupDate ? new Date(form.nextFollowupDate).toISOString() : null,
      lastContactedAt: form.lastContactedAt ? new Date(form.lastContactedAt).toISOString() : null,
      notes: form.notes || null,
    };

    const response = await fetch(lead ? `/api/leads/${lead.id}` : "/api/leads", {
      method: lead ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { lead?: Lead; error?: string };

    setSaving(false);
    if (!response.ok || !data.lead) {
      setError(data.error ?? "Unable to save lead.");
      return;
    }

    onSaved?.(data.lead);
    router.refresh();
    if (!lead) {
      setForm(createInitialState());
    }
  }

  return (
    <form onSubmit={onSubmit} className="form-grid">
      {error ? <p className="error-box">{error}</p> : null}
      <div className="form-grid form-grid--two">
        <label className="field">
          <span className="field-label">Name</span>
          <input className="input-field" value={form.name} onChange={(event) => update("name", event.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Organization</span>
          <input className="input-field" value={form.organization} onChange={(event) => update("organization", event.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Type</span>
          <select className="input-field" value={form.type} onChange={(event) => update("type", event.target.value as LeadType)}>
            {leadTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select className="input-field" value={form.status} onChange={(event) => update("status", event.target.value as LeadStatus)}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Role</span>
          <input className="input-field" value={form.role ?? ""} onChange={(event) => update("role", event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Phone</span>
          <input className="input-field" value={form.phone ?? ""} onChange={(event) => update("phone", event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input className="input-field" type="email" value={form.email ?? ""} onChange={(event) => update("email", event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Location</span>
          <input className="input-field" value={form.location ?? ""} onChange={(event) => update("location", event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Lead source</span>
          <input className="input-field" value={form.leadSource ?? ""} onChange={(event) => update("leadSource", event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Deal value</span>
          <input className="input-field" type="number" min="0" value={form.dealValue} onChange={(event) => update("dealValue", event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Next follow-up</span>
          <input className="input-field" type="date" value={form.nextFollowupDate ?? ""} onChange={(event) => update("nextFollowupDate", event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Last contacted</span>
          <input className="input-field" type="date" value={form.lastContactedAt ?? ""} onChange={(event) => update("lastContactedAt", event.target.value)} />
        </label>
      </div>
      <label className="field">
        <span className="field-label">Notes</span>
        <textarea className="input-field" rows={4} value={form.notes ?? ""} onChange={(event) => update("notes", event.target.value)} />
      </label>
      <button type="submit" disabled={saving} className="btn btn-primary">
        {saving ? "Saving..." : lead ? "Save changes" : "Add lead"}
      </button>
    </form>
  );
}
