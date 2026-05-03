export type LeadType = "School" | "College" | "Corporate";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Meeting"
  | "Demo"
  | "Closed Won"
  | "Closed Lost";

export type LeadPriority = "Low" | "Medium" | "High";

export type ActivityType =
  | "call"
  | "whatsapp"
  | "email"
  | "meeting"
  | "demo"
  | "note"
  | "follow_up";

export type DemoStatus = "Scheduled" | "Completed" | "Converted" | "Not Converted";

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface Lead {
  id: number;
  name: string;
  organization: string;
  type: LeadType;
  role: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  leadSource: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  dealValue: number;
  nextFollowupDate: string | null;
  lastContactedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeadInput = Omit<Lead, "id" | "createdAt" | "updatedAt">;

export interface Activity {
  id: number;
  leadId: number;
  type: ActivityType;
  description: string;
  happenedAt: string;
}

export interface Demo {
  id: number;
  leadId: number;
  leadName?: string;
  organization?: string;
  demoDate: string;
  status: DemoStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodayData {
  pinned: Lead[];
  overdue: Lead[];
  today: Lead[];
  stale: Lead[];
  upcomingDemos: Demo[];
}

export interface DashboardActivity {
  id: number;
  type: string;
  description: string;
  leadName: string;
  happenedAt: string;
}

export interface DashboardData {
  pipeline: {
    totalLeads: number;
    activeLeads: number;
    demosScheduled: number;
    dealsClosed: number;
  };
  revenue: {
    totalPipelineValue: number;
    revenueClosed: number;
    avgDealSize: number;
  };
  leadsByStatus: Array<{
    label: "New" | "Contacted" | "Meeting" | "Demo" | "Closed Won" | "Closed Lost";
    count: number;
  }>;
  recentActivity: DashboardActivity[];
}

export interface UserSession {
  id: number;
  email: string;
  name: string;
}
