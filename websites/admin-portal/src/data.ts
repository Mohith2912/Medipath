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
  { id: "INV-1042", patient: "Elena Rostova", service: "Follow-up consultation", amount: 850, method: "Cash", status: "Paid", kind: "completed" as const, date: today },
  { id: "INV-1041", patient: "Marcus Vance", service: "Blood pressure review", amount: 500, method: "Card", status: "Paid", kind: "completed" as const, date: today },
  { id: "INV-1040", patient: "Aaliyah Khan", service: "General consultation", amount: 700, method: "UPI", status: "Due", kind: "pending" as const, date: today },
];

export const initialAppointments: Appointment[] = [
  { id: "APT-2048", date: today, patient: "Aaliyah Khan", service: "General consultation", clinician: "Dr. Maya Chen", time: "09:30", status: "Awaiting confirmation", updated: "8 min ago", type: "pending" },
  { id: "APT-2047", date: today, patient: "Elena Rostova", service: "Follow-up consultation", clinician: "Dr. Maya Chen", time: "10:00", status: "Confirmed", updated: "22 min ago", type: "confirmed" },
  { id: "APT-2046", date: today, patient: "Marcus Vance", service: "Blood pressure review", clinician: "Nursing desk", time: "10:30", status: "Confirmed", updated: "34 min ago", type: "confirmed" },
  { id: "APT-2045", date: today, patient: "David Kim", service: "Cardiology evaluation", clinician: "Dr. Leena Patel", time: "11:15", status: "Awaiting confirmation", updated: "51 min ago", type: "pending" },
];

export const sessions = [
  { time: "09:00", service: "General Medicine", detail: "Consultation Session • Dr. Maya Chen" },
  { time: "11:30", service: "Nursing Desk", detail: "Vitals & Review • Clinic Nursing Team" },
  { time: "14:00", service: "Family Medicine", detail: "Afternoon Session • Dr. Arjun Rao" },
];

export const initialFollowups: FollowupItem[] = [
  { id: "FU-081", title: "Diagnostic lab results review", detail: "Elena Rostova · CBC and Lipid Panel", due: "Due today" },
  { id: "FU-079", title: "Post-consultation follow-up", detail: "Marcus Vance · Blood pressure monitoring", due: "Due today" },
  { id: "FU-074", title: "Cardiology follow-up schedule", detail: "David Kim · Referral review", due: "Pending action" },
];

export const initialAvailability: AvailabilityItem[] = [
  { service: "General consultation", status: "Available", kind: "current", updated: "Updated 15 min ago", owner: "Clinical Staff" },
  { service: "Nursing desk & vitals", status: "Active", kind: "current", updated: "Active on duty", owner: "Nursing Team" },
  { service: "Cardiology clinic", status: "Scheduled", kind: "current", updated: "Dr. Leena Patel on duty", owner: "Outpatient Dept" },
];

export const initialQueue: QueueItem[] = [
  { token: "Q-101", patient: "Elena Rostova", service: "General Medicine", arrival: "09:15", status: "Waiting", kind: "pending" },
  { token: "Q-102", patient: "Marcus Vance", service: "Nursing Desk", arrival: "09:25", status: "Waiting", kind: "pending" },
  { token: "Q-100", patient: "Aaliyah Khan", service: "General Medicine", arrival: "09:05", status: "In consultation", kind: "confirmed" },
];

export const patientRows = [
  { id: "PT-1001", patient: "Elena Rostova", lastVisit: "Today, 09:30", detail: "General consultation", status: "Confirmed", kind: "confirmed" as const },
  { id: "PT-1002", patient: "Marcus Vance", lastVisit: "Today, 10:00", detail: "Blood pressure review", status: "Confirmed", kind: "confirmed" as const },
  { id: "PT-1003", patient: "Aaliyah Khan", lastVisit: "Today, 10:30", detail: "Follow-up consultation", status: "In consultation", kind: "confirmed" as const },
  { id: "PT-1004", patient: "David Kim", lastVisit: "Nov 25, 2026", detail: "Cardiology evaluation", status: "Active", kind: "confirmed" as const },
  { id: "PT-1005", patient: "Samantha Ward", lastVisit: "Nov 22, 2026", detail: "Annual health checkup", status: "Completed", kind: "completed" as const },
];

export const scheduleRows = [
  { time: "09:00 – 11:30", doctor: "Dr. Maya Chen", service: "General Medicine", type: "Morning Consultation", status: "Active", kind: "current" as const },
  { time: "11:30 – 13:00", doctor: "Clinic Nursing Team", service: "Nursing Desk", type: "Vitals & Triage", status: "Active", kind: "current" as const },
  { time: "14:00 – 17:00", doctor: "Dr. Arjun Rao", service: "Family Medicine", type: "Afternoon Consultation", status: "Active", kind: "current" as const },
  { time: "10:00 – 13:00", doctor: "Dr. Leena Patel", service: "Cardiology", type: "Specialist Clinic", status: "Active", kind: "current" as const },
];

export const diagnosticRows = [
  { time: "10:15", patient: "Marcus Vance", service: "Lipid Profile & ECG", status: "Completed", kind: "completed" as const, detail: "Central Pathology Lab" },
  { time: "13:40", patient: "David Kim", service: "Echocardiogram", status: "In Progress", kind: "pending" as const, detail: "Cardiology Imaging Center" },
];

export const partnerRows = [
  { name: "Central Diagnostic Laboratory", detail: "Integrated blood tests, pathology & automated reporting", status: "Connected", kind: "current" as const },
  { name: "Hospital Central Pharmacy", detail: "Electronic prescriptions & drug dispensary", status: "Active", kind: "current" as const },
  { name: "Regional Blood Bank Network", detail: "Verified blood group registry & cross-matching service", status: "Connected", kind: "current" as const },
  { name: "Rapid Response Medical Logistics", detail: "Emergency patient transport & coordinated ambulance dispatch", status: "Active", kind: "current" as const },
];
