import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  FlaskConical,
  Handshake,
  ReceiptText,
  CalendarClock,
  ChartNoAxesCombined,
  UserRoundCog,
  ClipboardList,
  LayoutDashboard,
  ListOrdered,
  MessageSquareText,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  Users,
} from "lucide-react";

export type ViewId =
  | "overview"
  | "appointments"
  | "queue"
  | "schedules"
  | "patients"
  | "services"
  | "diagnostics"
  | "followups"
  | "partners"
  | "settings"
  | "billing"
  | "availability"
  | "reports"
  | "staff"
  | "notes";

export type StatusKind =
  | "pending"
  | "confirmed"
  | "arrived"
  | "cancelled"
  | "current"
  | "stale"
  | "unknown"
  | "unavailable"
  | "not-offered"
  | "review"
  | "completed";

export interface Appointment {
  id: string;
  date: string;
  patient: string;
  service: string;
  clinician: string;
  time: string;
  status: string;
  updated: string;
  type: StatusKind;
}

export function getLocalDateValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = getLocalDateValue();

export interface AvailabilityItem {
  service: string;
  status: string;
  kind: StatusKind;
  updated: string;
  owner: string;
}

export interface FollowupItem {
  id: string;
  title: string;
  detail: string;
  due: string;
}

export interface QueueItem {
  token: string;
  patient: string;
  service: string;
  arrival: string;
  status: string;
  kind: StatusKind;
}

export interface NavItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "queue", label: "Queue", icon: ListOrdered },
  { id: "schedules", label: "Doctors & schedules", icon: Stethoscope },
  { id: "patients", label: "Patients", icon: Users },
  { id: "services", label: "Services & availability", icon: SlidersHorizontal },
  { id: "diagnostics", label: "Diagnostics", icon: FlaskConical },
  { id: "followups", label: "Referrals & follow-ups", icon: MessageSquareText },
  { id: "partners", label: "Enabled partner modules", icon: Handshake },
  { id: "settings", label: "Staff & settings", icon: Settings },
  { id: "billing", label: "Payments & receipts", icon: ReceiptText },
  { id: "availability", label: "Doctor availability", icon: CalendarClock },
  { id: "reports", label: "Reports", icon: ChartNoAxesCombined },
  { id: "staff", label: "Doctors & staff", icon: UserRoundCog },
  { id: "notes", label: "Visit notes", icon: ClipboardList },
];

export const doctors = [
  { name: "Dr. Maya Chen", specialty: "General medicine", initials: "MC", color: "blue" },
  { name: "Dr. Arjun Rao", specialty: "Family medicine", initials: "AR", color: "teal" },
  { name: "Dr. Leena Patel", specialty: "Cardiology", initials: "LP", color: "violet" },
];

export const paymentRows = [
  { id: "RC-1042", patient: "Patient •••• 1093", service: "Follow-up visit", amount: 850, method: "Cash", status: "Paid", kind: "completed" as const, date: today },
  { id: "RC-1041", patient: "Patient •••• 6380", service: "Blood pressure review", amount: 500, method: "Card", status: "Paid", kind: "completed" as const, date: today },
  { id: "RC-1040", patient: "Patient •••• 2841", service: "General consultation", amount: 700, method: "—", status: "Due", kind: "pending" as const, date: today },
];

export const initialAppointments: Appointment[] = [
  { id: "MP-2048", date: today, patient: "Patient •••• 2841", service: "General consultation", clinician: "General medicine", time: "09:30", status: "Awaiting confirmation", updated: "8 min ago", type: "pending" },
  { id: "MP-2047", date: today, patient: "Patient •••• 1093", service: "Follow-up visit", clinician: "General medicine", time: "10:00", status: "Confirmed", updated: "22 min ago", type: "confirmed" },
  { id: "MP-2046", date: today, patient: "Patient •••• 6380", service: "Blood pressure review", clinician: "Nursing desk", time: "10:30", status: "Confirmed", updated: "34 min ago", type: "confirmed" },
  { id: "MP-2045", date: today, patient: "Patient •••• 7152", service: "General consultation", clinician: "General medicine", time: "11:15", status: "Awaiting confirmation", updated: "51 min ago", type: "pending" },
];

export const sessions = [
  { time: "09:00", service: "General medicine", detail: "Consultation session" },
  { time: "11:30", service: "Nursing desk", detail: "Vitals & review" },
  { time: "14:00", service: "General medicine", detail: "Afternoon session" },
];

export const initialFollowups: FollowupItem[] = [
  { id: "FU-081", title: "Referral response due", detail: "Patient •••• 4550 · Referred externally", due: "Review today" },
  { id: "FU-079", title: "Follow-up reminder", detail: "Patient •••• 2038 · General consultation", due: "Due today" },
  { id: "FU-074", title: "Update requested", detail: "Patient •••• 9902 · Appointment outcome", due: "1 day overdue" },
];

export const initialAvailability: AvailabilityItem[] = [
  { service: "General consultation", status: "Current", kind: "current", updated: "Updated 18 min ago", owner: "Clinic staff" },
  { service: "Nursing desk", status: "Needs reconfirmation", kind: "stale", updated: "Last updated yesterday", owner: "Clinic staff" },
  { service: "Diagnostics", status: "Not offered", kind: "not-offered", updated: "No in-house service listed", owner: "Clinic staff" },
];

export const initialQueue: QueueItem[] = [
  { token: "Q-018", patient: "Patient •••• 1093", service: "General medicine", arrival: "09:18", status: "Waiting", kind: "pending" },
  { token: "Q-019", patient: "Patient •••• 6380", service: "Nursing desk", arrival: "09:26", status: "Waiting", kind: "pending" },
  { token: "Q-017", patient: "Patient •••• 2841", service: "General medicine", arrival: "09:05", status: "In consultation", kind: "confirmed" },
];

export const patientRows = [
  { id: "PT-2841", patient: "Patient •••• 2841", lastVisit: "Today, 09:30", detail: "General consultation", status: "Awaiting confirmation", kind: "pending" as const },
  { id: "PT-1093", patient: "Patient •••• 1093", lastVisit: "Today, 10:00", detail: "Follow-up visit", status: "Confirmed", kind: "confirmed" as const },
  { id: "PT-6380", patient: "Patient •••• 6380", lastVisit: "Today, 10:30", detail: "Blood pressure review", status: "Confirmed", kind: "confirmed" as const },
  { id: "PT-4550", patient: "Patient •••• 4550", lastVisit: "Nov 22, 2026", detail: "External referral", status: "Needs follow-up", kind: "review" as const },
  { id: "PT-2038", patient: "Patient •••• 2038", lastVisit: "Nov 20, 2026", detail: "General consultation", status: "Follow-up due", kind: "review" as const },
];

export const scheduleRows = [
  { time: "09:00 – 11:30", doctor: "Dr. Maya Chen", service: "General medicine", type: "Consultation session", status: "Current", kind: "current" as const },
  { time: "11:30 – 13:00", doctor: "Clinic nursing team", service: "Nursing desk", type: "Vitals & review", status: "Current", kind: "current" as const },
  { time: "14:00 – 17:00", doctor: "Dr. Arjun Rao", service: "Family medicine", type: "Consultation session", status: "Current", kind: "current" as const },
  { time: "Wed · 10:00 – 12:00", doctor: "Dr. Leena Patel", service: "Cardiology", type: "Schedule needs confirmation", status: "Needs review", kind: "review" as const },
];

export const diagnosticRows = [
  { time: "10:15", patient: "Patient •••• 9901", service: "External lab referral", status: "Referral sent", kind: "confirmed" as const, detail: "Partner-reported status · updated yesterday" },
  { time: "13:40", patient: "Patient •••• 6178", service: "External lab referral", status: "Awaiting update", kind: "pending" as const, detail: "No result reported to this workspace" },
];

export const partnerRows = [
  { name: "Diagnostic partner", detail: "External referrals · no connection configured", status: "Not connected", kind: "unknown" as const },
  { name: "Pharmacy partner", detail: "No participating seller configured", status: "Not enabled", kind: "not-offered" as const },
  { name: "Blood coordination", detail: "Institution verification required", status: "Not enabled", kind: "not-offered" as const },
  { name: "Ambulance assistance", detail: "Partner-supervised service only", status: "Not enabled", kind: "not-offered" as const },
];
