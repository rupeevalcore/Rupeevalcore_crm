import type { LeadPriority } from "@/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function nowIso() {
  return new Date().toISOString();
}

export function toDateInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function getWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const number = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  return `https://wa.me/${number}`;
}

export function statusLabel(value: string) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function priorityRank(priority: LeadPriority) {
  const ranks: Record<LeadPriority, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return ranks[priority];
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
