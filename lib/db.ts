import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type {
  Activity,
  ActivityType,
  DashboardActivity,
  DashboardData,
  Demo,
  DemoStatus,
  Lead,
  LeadInput,
  LeadPriority,
  LeadStatus,
  LeadType,
  TodayData,
  User,
} from "@/types";
import { addDays, nowIso, startOfToday } from "@/lib/utils";

type LeadRow = {
  id: number;
  name: string;
  organization: string;
  type: LeadType;
  role: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  lead_source: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  deal_value: number | null;
  next_followup_date: string | null;
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityRow = {
  id: number;
  lead_id: number;
  type: ActivityType;
  description: string;
  happened_at: string;
};

type DemoRow = {
  id: number;
  lead_id: number;
  lead_name?: string;
  organization?: string;
  demo_date: string;
  status: DemoStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type UserRow = {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
};

type CountRow = {
  count: number;
};

type SumRow = {
  total: number | null;
};

type DashboardActivityRow = {
  id: number;
  type: string;
  description: string;
  lead_name: string | null;
  happened_at: string;
};

const dataDir = path.join(process.cwd(), "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(path.join(dataDir, "rupeevalcore.sqlite"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

function hashPassword(password: string) {
  return `sha256:${createHash("sha256").update(password).digest("hex")}`;
}

function migrate() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'School',
      role TEXT,
      phone TEXT,
      email TEXT,
      location TEXT,
      lead_source TEXT,
      status TEXT NOT NULL DEFAULT 'New',
      priority TEXT NOT NULL DEFAULT 'Medium',
      deal_value REAL NOT NULL DEFAULT 0,
      next_followup_date TEXT,
      last_contacted_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      happened_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS demos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      demo_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );
  `);

  const admin = sqlite
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("admin@rupeevalcore.com");

  if (!admin) {
    sqlite
      .prepare("INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, ?)")
      .run("admin@rupeevalcore.com", hashPassword("admin123"), "RupeeValcore Admin", nowIso());
  }

  sqlite.exec(`
    UPDATE leads
    SET status = CASE status
      WHEN 'new' THEN 'New'
      WHEN 'contacted' THEN 'Contacted'
      WHEN 'follow_up' THEN 'Meeting'
      WHEN 'proposal_sent' THEN 'Meeting'
      WHEN 'demo_scheduled' THEN 'Demo'
      WHEN 'won' THEN 'Closed Won'
      WHEN 'lost' THEN 'Closed Lost'
      ELSE status
    END;

    UPDATE leads
    SET priority = CASE priority
      WHEN 'urgent' THEN 'High'
      WHEN 'high' THEN 'High'
      WHEN 'medium' THEN 'Medium'
      WHEN 'low' THEN 'Low'
      ELSE priority
    END;

    UPDATE leads
    SET type = CASE type
      WHEN 'school' THEN 'School'
      WHEN 'college' THEN 'College'
      WHEN 'company' THEN 'Corporate'
      WHEN 'individual' THEN 'Corporate'
      WHEN 'partner' THEN 'Corporate'
      ELSE type
    END;

    UPDATE demos
    SET status = CASE status
      WHEN 'scheduled' THEN 'Scheduled'
      WHEN 'completed' THEN 'Completed'
      WHEN 'cancelled' THEN 'Not Converted'
      WHEN 'missed' THEN 'Not Converted'
      ELSE status
    END;
  `);
}

migrate();

export const db = sqlite;

function leadFromRow(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    organization: row.organization,
    type: row.type,
    role: row.role,
    phone: row.phone,
    email: row.email,
    location: row.location,
    leadSource: row.lead_source,
    status: row.status,
    priority: row.priority,
    dealValue: row.deal_value ?? 0,
    nextFollowupDate: row.next_followup_date,
    lastContactedAt: row.last_contacted_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function activityFromRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    leadId: row.lead_id,
    type: row.type,
    description: row.description,
    happenedAt: row.happened_at,
  };
}

function demoFromRow(row: DemoRow): Demo {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name,
    organization: row.organization,
    demoDate: row.demo_date,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function userFromRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function findUserByEmail(email: string) {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  return row ? userFromRow(row) : null;
}

export function findUserById(id: number) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? userFromRow(row) : null;
}

export function getLeads() {
  const rows = db
    .prepare("SELECT * FROM leads ORDER BY updated_at DESC, id DESC")
    .all() as LeadRow[];
  return rows.map(leadFromRow);
}

export function getLead(id: number) {
  const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined;
  return row ? leadFromRow(row) : null;
}

export function createLead(input: Partial<LeadInput>) {
  const timestamp = nowIso();
  const info = db
    .prepare(
      `INSERT INTO leads (
        name, organization, type, role, phone, email, location, lead_source,
        status, priority, deal_value, next_followup_date, last_contacted_at,
        notes, created_at, updated_at
      ) VALUES (
        @name, @organization, @type, @role, @phone, @email, @location, @leadSource,
        @status, @priority, @dealValue, @nextFollowupDate, @lastContactedAt,
        @notes, @createdAt, @updatedAt
      )`
    )
    .run({
      name: input.name?.trim(),
      organization: input.organization?.trim(),
      type: input.type ?? "School",
      role: input.role ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      location: input.location ?? null,
      leadSource: input.leadSource ?? null,
      status: input.status ?? "New",
      priority: input.priority ?? "Medium",
      dealValue: input.dealValue ?? 0,
      nextFollowupDate: input.nextFollowupDate ?? null,
      lastContactedAt: input.lastContactedAt ?? null,
      notes: input.notes ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

  return getLead(Number(info.lastInsertRowid));
}

const leadColumnMap = {
  name: "name",
  organization: "organization",
  type: "type",
  role: "role",
  phone: "phone",
  email: "email",
  location: "location",
  leadSource: "lead_source",
  status: "status",
  priority: "priority",
  dealValue: "deal_value",
  nextFollowupDate: "next_followup_date",
  lastContactedAt: "last_contacted_at",
  notes: "notes",
} satisfies Record<keyof LeadInput, string>;

export function updateLead(id: number, input: Partial<LeadInput>) {
  const entries = Object.entries(input).filter(([key]) => key in leadColumnMap);
  if (entries.length === 0) {
    return getLead(id);
  }

  const assignments = entries.map(([key]) => `${leadColumnMap[key as keyof LeadInput]} = @${key}`);
  const params = Object.fromEntries(entries);

  db.prepare(
    `UPDATE leads SET ${assignments.join(", ")}, updated_at = @updatedAt WHERE id = @id`
  ).run({
    ...params,
    id,
    updatedAt: nowIso(),
  });

  return getLead(id);
}

export function deleteLead(id: number) {
  const info = db.prepare("DELETE FROM leads WHERE id = ?").run(id);
  return info.changes > 0;
}

export function completeFollowup(id: number, nextFollowupDate: string | null) {
  const timestamp = nowIso();
  db.prepare(
    `UPDATE leads
     SET status = 'Contacted',
         last_contacted_at = @timestamp,
         next_followup_date = @nextFollowupDate,
         updated_at = @timestamp
     WHERE id = @id`
  ).run({ id, timestamp, nextFollowupDate });

  createActivity({
    leadId: id,
    type: "follow_up",
    description: nextFollowupDate
      ? `Follow-up completed. Next follow-up set for ${nextFollowupDate}.`
      : "Follow-up completed.",
    happenedAt: timestamp,
  });

  return getLead(id);
}

export function getActivities(leadId?: number) {
  const rows = leadId
    ? (db
        .prepare("SELECT * FROM activities WHERE lead_id = ? ORDER BY happened_at DESC, id DESC")
        .all(leadId) as ActivityRow[])
    : (db
        .prepare("SELECT * FROM activities ORDER BY happened_at DESC, id DESC")
        .all() as ActivityRow[]);

  return rows.map(activityFromRow);
}

export function createActivity(input: {
  leadId: number;
  type: ActivityType;
  description: string;
  happenedAt?: string;
}) {
  const info = db
    .prepare(
      "INSERT INTO activities (lead_id, type, description, happened_at) VALUES (?, ?, ?, ?)"
    )
    .run(input.leadId, input.type, input.description, input.happenedAt ?? nowIso());

  const row = db.prepare("SELECT * FROM activities WHERE id = ?").get(info.lastInsertRowid) as
    | ActivityRow
    | undefined;
  return row ? activityFromRow(row) : null;
}

export function getDemos() {
  const rows = db
    .prepare(
      `SELECT demos.*, leads.name AS lead_name, leads.organization
       FROM demos
       JOIN leads ON leads.id = demos.lead_id
       ORDER BY demos.demo_date ASC`
    )
    .all() as DemoRow[];
  return rows.map(demoFromRow);
}

export function getDemo(id: number) {
  const row = db
    .prepare(
      `SELECT demos.*, leads.name AS lead_name, leads.organization
       FROM demos
       JOIN leads ON leads.id = demos.lead_id
       WHERE demos.id = ?`
    )
    .get(id) as DemoRow | undefined;
  return row ? demoFromRow(row) : null;
}

export function createDemo(input: {
  leadId: number;
  demoDate: string;
  status?: DemoStatus;
  notes?: string | null;
}) {
  const timestamp = nowIso();
  const info = db
    .prepare(
      `INSERT INTO demos (lead_id, demo_date, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(input.leadId, input.demoDate, input.status ?? "Scheduled", input.notes ?? null, timestamp, timestamp);

  db.prepare("UPDATE leads SET status = 'Demo', updated_at = ? WHERE id = ?").run(
    timestamp,
    input.leadId
  );

  return getDemo(Number(info.lastInsertRowid));
}

export function updateDemo(
  id: number,
  input: Partial<{ leadId: number; demoDate: string; status: DemoStatus; notes: string | null }>
) {
  const columnMap = {
    leadId: "lead_id",
    demoDate: "demo_date",
    status: "status",
    notes: "notes",
  };
  const entries = Object.entries(input).filter(([key]) => key in columnMap);
  if (entries.length > 0) {
    const assignments = entries.map(([key]) => `${columnMap[key as keyof typeof columnMap]} = @${key}`);
    db.prepare(
      `UPDATE demos SET ${assignments.join(", ")}, updated_at = @updatedAt WHERE id = @id`
    ).run({ ...Object.fromEntries(entries), id, updatedAt: nowIso() });
  }

  return getDemo(id);
}

export function deleteDemo(id: number) {
  const info = db.prepare("DELETE FROM demos WHERE id = ?").run(id);
  return info.changes > 0;
}

export function getTodayData(): TodayData {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const staleCutoff = addDays(today, -7).toISOString();
  const todayIso = today.toISOString();
  const tomorrowIso = tomorrow.toISOString();

  const overdue = (
    db
      .prepare(
        `SELECT * FROM leads
         WHERE next_followup_date IS NOT NULL
           AND next_followup_date < ?
           AND status NOT IN ('Closed Won', 'Closed Lost')
         ORDER BY priority DESC, next_followup_date ASC`
      )
      .all(todayIso) as LeadRow[]
  ).map(leadFromRow);

  const dueToday = (
    db
      .prepare(
        `SELECT * FROM leads
         WHERE next_followup_date >= ?
           AND next_followup_date < ?
           AND status NOT IN ('Closed Won', 'Closed Lost')
         ORDER BY priority DESC, next_followup_date ASC`
      )
      .all(todayIso, tomorrowIso) as LeadRow[]
  ).map(leadFromRow);

  const stale = (
    db
      .prepare(
        `SELECT * FROM leads
         WHERE (last_contacted_at IS NULL OR last_contacted_at < ?)
           AND status NOT IN ('Closed Won', 'Closed Lost')
         ORDER BY deal_value DESC, updated_at ASC
         LIMIT 25`
      )
      .all(staleCutoff) as LeadRow[]
  ).map(leadFromRow);

  const pinned = (
    db
      .prepare(
        `SELECT * FROM leads
         WHERE status NOT IN ('Closed Won', 'Closed Lost')
         ORDER BY
           CASE priority
             WHEN 'High' THEN 3
             WHEN 'Medium' THEN 2
             ELSE 1
           END DESC,
           deal_value DESC,
           updated_at DESC
         LIMIT 3`
      )
      .all() as LeadRow[]
  ).map(leadFromRow);

  const upcomingDemos = (
    db
      .prepare(
        `SELECT demos.*, leads.name AS lead_name, leads.organization
         FROM demos
         JOIN leads ON leads.id = demos.lead_id
         WHERE demos.status = 'Scheduled'
           AND demos.demo_date >= ?
         ORDER BY demos.demo_date ASC
         LIMIT 10`
      )
      .all(todayIso) as DemoRow[]
  ).map(demoFromRow);

  return { pinned, overdue, today: dueToday, stale, upcomingDemos };
}

function getCount(sql: string, params: unknown[] = []) {
  const row = db.prepare(sql).get(...params) as CountRow;
  return row.count;
}

function getSum(sql: string, params: unknown[] = []) {
  const row = db.prepare(sql).get(...params) as SumRow;
  return row.total ?? 0;
}

function dashboardActivityFromRow(row: DashboardActivityRow): DashboardActivity {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    leadName: row.lead_name ?? "Unknown lead",
    happenedAt: row.happened_at,
  };
}

export function getDashboardData(): DashboardData {
  const totalLeads = getCount("SELECT COUNT(*) AS count FROM leads");
  const activeLeads = getCount(
    "SELECT COUNT(*) AS count FROM leads WHERE status NOT IN ('Closed Won', 'Closed Lost')"
  );
  const demosScheduled = getCount(
    "SELECT COUNT(*) AS count FROM demos WHERE status = 'Scheduled'"
  );
  const dealsClosed = getCount(
    "SELECT COUNT(*) AS count FROM leads WHERE status = 'Closed Won'"
  );

  const totalPipelineValue = getSum(
    "SELECT SUM(deal_value) AS total FROM leads WHERE status != 'Closed Lost'"
  );
  const revenueClosed = getSum(
    "SELECT SUM(deal_value) AS total FROM leads WHERE status = 'Closed Won'"
  );
  const avgDealSize = dealsClosed > 0 ? revenueClosed / dealsClosed : 0;

  const statusGroups: DashboardData["leadsByStatus"] = [
    { label: "New", count: getCount("SELECT COUNT(*) AS count FROM leads WHERE status = 'New'") },
    {
      label: "Contacted",
      count: getCount("SELECT COUNT(*) AS count FROM leads WHERE status = 'Contacted'"),
    },
    {
      label: "Meeting",
      count: getCount("SELECT COUNT(*) AS count FROM leads WHERE status = 'Meeting'"),
    },
    {
      label: "Demo",
      count: getCount("SELECT COUNT(*) AS count FROM leads WHERE status = 'Demo'"),
    },
    {
      label: "Closed Won",
      count: getCount("SELECT COUNT(*) AS count FROM leads WHERE status = 'Closed Won'"),
    },
    {
      label: "Closed Lost",
      count: getCount("SELECT COUNT(*) AS count FROM leads WHERE status = 'Closed Lost'"),
    },
  ];

  const recentActivity = (
    db
      .prepare(
        `SELECT activities.id, activities.type, activities.description, activities.happened_at, leads.name AS lead_name
         FROM activities
         LEFT JOIN leads ON leads.id = activities.lead_id
         ORDER BY activities.happened_at DESC, activities.id DESC
         LIMIT 5`
      )
      .all() as DashboardActivityRow[]
  ).map(dashboardActivityFromRow);

  return {
    pipeline: {
      totalLeads,
      activeLeads,
      demosScheduled,
      dealsClosed,
    },
    revenue: {
      totalPipelineValue,
      revenueClosed,
      avgDealSize,
    },
    leadsByStatus: statusGroups,
    recentActivity,
  };
}
