"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Pencil, Phone, Plus, Search, Trash2, X } from "lucide-react";
import { LeadForm } from "@/components/leads/LeadForm";
import { DueStateChip } from "@/components/ui/DueStateChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { sortByPriority } from "@/lib/priority";
import { formatCurrency, formatDate, getWhatsAppUrl, startOfToday } from "@/lib/utils";
import type { Lead, LeadPriority, LeadStatus, LeadType } from "@/types";

const typeOptions: Array<"All" | LeadType> = ["All", "School", "College", "Corporate"];
const statusOptions: Array<"All" | LeadStatus> = [
  "All",
  "New",
  "Contacted",
  "Meeting",
  "Demo",
  "Closed Won",
  "Closed Lost",
];
const priorityOptions: Array<"All" | LeadPriority> = ["All", "High", "Medium", "Low"];

function followupState(lead: Lead) {
  if (!lead.nextFollowupDate) {
    return <DueStateChip state="clear" label="No follow-up" />;
  }

  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const followup = new Date(lead.nextFollowupDate);

  if (followup < today) {
    return <DueStateChip state="missed" />;
  }

  if (followup < tomorrow) {
    return <DueStateChip state="today" />;
  }

  return <DueStateChip state="upcoming" />;
}

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | LeadType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | LeadStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | LeadPriority>("All");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

  async function fetchLeads() {
    const response = await fetch("/api/leads", { cache: "no-store" });
    const data = (await response.json()) as { leads?: Lead[] };
    if (response.ok && data.leads) {
      setLeads(data.leads);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return sortByPriority(
      leads.filter((lead) => {
        const matchesSearch =
          search.length === 0 ||
          lead.name.toLowerCase().includes(search) ||
          lead.organization.toLowerCase().includes(search) ||
          lead.phone?.toLowerCase().includes(search) ||
          lead.email?.toLowerCase().includes(search) ||
          lead.location?.toLowerCase().includes(search);
        const matchesType = typeFilter === "All" || lead.type === typeFilter;
        const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
        const matchesPriority = priorityFilter === "All" || lead.priority === priorityFilter;
        return matchesSearch && matchesType && matchesStatus && matchesPriority;
      })
    );
  }, [leads, priorityFilter, query, statusFilter, typeFilter]);

  function openAddModal() {
    setEditingLead(undefined);
    setModalMode("add");
  }

  function openEditModal(lead: Lead) {
    setEditingLead(lead);
    setModalMode("edit");
  }

  function closeModal() {
    setEditingLead(undefined);
    setModalMode(null);
  }

  function clearFilters() {
    setQuery("");
    setTypeFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");
  }

  async function deleteLead(lead: Lead) {
    const confirmed = window.confirm(`Delete ${lead.name}?`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    if (response.ok) {
      await fetchLeads();
      router.refresh();
    }
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div className="toolbar-row">
          <div className="toolbar-fields">
            <label className="input-with-icon">
              <span className="input-with-icon__icon">
                <Search size={15} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search lead, organization, phone, email"
                className="input-field"
              />
            </label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as "All" | LeadType)}
              className="input-field"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "Type: All" : type}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "All" | LeadStatus)}
              className="input-field"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "Status: All" : status}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as "All" | LeadPriority)}
              className="input-field"
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === "All" ? "Priority: All" : priority}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} />
            Lead
          </button>
        </div>

        <div className="toolbar-row">
          <span className="toolbar-meta">
            Showing {filtered.length} of {leads.length} leads
          </span>
          <button type="button" onClick={clearFilters} className="btn btn-ghost">
            <X size={14} />
            Clear filters
          </button>
        </div>
      </div>

      <div className="mobile-card-list">
        {filtered.map((lead) => (
          <article key={lead.id} className="lead-card">
            <div className="lead-card__header">
              <div className="lead-card__identity">
                <a href={`/leads/${lead.id}`} className="cell-primary">
                  {lead.name}
                </a>
                <div className="cell-secondary">{lead.organization}</div>
              </div>
              <div className="lead-card__badges">
                <StatusBadge status={lead.status} />
                <PriorityBadge priority={lead.priority} />
              </div>
            </div>

            <div className="lead-card__followup">
              <div>
                <span className="card-label">Next follow-up</span>
                <div className="lead-card__value">
                  {followupState(lead)}
                  <span>{formatDate(lead.nextFollowupDate)}</span>
                </div>
              </div>
              <div>
                <span className="card-label">Phone</span>
                <div className="lead-card__value">{lead.phone ?? "No phone"}</div>
              </div>
            </div>

            <div className="lead-card__secondary">
              <TypeBadge type={lead.type} />
              <span>{formatCurrency(lead.dealValue)}</span>
            </div>

            <div className="lead-card__actions">
              <a
                aria-label={`Call ${lead.name}`}
                title={lead.phone ? "Call" : "No phone added"}
                href={lead.phone ? `tel:${lead.phone}` : undefined}
                className="btn btn-secondary"
              >
                <Phone size={15} />
                Call
              </a>
              <button
                type="button"
                aria-label={`WhatsApp ${lead.name}`}
                title={lead.phone ? "WhatsApp" : "No phone added"}
                disabled={!lead.phone}
                onClick={() => {
                  if (lead.phone) {
                    window.open(getWhatsAppUrl(lead.phone), "_blank");
                  }
                }}
                className="btn btn-secondary"
              >
                <MessageCircle size={15} />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => openEditModal(lead)}
                className="btn btn-secondary"
              >
                <Pencil size={15} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteLead(lead)}
                className="btn btn-danger"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </article>
        ))}
        {leads.length === 0 ? (
          <EmptyState
            title="No leads yet."
            description="Add the first school, college, or corporate prospect to start tracking outreach."
            action={
              <button type="button" onClick={openAddModal} className="btn btn-primary">
                Add lead
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No leads match these filters."
            description="Clear filters or search for another organization, phone, or contact."
            action={
              <button type="button" onClick={clearFilters} className="btn btn-secondary">
                Clear filters
              </button>
            }
          />
        ) : null}
      </div>

      <div className="data-table-panel data-table-panel--desktop">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Contact</th>
              <th>Next follow-up</th>
              <th>Deal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <a href={`/leads/${lead.id}`} className="cell-primary">
                    {lead.name}
                  </a>
                  <div className="cell-secondary">
                    {lead.role || lead.leadSource || "No role/source"}
                  </div>
                </td>
                <td>
                  <div className="cell-strong">{lead.organization}</div>
                  <div className="meta-list">
                    <TypeBadge type={lead.type} />
                    {lead.location ? <span>{lead.location}</span> : null}
                  </div>
                </td>
                <td>
                  <StatusBadge status={lead.status} />
                </td>
                <td>
                  <PriorityBadge priority={lead.priority} />
                </td>
                <td>
                  <div className="cell-strong">{lead.phone ?? "No phone"}</div>
                  <div className="cell-secondary">
                    {lead.email ?? "No email"}
                  </div>
                </td>
                <td>
                  <div className="field">
                    {followupState(lead)}
                    <span className="helper-text">
                      {formatDate(lead.nextFollowupDate)}
                    </span>
                  </div>
                </td>
                <td className="cell-strong">{formatCurrency(lead.dealValue)}</td>
                <td>
                  <div className="record-row__actions">
                    <a
                      aria-label={`Call ${lead.name}`}
                      title={lead.phone ? "Call" : "No phone added"}
                      href={lead.phone ? `tel:${lead.phone}` : undefined}
                      className="btn btn-secondary btn-icon"
                    >
                      <Phone size={15} />
                    </a>
                    <button
                      type="button"
                      aria-label={`WhatsApp ${lead.name}`}
                      title={lead.phone ? "WhatsApp" : "No phone added"}
                      disabled={!lead.phone}
                      onClick={() => {
                        if (lead.phone) {
                          window.open(getWhatsAppUrl(lead.phone), "_blank");
                        }
                      }}
                      className="btn btn-secondary btn-icon"
                    >
                      <MessageCircle size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${lead.name}`}
                      title="Edit"
                      onClick={() => openEditModal(lead)}
                      className="btn btn-secondary btn-icon"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${lead.name}`}
                      title="Delete"
                      onClick={() => deleteLead(lead)}
                      className="btn btn-danger btn-icon"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No leads yet."
                    description="Add the first school, college, or corporate prospect to start tracking outreach."
                    action={
                      <button type="button" onClick={openAddModal} className="btn btn-primary">
                        Add lead
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No leads match these filters."
                    description="Clear filters or search for another organization, phone, or contact."
                    action={
                      <button type="button" onClick={clearFilters} className="btn btn-secondary">
                        Clear filters
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal title={modalMode === "edit" ? "Edit lead" : "Add lead"} open={modalMode !== null} onClose={closeModal}>
        <LeadForm
          key={editingLead?.id ?? "add"}
          lead={editingLead}
          onSaved={async () => {
            await fetchLeads();
            closeModal();
          }}
        />
      </Modal>
    </div>
  );
}
