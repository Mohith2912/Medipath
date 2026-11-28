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

export interface PaymentRecord {
  id: string;
  patient: string;
  service: string;
  amount: number;
  method: string;
  status: string;
  kind: StatusKind;
  date: string;
}

export interface PatientRecord {
  id: string;
  patient: string;
  lastVisit: string;
  detail: string;
  status: string;
  kind: StatusKind;
}

export interface DiagnosticRecord {
  time: string;
  patient: string;
  service: string;
  status: string;
  kind: StatusKind;
  detail: string;
}

export interface ScheduleRow {
  time: string;
  doctor: string;
  service: string;
  type: string;
  status: string;
  kind: StatusKind;
}

export const paymentRows: PaymentRecord[] = [];

export const initialAppointments: Appointment[] = [];

export const sessions = [
  { time: "09:00", service: "General Medicine", detail: "Consultation Session • Dr. Maya Chen" },
  { time: "11:30", service: "Nursing Desk", detail: "Vitals & Review • Clinic Nursing Team" },
  { time: "14:00", service: "Family Medicine", detail: "Afternoon Session • Dr. Arjun Rao" },
];

export const initialFollowups: FollowupItem[] = [];

export const initialAvailability: AvailabilityItem[] = [
  { service: "General consultation", status: "Available", kind: "current", updated: "Updated 15 min ago", owner: "Clinical Staff" },
  { service: "Nursing desk & vitals", status: "Active", kind: "current", updated: "Active on duty", owner: "Nursing Team" },
  { service: "Cardiology clinic", status: "Scheduled", kind: "current", updated: "Dr. Leena Patel on duty", owner: "Outpatient Dept" },
];

export const initialQueue: QueueItem[] = [];

export const patientRows: PatientRecord[] = [];

export const scheduleRows: ScheduleRow[] = [
  { time: "09:00 – 11:30", doctor: "Dr. Maya Chen", service: "General Medicine", type: "Morning Consultation", status: "Active", kind: "current" },
  { time: "11:30 – 13:00", doctor: "Clinic Nursing Team", service: "Nursing Desk", type: "Vitals & Triage", status: "Active", kind: "current" },
  { time: "14:00 – 17:00", doctor: "Dr. Arjun Rao", service: "Family Medicine", type: "Afternoon Consultation", status: "Active", kind: "current" },
  { time: "10:00 – 13:00", doctor: "Dr. Leena Patel", service: "Cardiology", type: "Specialist Clinic", status: "Active", kind: "current" },
];

export const diagnosticRows: DiagnosticRecord[] = [];

export const partnerRows = [
  { name: "Central Diagnostic Laboratory", detail: "Integrated blood tests, pathology & automated reporting", status: "Connected", kind: "current" as const },
  { name: "Hospital Central Pharmacy", detail: "Electronic prescriptions & drug dispensary", status: "Active", kind: "current" as const },
  { name: "Regional Blood Bank Network", detail: "Verified blood group registry & cross-matching service", status: "Connected", kind: "current" as const },
  { name: "Rapid Response Medical Logistics", detail: "Emergency patient transport & coordinated ambulance dispatch", status: "Active", kind: "current" as const },
];
