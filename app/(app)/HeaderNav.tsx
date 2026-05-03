"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";
import { BarChart3, CalendarDays, LayoutDashboard, Moon, Plus, Sun, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [type, setType] = useState<"School" | "College" | "Corporate">("School");
  const [phone, setPhone] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const initialTheme = storedTheme === "dark" ? "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  }

  const isActiveLink = (href: string) => pathname === href;

  async function handleQuickAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !organization.trim()) {
      setError("Name and organization are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          organization: organization.trim(),
          type,
          phone: phone.trim() || null,
          priority,
          nextFollowupDate: nextFollowupDate || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message ?? "Unable to add lead.");
        return;
      }

      setQuickAddOpen(false);
      setName("");
      setOrganization("");
      setType("School");
      setPhone("");
      setPriority("Medium");
      setNextFollowupDate("");
      setSuccessVisible(true);
      router.refresh();

      window.setTimeout(() => setSuccessVisible(false), 2000);
    } catch (err) {
      setError("Unable to add lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="top-nav__content">
      <nav className="top-nav__links">
        {navItems.map((item) => {
          const ActiveIcon = item.icon;
          const active = isActiveLink(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? "nav-link--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <ActiveIcon size={16} />
              {item.label}
            </Link>
          );
        })} 
      </nav>

      <div className="top-nav__actions">
        {successVisible ? <span className="alert-success">Lead added</span> : null}
        <button type="button" onClick={() => setQuickAddOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          Quick Add
        </button>
        <button type="button" onClick={toggleTheme} className="btn btn-secondary btn-icon">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <Modal title="+ Quick Add" open={quickAddOpen} onClose={() => setQuickAddOpen(false)}>
        <form className="form-grid" onSubmit={handleQuickAddSubmit}>
          <div className="form-grid form-grid--two">
            <label className="field">
              <span className="field-label">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input-field"
                placeholder="Name"
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Organization</span>
              <input
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                className="input-field"
                placeholder="Organization"
                required
              />
            </label>
          </div>

          <div className="form-grid form-grid--two">
            <label className="field">
              <span className="field-label">Type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as "School" | "College" | "Corporate")}
                className="input-field"
              >
                <option>School</option>
                <option>College</option>
                <option>Corporate</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as "High" | "Medium" | "Low")}
                className="input-field"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
          </div>

          <div className="form-grid form-grid--two">
            <label className="field">
              <span className="field-label">Phone</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="input-field"
                placeholder="Phone"
              />
            </label>
            <label className="field">
              <span className="field-label">Next Follow-up Date</span>
              <input
                type="date"
                value={nextFollowupDate}
                onChange={(event) => setNextFollowupDate(event.target.value)}
                className="input-field"
              />
            </label>
          </div>

          {error ? <p className="error-box">{error}</p> : null}

          <div className="page-header__actions">
            <button type="button" onClick={() => setQuickAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save lead"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
