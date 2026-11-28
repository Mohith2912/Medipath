"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes, FormEvent, ReactNode, RefObject } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  HeartPulse,
  ListOrdered,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  ReceiptText,
  Rows,
  Search,
  Stethoscope,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import {
  diagnosticRows,
  doctors,
  getLocalDateValue,
  initialAppointments,
  initialAvailability,
  initialFollowups,
  initialQueue,
  navItems,
  partnerRows,
  patientRows,
  paymentRows as initialPaymentRows,
  scheduleRows,
  sessions,
} from "./data";
import type {
  Appointment,
  AvailabilityItem,
  QueueItem,
  StatusKind,
  ViewId,
} from "./data";

type ToastMessage = { text: string; tone: "success" | "info" };
type Overlay =
  | { kind: "appointment"; id: string }
  | { kind: "availability"; serviceIndex: number }
  | { kind: "new-request" }
  | { kind: "booking" }
  | { kind: "payment"; id: string }
  | { kind: "receipt"; id: string }
  | { kind: "patient-profile"; id: string }
  | { kind: "info"; title: string; body: string; result: string }
  | null;
type ActionId = "patient-info" | "diagnostics-info" | "partner-info" | "settings-help";
type Theme = "light" | "dark";
type WorkspaceRole = "admin" | "doctor" | "front-desk";
type PaymentRecord = typeof initialPaymentRows[number];

const themeStorageKey = "medipath-clinic-theme";
const roleLabels: Record<WorkspaceRole, string> = {
  admin: "Clinic admin",
  doctor: "Doctor",
  "front-desk": "Front desk",
};

const navCategories: Array<{
  category: string;
  items: ViewId[];
}> = [
  {
    category: "Clinical Operations",
    items: ["overview", "appointments", "queue", "schedules", "patients"],
  },
  {
    category: "Care Coordination",
    items: ["services", "diagnostics", "followups", "partners"],
  },
  {
    category: "Practice & Finance",
    items: ["billing", "availability", "reports", "staff", "notes", "settings"],
  },
];
const appointmentBookingSchema = z.object({
  patient: z.string().min(1, "Choose a patient record to continue."),
  service: z.string().min(1, "Choose a visit type."),
  clinician: z.string().min(1, "Choose a doctor."),
  date: z.string().min(1, "Choose an appointment date.").refine((date) => date >= getLocalDateValue(), "Choose today or a future date."),
  time: z.string().min(1, "Choose an appointment time."),
});
type BookingValues = z.infer<typeof appointmentBookingSchema>;

const initialWeeklyAvailability = {
  Monday: { enabled: true, start: "09:00", end: "17:00" },
  Tuesday: { enabled: true, start: "09:00", end: "17:00" },
  Wednesday: { enabled: true, start: "09:00", end: "17:00" },
  Thursday: { enabled: true, start: "09:00", end: "17:00" },
  Friday: { enabled: true, start: "09:00", end: "15:00" },
  Saturday: { enabled: false, start: "09:00", end: "13:00" },
  Sunday: { enabled: false, start: "09:00", end: "13:00" },
};

function SignInScreen({ onEnter }: { onEnter: (role: WorkspaceRole) => void }) {
  const [role, setRole] = useState<WorkspaceRole>("admin");
  const roleOptions: Array<{ id: WorkspaceRole; title: string; description: string; initials: string }> = [
    { id: "admin", title: "Clinic Administrator", description: "Manage team, schedules and clinic operations", initials: "AD" },
    { id: "doctor", title: "Attending Physician", description: "Consultation schedule, visits and clinical notes", initials: "DR" },
    { id: "front-desk", title: "Front Desk & Reception", description: "Patient triage, check-ins, and payments", initials: "FD" },
  ];

  return (
    <main className="signin-screen">
      <a className="brand signin-brand" href="#signin" aria-label="MediPath home">
        <span className="brand-mark" aria-hidden="true"><img src="/medipath-logo.png" alt="" /></span>
        <span className="brand-wordmark"><img src="/medipath-wordmark.png" alt="" /><span>MediPath Admin</span></span>
      </a>
      <section className="signin-card" aria-labelledby="signin-title">
        <div className="signin-intro">
          <span className="signin-symbol"><HeartPulse aria-hidden="true" /></span>
          <p className="eyebrow">MEDIPATH ADMIN CONSOLE</p>
          <h1 id="signin-title">Care coordination, made clearer.</h1>
          <p>Select your assigned clinical workspace role to access patient records and hospital operations.</p>
        </div>
        <fieldset className="role-picker">
          <legend>Workspace Selection</legend>
          {roleOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`role-card${role === option.id ? " is-selected" : ""}`}
              aria-pressed={role === option.id}
              onClick={() => setRole(option.id)}
            >
              <span className={`role-avatar role-${option.id}`}>{option.initials}</span>
              <span className="role-card-copy"><strong>{option.title}</strong><small>{option.description}</small></span>
              <span className="role-radio" aria-hidden="true">{role === option.id && <Check />}</span>
            </button>
          ))}
        </fieldset>
        <Button variant="primary" className="signin-continue" onClick={() => onEnter(role)}>Access Workspace <span aria-hidden="true">→</span></Button>
        <p className="signin-note"><CheckCircle2 aria-hidden="true" /> Secure Role-Based Access Control Active</p>
      </section>
      <p className="signin-footer">MediPath Enterprise Clinical Information System <span>·</span> © 2026 MediPath</p>
    </main>
  );
}

const todayLabel = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

const actionMessages: Record<ActionId, { title: string; body: string; result: string }> = {
  "patient-info": {
    title: "Patient information access",
    body: "Reception views should show only the minimum information required to coordinate a visit. Clinical notes and reports are intentionally absent here.",
    result: "Restricted clinical records view.",
  },
  "diagnostics-info": {
    title: "External diagnostic referral",
    body: "A referral is not a test booking. Partner confirmation, sample collection, report release and clinician review are separate states.",
    result: "No diagnostic partner is connected.",
  },
  "partner-info": {
    title: "Partner configuration",
    body: "Partner workflows require a verified organisation, explicit operating agreement and clear responsibility for status updates.",
    result: "No partner service is enabled.",
  },
  "settings-help": {
    title: "Workspace access",
    body: "A production workspace must enforce role-based access and audit sensitive actions on the server.",
    result: "Role-based staff permissions active.",
  },
};

const availabilityStatuses: Array<{ value: StatusKind; label: string }> = [
  { value: "current", label: "Current" },
  { value: "stale", label: "Needs reconfirmation" },
  { value: "unknown", label: "Unknown" },
  { value: "unavailable", label: "Unavailable" },
  { value: "not-offered", label: "Not offered" },
];

function StatusBadge({ label, kind }: { label: string; kind: StatusKind }) {
  const Icon = ["confirmed", "ready", "completed", "arrived", "current"].includes(kind)
    ? CheckCircle2
    : ["cancelled", "unavailable"].includes(kind)
      ? X
      : Clock3;
  return <span className={`status status-${kind}`}><Icon aria-hidden="true" />{label}</span>;
}

function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`button button-${variant} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

function PageHeading({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}

function Panel({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`.trim()}>
      <div className="panel-header">
        <div className="panel-heading"><h2>{title}</h2></div>
        {action}
      </div>
      {children}
    </section>
  );
}

function DemoNotice({ children }: { children: ReactNode }) {
  return null;
}

function HeartbeatLoader({ label }: { label: string }) {
  return (
    <div className="heartbeat-loader" role="status">
      <HeartPulse className="heartbeat-icon" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  attention = false,
}: {
  label: string;
  value: ReactNode;
  note: string;
  icon: ReactNode;
  attention?: boolean;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className={`metric-foot${attention ? " attention" : ""}`}>{note}</div>
    </article>
  );
}

function IconButton({
  children,
  label,
  className = "",
  ...props
}: {
  children: ReactNode;
  label: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`icon-button ${className}`.trim()} type="button" aria-label={label} {...props}>
      {children}
    </button>
  );
}

function DialogFrame({
  title,
  description,
  children,
  onClose,
  variant = "modal",
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  variant?: "modal" | "drawer";
  className?: string;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]';
    dialog?.querySelector<HTMLElement>(focusableSelector)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, []);

  if (variant === "drawer") {
    return (
      <>
        <div className="drawer-backdrop" onMouseDown={onClose} />
        <aside
          ref={dialogRef as RefObject<HTMLElement>}
          className="drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="overlay-title"
          aria-describedby={description ? "overlay-description" : undefined}
        >
          <div className="drawer-head">
            <div>
              <h2 id="overlay-title">{title}</h2>
              {description && <p className="overlay-description" id="overlay-description">{description}</p>}
            </div>
            <IconButton label="Close details" onClick={onClose}><X /></IconButton>
          </div>
          {children}
        </aside>
      </>
    );
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        ref={dialogRef as RefObject<HTMLElement>}
        className={`modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        aria-describedby={description ? "overlay-description" : undefined}
      >
        <div className="modal-head">
          <div>
            <h2 id="overlay-title">{title}</h2>
            {description && <p id="overlay-description">{description}</p>}
          </div>
          <IconButton label="Close dialog" onClick={onClose}><X /></IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

function AppointmentTable({
  appointments,
  onOpen,
}: {
  appointments: Appointment[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Patient / request</th>
            <th scope="col">Service / team</th>
            <th scope="col">Session</th>
            <th scope="col">Status</th>
            <th scope="col">Last update</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((item) => (
            <tr key={item.id}>
              <td><span className="cell-primary">{item.patient}</span><span className="cell-secondary">{item.id}</span></td>
              <td><span className="cell-primary">{item.service}</span><span className="cell-secondary">{item.clinician}</span></td>
              <td>{item.time}</td>
              <td><StatusBadge label={item.status} kind={item.type} /></td>
              <td>{item.updated}</td>
              <td><button className="table-action" type="button" onClick={() => onOpen(item.id)}>View details</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {appointments.length === 0 && (
        <div className="empty-state"><strong>No matching appointments</strong><span>Try a different search or clear the status filter.</span></div>
      )}
    </div>
  );
}

function AppointmentRequests({
  appointments,
  onOpen,
}: {
  appointments: Appointment[];
  onOpen: (id: string) => void;
}) {
  if (!appointments.length) {
    return <div className="empty-state"><strong>Nothing needs confirmation</strong><span>New requests will appear here when received.</span></div>;
  }
  return (
    <div className="request-list">
      {appointments.map((item) => (
        <article className="request-row" key={item.id}>
          <div className="request-main">
            <div className="request-title">{item.service} <span className="request-id">{item.id}</span></div>
            <div className="request-meta">{item.patient} · {item.clinician} · {item.time}</div>
            <span className="request-time">Received {item.updated}</span>
          </div>
          <div className="row-actions">
            <StatusBadge label={item.status} kind={item.type} />
            <Button variant="quiet" onClick={() => onOpen(item.id)}>Review</Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function AvailabilityEditor({
  availability,
  initialIndex,
  onSave,
  onCancel,
}: {
  availability: AvailabilityItem[];
  initialIndex: number;
  onSave: (index: number, kind: StatusKind) => void;
  onCancel: () => void;
}) {
  const [serviceIndex, setServiceIndex] = useState(initialIndex);
  const [status, setStatus] = useState<StatusKind>(availability[initialIndex]?.kind ?? "unknown");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(serviceIndex, status);
  }

  return (
    <form className="modal-body" onSubmit={submit}>
      <div className="form-field">
        <label htmlFor="availability-service">Service</label>
        <select
          id="availability-service"
          value={serviceIndex}
          onChange={(event) => {
            const index = Number(event.target.value);
            setServiceIndex(index);
            setStatus(availability[index]?.kind ?? "unknown");
          }}
        >
          {availability.map((item, index) => <option value={index} key={item.service}>{item.service}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="availability-status">Reported status</label>
        <select id="availability-status" value={status} onChange={(event) => setStatus(event.target.value as StatusKind)}>
          {availabilityStatuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
        </select>
      </div>
      <p className="field-hint">Current means recently confirmed by clinic staff; it does not guarantee a service or appointment.</p>
      <div className="modal-actions">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Update service status</Button>
      </div>
    </form>
  );
}

function AppointmentBooking({
  appointments,
  onComplete,
  onCancel,
}: {
  appointments: Appointment[];
  onComplete: (appointment: Omit<Appointment, "id" | "status" | "updated" | "type">) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const { register, watch, trigger, setError, clearErrors, handleSubmit, formState: { errors } } = useForm<BookingValues>({
    resolver: zodResolver(appointmentBookingSchema),
    mode: "onTouched",
    defaultValues: { patient: "", service: "General consultation", clinician: doctors[0].name, date: getLocalDateValue(), time: "" },
  });
  const patient = watch("patient");
  const service = watch("service");
  const clinician = watch("clinician");
  const date = watch("date");
  const time = watch("time");
  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30"];
  const hasConflict = appointments.some((appointment) =>
    appointment.date === date && appointment.time === time && appointment.clinician === clinician &&
    appointment.type !== "cancelled",
  );

  async function continueBooking() {
    const fields: Array<keyof BookingValues> = step === 0 ? ["patient", "service"] : ["clinician", "date", "time"];
    if (!await trigger(fields)) return;
    if (step === 1 && hasConflict) {
      setError("time", { type: "conflict", message: "That doctor already has an appointment at this time. Choose another slot." });
      return;
    }
    clearErrors();
    setStep((current) => Math.min(current + 1, 2));
  }

  function finishBooking(values: BookingValues) {
    if (hasConflict) {
      setStep(1);
      setError("time", { type: "conflict", message: "That slot is no longer available. Choose another time." });
      return;
    }
    onComplete(values);
  }

  return (
    <div className="booking-flow">
      <ol className="booking-steps" aria-label="Appointment booking steps">
        {["Patient", "Doctor & time", "Confirm"].map((label, index) => (
          <li className={index === step ? "is-current" : index < step ? "is-complete" : ""} key={label}>
            <span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <div className="modal-body">
        {step === 0 && <>
          <div className="form-field">
            <label htmlFor="booking-patient">Patient record</label>
            <select id="booking-patient" {...register("patient")}>
              <option value="">Choose a patient</option>
              {patientRows.map((entry) => <option key={entry.id} value={entry.patient}>{entry.patient}</option>)}
            </select>
            <span className="field-hint">Select from registered hospital patient records.</span>
            {errors.patient?.message && <span className="form-error" role="alert">{errors.patient.message}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="booking-service">Visit type</label>
            <select id="booking-service" {...register("service")}>
              <option>General consultation</option><option>Follow-up visit</option><option>Blood pressure review</option>
            </select>
          </div>
        </>}
        {step === 1 && <>
          <div className="form-field">
            <label htmlFor="booking-doctor">Doctor</label>
            <select id="booking-doctor" {...register("clinician")} onChange={(event) => { register("clinician").onChange(event); clearErrors("time"); }}>
              {doctors.map((doctor) => <option key={doctor.name} value={doctor.name}>{doctor.name} · {doctor.specialty}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="booking-date">Date</label>
            <input id="booking-date" type="date" min={getLocalDateValue()} {...register("date")} onChange={(event) => { register("date").onChange(event); clearErrors("time"); }} />
            {errors.date?.message && <span className="form-error" role="alert">{errors.date.message}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="booking-time">Available time</label>
            <select id="booking-time" {...register("time")} onChange={(event) => { register("time").onChange(event); clearErrors("time"); }}>
              <option value="">Choose a time</option>
              {times.map((slot) => {
                const busy = appointments.some((appointment) => appointment.date === date &&
                  appointment.time === slot && appointment.clinician === clinician && appointment.type !== "cancelled");
                return <option key={slot} value={slot} disabled={busy}>{slot}{busy ? " · unavailable" : ""}</option>;
              })}
            </select>
            {errors.time?.message && <span className="form-error" role="alert">{errors.time.message}</span>}
          </div>
        </>}
        {step === 2 && <div className="booking-summary">
          <span className="summary-icon"><CalendarDays aria-hidden="true" /></span>
          <h3>Review appointment</h3>
          <p>Verify appointment details before submitting to schedule.</p>
          <dl><div><dt>Patient</dt><dd>{patient}</dd></div><div><dt>Visit</dt><dd>{service}</dd></div><div><dt>Doctor</dt><dd>{clinician}</dd></div><div><dt>Date & time</dt><dd>{date} · {time}</dd></div></dl>
        </div>}
        <div className="modal-actions">
          <Button onClick={step === 0 ? onCancel : () => { clearErrors(); setStep((current) => current - 1); }}>{step === 0 ? "Cancel" : "Back"}</Button>
          {step < 2
            ? <Button variant="primary" onClick={continueBooking}>Continue</Button>
            : <Button variant="primary" onClick={handleSubmit(finishBooking)}>Confirm appointment</Button>}
        </div>
      </div>
    </div>
  );
}

function CashPaymentForm({
  payment,
  onPay,
  onCancel,
}: {
  payment: PaymentRecord;
  onPay: (method: string) => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState("Cash");
  const [received, setReceived] = useState(String(payment.amount));
  const [verified, setVerified] = useState(false);
  const paidAmount = Number(received);
  const balance = Number.isFinite(paidAmount) ? paidAmount - payment.amount : 0;
  return (
    <form className="modal-body" onSubmit={(event) => { event.preventDefault(); if (verified && balance >= 0) onPay(method); }}>
      <div className="payment-summary"><span>Amount due</span><strong>₹{payment.amount.toLocaleString("en-IN")}</strong><small>{payment.patient} · {payment.service}</small></div>
      <div className="form-field"><label htmlFor="payment-method">Payment method</label><select id="payment-method" value={method} onChange={(event) => { setMethod(event.target.value); setVerified(false); }}><option>Cash</option><option>Card</option><option>UPI</option></select></div>
      {method === "Cash" && <>
        <div className="form-field"><label htmlFor="cash-received">Cash received (₹)</label><input id="cash-received" type="number" min={payment.amount} step="1" value={received} onChange={(event) => { setReceived(event.target.value); setVerified(false); }} aria-describedby="cash-change" required /></div>
        <p className="cash-change" id="cash-change">Change to return <strong>₹{Math.max(0, balance).toLocaleString("en-IN")}</strong></p>
      </>}
      <label className="verify-payment"><input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} /><span>I have verified the {method === "Cash" ? "cash received" : "payment"} with the patient.</span></label>
      {method === "Cash" && balance < 0 && <p className="form-error" role="alert">Amount received must be at least ₹{payment.amount}.</p>}
      <div className="modal-actions"><Button onClick={onCancel}>Cancel</Button><Button variant="primary" type="submit" disabled={!verified || (method === "Cash" && balance < 0)}>Confirm payment</Button></div>
    </form>
  );
}

function AppointmentCalendar({
  appointments,
  mode,
  selectedDate,
  onOpen,
}: {
  appointments: Appointment[];
  mode: "day" | "week";
  selectedDate: string;
  onOpen: (id: string) => void;
}) {
  const anchor = new Date(`${selectedDate}T12:00:00`);
  const dayStart = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  if (mode === "week") {
    const weekday = (dayStart.getDay() + 6) % 7;
    dayStart.setDate(dayStart.getDate() - weekday);
  }
  const days = mode === "day" ? [dayStart] : Array.from({ length: 7 }, (_, index) => {
    const next = new Date(dayStart);
    next.setDate(next.getDate() + index);
    return next;
  });
  return <div className={`appointment-calendar${mode === "week" ? " is-week" : ""}`}>
    {days.map((day) => {
      const key = getLocalDateValue(day);
      const dayAppointments = appointments.filter((item) => item.date === key).sort((a, b) => a.time.localeCompare(b.time));
      return <section className="calendar-day" key={key}>
        <h3>{new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" }).format(day)}</h3>
        {dayAppointments.length ? dayAppointments.map((item) => <button className={`calendar-event event-${item.type}`} type="button" key={item.id} onClick={() => onOpen(item.id)}>
          <strong>{item.time}</strong><span>{item.patient}</span><small>{item.service} · {item.clinician}</small>
        </button>) : <p className="calendar-empty">No appointments</p>}
      </section>;
    })}
  </div>;
}

function App() {
  const [view, setView] = useState<ViewId>("overview");
  const [role, setRole] = useState<WorkspaceRole>("admin");
  const [signedIn, setSignedIn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [appointmentLayout, setAppointmentLayout] = useState<"list" | "day" | "week">("list");
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPaymentRows);
  const [weeklyAvailability, setWeeklyAvailability] = useState(initialWeeklyAvailability);
  const [settingsToggles, setSettingsToggles] = useState({ appointmentAlerts: true, queueAlerts: true, trustedDevice: false });
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityItem[]>(initialAvailability);
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [reviewed, setReviewed] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState(getLocalDateValue());
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [followupFilter, setFollowupFilter] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showLoadingPreview, setShowLoadingPreview] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const loadingPreviewTimeout = useRef<number | null>(null);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    window.localStorage.setItem(themeStorageKey, theme);
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", theme === "dark" ? "#0E1624" : "#EDF5FF");
    });
  }, [theme, themeReady]);

  const currentTitle = navItems.find((item) => item.id === view)?.label ?? "Overview";
  const pendingAppointments = appointments.filter((item) => item.type === "pending");
  const staleServices = availability.filter((item) => item.kind === "stale");
  const waitingQueue = queue.filter((item) => item.status === "Waiting");
  const activeQueue = queue.filter((item) => item.status === "In consultation");

  const visibleAppointments = useMemo(() => appointments.filter((item) => {
    if (role === "doctor" && item.clinician !== doctors[0].name) return false;
    const searchText = `${item.patient} ${item.service} ${item.clinician} ${item.id} ${item.status}`.toLowerCase();
    const matchesSearch = searchText.includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || item.type === statusFilter;
    const selectedDate = new Date(`${appointmentDateFilter}T12:00:00`);
    const dateDelta = Math.floor((new Date(`${item.date}T12:00:00`).getTime() - selectedDate.getTime()) / 86400000);
    const weekStartOffset = (selectedDate.getDay() + 6) % 7;
    const matchesDate = appointmentLayout === "week"
      ? dateDelta >= -weekStartOffset && dateDelta < 7 - weekStartOffset
      : item.date === appointmentDateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  }), [appointments, query, statusFilter, appointmentDateFilter, appointmentLayout, role]);
  const appointmentPageSize = 5;
  const appointmentPageCount = Math.max(1, Math.ceil(visibleAppointments.length / appointmentPageSize));
  const paginatedAppointments = visibleAppointments.slice(
    (appointmentPage - 1) * appointmentPageSize,
    appointmentPage * appointmentPageSize,
  );

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const updateConnection = () => setIsOffline(!navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  useEffect(() => () => {
    if (loadingPreviewTimeout.current !== null) {
      window.clearTimeout(loadingPreviewTimeout.current);
    }
  }, []);

  useEffect(() => {
    setAppointmentPage(1);
  }, [query, statusFilter, appointmentDateFilter]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName ?? ""))) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function notify(text: string, tone: ToastMessage["tone"] = "success") {
    setToast({ text, tone });
  }

  function previewLoading() {
    if (loadingPreviewTimeout.current !== null) {
      window.clearTimeout(loadingPreviewTimeout.current);
    }
    setShowLoadingPreview(true);
    loadingPreviewTimeout.current = window.setTimeout(() => {
      setShowLoadingPreview(false);
      loadingPreviewTimeout.current = null;
    }, 1400);
  }

  function navigate(nextView: ViewId) {
    setView(nextView);
    setQuery("");
    setStatusFilter("all");
    setAppointmentPage(1);
    setMobileNavOpen(false);
    window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }

  function showInfo(action: ActionId) {
    const message = actionMessages[action];
    setOverlay({ kind: "info", ...message });
  }

  function handleAction(action: ActionId | "new-request" | "availability-review", index?: number) {
    if (action === "new-request") {
      setOverlay({ kind: "booking" });
    } else if (action === "availability-review") {
      const staleIndex = availability.findIndex((item) => item.kind === "stale");
      setOverlay({ kind: "availability", serviceIndex: index ?? Math.max(staleIndex, 0) });
    } else {
      showInfo(action);
    }
  }

  function updateAvailability(index: number, kind: StatusKind) {
    const labels: Partial<Record<StatusKind, string>> = {
      current: "Current",
      stale: "Needs reconfirmation",
      unknown: "Unknown",
      unavailable: "Unavailable",
      "not-offered": "Not offered",
    };
    const label = labels[kind];
    if (!label || !availability[index]) return;
    setAvailability((items) => items.map((item, itemIndex) => itemIndex === index
      ? { ...item, kind, status: label, updated: "Updated just now", owner: "Clinic staff" }
      : item));
    closeOverlay();
    notify("Service availability status updated.");
  }

  function updateAppointment(id: string, next: "confirmed" | "cancelled") {
    const status = next === "confirmed" ? "Confirmed" : "Cancelled";
    setAppointments((items) => items.map((item) => item.id === id
      ? { ...item, type: next, status, updated: "just now" }
      : item));
    closeOverlay();
    notify(`Clinical request ${next} successfully.`);
  }

  function completeBooking(details: Omit<Appointment, "id" | "status" | "updated" | "type">) {
    const nextId = `MP-${2049 + appointments.length - initialAppointments.length}`;
    setAppointments((items) => [{
      ...details,
      id: nextId,
      status: "Confirmed",
      updated: "just now",
      type: "confirmed",
    }, ...items]);
    closeOverlay();
    notify("Appointment scheduled successfully.");
  }

  function checkInAppointment(id: string) {
    const appointment = appointments.find((item) => item.id === id);
    if (!appointment || appointment.type !== "confirmed") return;
    const token = `Q-${String(20 + queue.length).padStart(3, "0")}`;
    setAppointments((items) => items.map((item) => item.id === id
      ? { ...item, type: "arrived", status: "Checked in", updated: "just now" }
      : item));
    setQueue((items) => [...items, {
      token,
      patient: appointment.patient,
      service: appointment.service,
      arrival: new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()),
      status: "Waiting",
      kind: "pending",
    }]);
    closeOverlay();
    notify(`${appointment.patient} checked in · ${token} added to active queue.`);
  }

  function completePayment(id: string, method: string) {
    setPayments((items) => items.map((item) => item.id === id
      ? { ...item, method, status: "Paid", kind: "completed" }
      : item));
    setOverlay({ kind: "receipt", id });
    notify("Payment recorded successfully. Receipt is ready to print.");
  }

  function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const patient = String(form.get("patient") ?? "").trim();
    const service = String(form.get("service") ?? "");
    const time = String(form.get("time") ?? "");
    if (!/^Patient [•*]{4} \d{4}$/.test(patient) || !service || !time) {
      notify("Please verify all required clinical fields.", "info");
      return;
    }
    const nextId = `MP-${2049 + appointments.length - initialAppointments.length}`;
    setAppointments((items) => [{
      id: nextId,
      date: getLocalDateValue(),
      patient,
      service,
      clinician: "Clinic team",
      time,
      status: "Awaiting confirmation",
      updated: "just now",
      type: "pending",
    }, ...items]);
    closeOverlay();
    notify("Clinical service request submitted successfully.");
  }

  function advanceQueue(token: string) {
    const item = queue.find((entry) => entry.token === token);
    if (!item) return;
    const nextStatus = item.status === "Waiting" ? "In consultation" : "Completed";
    const nextKind: StatusKind = nextStatus === "Completed" ? "completed" : "confirmed";
    setQueue((items) => items.map((entry) => entry.token === token
      ? { ...entry, status: nextStatus, kind: nextKind }
      : entry));
    notify(`${token} queue status updated.`);
  }

  function markReviewed(id: string) {
    setReviewed((items) => new Set(items).add(id));
    notify("Follow-up marked as reviewed.");
  }

  function openAppointment(id: string) {
    setOverlay({ kind: "appointment", id });
  }

  function filterValues<T extends object>(items: T[], fields: Array<keyof T>) {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => fields.some((field) => String(item[field]).toLowerCase().includes(needle)));
  }

  function renderOverview() {
    const followupCount = initialFollowups.filter((item) => !reviewed.has(item.id)).length;
    const todaysAppointments = appointments.filter((item) => item.date === getLocalDateValue());
    const doctorAppointments = appointments.filter((item) => item.clinician === doctors[0].name && item.date === getLocalDateValue());
    const visiblePending = pendingAppointments.filter((item) => (
      `${item.patient} ${item.service} ${item.id}`.toLowerCase().includes(query.trim().toLowerCase())
    ));
    const upcomingForRole = role === "doctor" ? doctorAppointments : appointments.filter((item) => item.date === getLocalDateValue());
    const visibleUpcoming = filterValues(upcomingForRole, ["patient", "service", "clinician", "status", "id"]);
    const dashboardMetrics = role === "doctor" ? [
      { label: "My appointments", value: todaysAppointments.filter((item) => item.clinician === doctors[0].name).length, note: "Scheduled today", icon: <CalendarDays />, attention: false },
      { label: "Checked in", value: todaysAppointments.filter((item) => item.clinician === doctors[0].name && item.type === "arrived").length, note: "Ready for visit", icon: <CheckCircle2 />, attention: false },
      { label: "Next visit", value: todaysAppointments.find((item) => item.clinician === doctors[0].name && item.type === "confirmed")?.time ?? "—", note: "Next consultation", icon: <Clock3 />, attention: false },
      { label: "Availability", value: Object.values(weeklyAvailability).filter((hours) => hours.enabled).length, note: "Active days", icon: <CalendarClock />, attention: false },
    ] : role === "front-desk" ? [
      { label: "Today's appointments", value: todaysAppointments.length, note: "Scheduled today", icon: <CalendarDays />, attention: false },
      { label: "Checked in", value: appointments.filter((item) => item.type === "arrived").length, note: "In waiting area", icon: <CheckCircle2 />, attention: false },
      { label: "Waiting", value: waitingQueue.length, note: "In queue", icon: <ListOrdered />, attention: false },
      { label: "Payments due", value: payments.filter((item) => item.status === "Due").length, note: "Pending payment", icon: <ReceiptText />, attention: true },
    ] : [
      { label: "Awaiting confirmation", value: pendingAppointments.length, note: "Requires review", icon: <Clock3 />, attention: true },
      { label: "Today's appointments", value: todaysAppointments.length, note: "Scheduled today", icon: <CalendarDays />, attention: false },
      { label: "In queue", value: waitingQueue.length, note: "Active queue", icon: <ListOrdered />, attention: false },
      { label: "Follow-ups due", value: followupCount, note: "Action required", icon: <MessageSquareText />, attention: followupCount > 0 },
    ];

    return (
      <>
        <PageHeading
          eyebrow={todayLabel}
          title={role === "doctor" ? "Your clinic day" : role === "front-desk" ? "Today's front desk" : "Today at the clinic"}
          subtitle={role === "doctor" ? "Your schedule and patient visits at a glance." : role === "front-desk" ? "Check-ins, appointments, and payments that need attention." : "A clear view of requests, sessions and follow-ups that need attention."}
          actions={role === "admin" ? <>
            <Button onClick={() => handleAction("availability-review")}><Clock3 />Review availability</Button>
            <Button variant="primary" onClick={() => handleAction("new-request")}><Plus />Book appointment</Button>
          </> : role === "doctor" ? <Button variant="primary" onClick={() => navigate("availability")}><CalendarClock />Edit availability</Button> : <Button variant="primary" onClick={() => handleAction("new-request")}><Plus />Book appointment</Button>}
        />
        <DemoNotice><strong>Demo workspace · patient records only.</strong> Changes made here are temporary and do not reach a clinic, patient, or external partner.</DemoNotice>
        <div className="metric-grid">
          {dashboardMetrics.map((metric) => <MetricCard {...metric} key={metric.label} />)}
        </div>
        <div className="overview-grid">
          <div className="left-stack">
            {role === "doctor"
              ? <Panel title="Your next visits" action={<button className="text-link" type="button" onClick={() => navigate("appointments")}>My schedule <span aria-hidden="true">→</span></button>}>
                <AppointmentTable appointments={visibleUpcoming} onOpen={openAppointment} />
              </Panel>
              : <Panel title="Requests awaiting confirmation" action={<button className="text-link" type="button" onClick={() => navigate("appointments")}>All appointments <span aria-hidden="true">→</span></button>}>
                <div className="panel-kicker panel-header-inline">{visiblePending.length} pending</div>
                <AppointmentRequests appointments={visiblePending} onOpen={openAppointment} />
              </Panel>}
            <Panel title="Today's sessions" action={<button className="text-link" type="button" onClick={() => navigate("schedules")}>View schedule</button>}>
              <div className="session-list">
                {sessions.map((session) => (
                  <div className="session-row" key={`${session.time}-${session.service}`}>
                    <span className="session-time">{session.time}</span><span className="session-marker" aria-hidden="true" />
                    <span className="session-copy"><strong>{session.service}</strong><small>{session.detail}</small></span>
                  </div>
                ))}
              </div>
            </Panel>
            {role !== "doctor" && <Panel title="Upcoming appointments">
              <div className="table-controls"><span className="table-count">Today · {visibleUpcoming.length} patient records</span><button className="text-link" type="button" onClick={() => navigate("appointments")}>Open appointments</button></div>
              <AppointmentTable appointments={visibleUpcoming} onOpen={openAppointment} />
            </Panel>}
          </div>
          <div className="right-stack">
            {role === "admin" && <Panel title="Follow-ups to review" action={<button className="text-link" type="button" onClick={() => navigate("followups")}>Open list</button>}>
              <div className="followup-list">
                {initialFollowups.map((item) => (
                  <label className={`followup-item${reviewed.has(item.id) ? " is-complete" : ""}`} key={item.id}>
                    <input
                      className="followup-check"
                      type="checkbox"
                      checked={reviewed.has(item.id)}
                      onChange={(event) => {
                        if (event.currentTarget.checked) {
                          markReviewed(item.id);
                        } else {
                          setReviewed((items) => {
                            const next = new Set(items);
                            next.delete(item.id);
                            return next;
                          });
                        }
                      }}
                      aria-label={`Mark ${item.title} complete`}
                    />
                    <span className="followup-copy"><strong>{item.title}</strong><small>{item.detail}<br />{reviewed.has(item.id) ? "Reviewed" : item.due}</small></span>
                  </label>
                ))}
              </div>
            </Panel>}
            {role === "admin" && <Panel title="Availability check">
              <div className="availability-card">
                <div className="availability-heading">
                  <span><strong>{staleServices.length ? "Review required" : "Services operational"}</strong><small>{staleServices.length ? `${staleServices.length} need review` : "All clinical services active"}</small></span>
                  {staleServices.length ? <StatusBadge label="Stale" kind="stale" /> : <StatusBadge label="Current" kind="current" />}
                </div>
                <div className="availability-foot">
                  <span>{staleServices.length ? `${staleServices.length} updates pending` : "All systems active"}</span>
                  <button type="button" onClick={() => handleAction("availability-review")}>Review services</button>
                </div>
              </div>
            </Panel>}
            {role === "doctor" && <Panel title="Your weekly availability" action={<button className="text-link" type="button" onClick={() => navigate("availability")}>Edit hours</button>}>
              <div className="availability-card"><div className="availability-heading"><span><strong>{Object.values(weeklyAvailability).filter((hours) => hours.enabled).length} days enabled</strong><small>Regular weekly hours</small></span><StatusBadge label="Active" kind="available" /></div></div>
            </Panel>}
            {(role === "admin" || role === "front-desk") && <Panel title="Queue snapshot">
              <div className="queue-summary">
                <div className="queue-stat"><strong>{String(waitingQueue.length).padStart(2, "0")}</strong><span>Waiting</span></div>
                <div className="queue-stat"><strong>{String(activeQueue.length).padStart(2, "0")}</strong><span>In consultation</span></div>
              </div>
              <div className="availability-foot queue-foot"><span>Live patient queue</span><button type="button" onClick={() => navigate("queue")}>Open queue</button></div>
            </Panel>}
          </div>
        </div>
      </>
    );
  }

  function renderAppointments() {
    return (
      <>
        <PageHeading
          eyebrow="WORKSPACE · APPOINTMENTS"
          title="Appointments"
          subtitle="Review requests and confirmed visits. A request stays unconfirmed until clinic staff acts."
          actions={<>
            <Button variant="primary" onClick={() => handleAction("new-request")}><Plus />Book appointment</Button>
          </>}
        />
        <DemoNotice><strong>Demo records only.</strong> This page is not connected to a booking system. Status changes remain in this browser session.</DemoNotice>
        <div className="panel">
          <div className="table-controls">
            <div className="filter-row">
              <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter appointments by status">
                <option value="all">All statuses</option><option value="pending">Awaiting confirmation</option><option value="confirmed">Confirmed</option><option value="arrived">Checked in</option><option value="cancelled">Cancelled</option>
              </select>
              <label className="date-filter">Date <input className="filter-select date-input" type="date" value={appointmentDateFilter} onChange={(event) => setAppointmentDateFilter(event.target.value)} aria-label="Filter appointments by date" /></label>
            </div>
            <div className="view-switch" role="group" aria-label="Appointment view">
              <button type="button" aria-pressed={appointmentLayout === "list"} onClick={() => setAppointmentLayout("list")}>List</button>
              <button type="button" aria-pressed={appointmentLayout === "day"} onClick={() => setAppointmentLayout("day")}>Day</button>
              <button type="button" aria-pressed={appointmentLayout === "week"} onClick={() => setAppointmentLayout("week")}>Week</button>
            </div>
          </div>
          <div className="calendar-count">{visibleAppointments.length} matching scheduled appointments</div>
          {appointmentLayout === "list"
            ? <AppointmentTable appointments={paginatedAppointments} onOpen={openAppointment} />
            : <AppointmentCalendar appointments={visibleAppointments} mode={appointmentLayout} selectedDate={appointmentDateFilter} onOpen={openAppointment} />}
          {appointmentLayout === "list" && <div className="pagination-controls">
            <span className="table-count">Showing {visibleAppointments.length ? (appointmentPage - 1) * appointmentPageSize + 1 : 0}–{Math.min(appointmentPage * appointmentPageSize, visibleAppointments.length)} of {visibleAppointments.length}</span>
            <nav aria-label="Appointments pagination">
              <Button className="pagination-button" disabled={appointmentPage === 1} onClick={() => setAppointmentPage((page) => Math.max(1, page - 1))}>Previous</Button>
              <span>Page {appointmentPage} of {appointmentPageCount}</span>
              <Button className="pagination-button" disabled={appointmentPage >= appointmentPageCount} onClick={() => setAppointmentPage((page) => Math.min(appointmentPageCount, page + 1))}>Next</Button>
            </nav>
          </div>}
        </div>
        <p className="field-hint page-footnote">Reception list shows only the minimum patient identifier and service information needed for coordination.</p>
      </>
    );
  }

  function renderQueue() {
    const visibleQueue = filterValues(queue, ["token", "patient", "service", "status"]);
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · QUEUE" title="Queue" subtitle="A staff-facing view of check-ins and current session flow." />
        <DemoNotice><strong>Sample queue only.</strong> This demo does not issue real tokens or send queue updates to patients.</DemoNotice>
        <div className="metric-grid metric-grid-two">
          <MetricCard label="Waiting" value={String(waitingQueue.length).padStart(2, "0")} note="In waiting area" icon={<ListOrdered />} />
          <MetricCard label="In consultation" value={String(activeQueue.length).padStart(2, "0")} note="In consultation" icon={<Clock3 />} />
        </div>
        <Panel title="Current queue" action={<span className="panel-kicker">Live queue</span>}>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Token</th><th>Patient</th><th>Service</th><th>Checked in</th><th>Status</th><th>Next step</th></tr></thead>
              <tbody>{visibleQueue.map((item) => (
                <tr key={item.token}>
                  <td><span className="cell-primary">{item.token}</span></td><td>{item.patient}</td><td>{item.service}</td><td>{item.arrival}</td><td><StatusBadge label={item.status} kind={item.kind} /></td>
                  <td>{item.status === "Completed" ? "—" : <button className="table-action" type="button" onClick={() => advanceQueue(item.token)}>{item.status === "Waiting" ? "Call next" : "Mark complete"}</button>}</td>
                </tr>
              ))}</tbody>
            </table>
            {!visibleQueue.length && <div className="empty-state"><strong>No matching queue entries</strong><span>Try another search.</span></div>}
          </div>
        </Panel>
      </>
    );
  }

  function renderSchedules() {
    const rows = filterValues(scheduleRows, ["time", "doctor", "service", "type", "status"]);
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · DOCTORS & SCHEDULES" title="Doctors & schedules" subtitle="Review published sessions and confirm exceptions before patients rely on them." />
        <DemoNotice><strong>Schedule preview.</strong> Clinician profiles and visit sessions are fictional; no calendar integration is connected.</DemoNotice>
        <div className="section-grid">
          <Panel title="Sessions" action={<span className="panel-kicker">Active sessions</span>}>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Time</th><th>Doctor</th><th>Service / session</th><th>Publication</th></tr></thead>
                <tbody>{rows.map((item) => (
                  <tr key={`${item.time}-${item.service}`}><td>{item.time}</td><td>{item.doctor}</td><td><span className="cell-primary">{item.service}</span><span className="cell-secondary">{item.type}</span></td><td><StatusBadge label={item.status} kind={item.kind} /></td></tr>
                ))}</tbody>
              </table>
            </div>
          </Panel>
          <aside className="panel side-note"><h3>Schedule guidelines</h3><p>Verify clinician availability and notify booked patients prior to updating session timings.</p><p className="updated-line">Automated conflict checking active.</p></aside>
        </div>
      </>
    );
  }

  function renderPatients() {
    const patientRecords = role === "doctor"
      ? patientRows.filter((patient) => appointments.some((appointment) => appointment.clinician === doctors[0].name && appointment.patient === patient.patient))
      : patientRows;
    const rows = filterValues(patientRecords, ["id", "patient", "detail", "status"]);
    return (
      <>
        <PageHeading
          eyebrow="WORKSPACE · PATIENTS"
          title="Patient Directory"
          subtitle="Enterprise directory of registered clinic patients, active care plans, and clinical visits."
          actions={
            <Button variant="primary" onClick={() => handleAction("new-request")}>
              <Plus />Book appointment
            </Button>
          }
        />
        <DemoNotice><strong>Clinical directory view.</strong> Fictional masked records demonstrating ERP information hierarchy. Select any patient to review their full clinical profile.</DemoNotice>
        <div className="panel">
          <div className="table-controls">
            <span className="table-count">{rows.length} patient records · clinical reception view</span>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="density-toggle-btn"
                onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}
                title="Toggle table density"
              >
                <Rows /> {density === "compact" ? "Compact view" : "Comfortable view"}
              </button>
              <button className="text-link" type="button" onClick={() => handleAction("patient-info")}>Access guidance</button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Patient / MRN</th>
                  <th scope="col">Last visit</th>
                  <th scope="col">Care plan</th>
                  <th scope="col">Clinical status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="cell-primary">{item.patient}</span>
                      <span className="cell-secondary">{item.id}</span>
                    </td>
                    <td>{item.lastVisit}</td>
                    <td>{item.detail}</td>
                    <td><StatusBadge label={item.status} kind={item.kind} /></td>
                    <td>
                      <button
                        className="table-action"
                        type="button"
                        onClick={() => setOverlay({ kind: "patient-profile", id: item.id })}
                      >
                        Clinical profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <div className="empty-state"><strong>No matching patient records</strong><span>Try searching by masked identifier or service.</span></div>}
          </div>
        </div>
      </>
    );
  }

  function renderServices() {
    const rows = filterValues(availability, ["service", "status", "owner"]);
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · SERVICES & AVAILABILITY" title="Services & availability" subtitle="Make clear what this clinic offers and how recently each service was checked." actions={<Button variant="primary" onClick={() => handleAction("availability-review")}><Check />Confirm availability</Button>} />
        <DemoNotice><strong>Reported status is not a guarantee of care.</strong> Freshness reflects when a staff member last updated the listing.</DemoNotice>
        <Panel title="Service directory" action={<span className="panel-kicker">Main branch</span>}>
          <div className="availability-list">
            {rows.map((item) => {
              const index = availability.findIndex((candidate) => candidate.service === item.service);
              return <div className="availability-list-row" key={item.service}><span><strong>{item.service}</strong><small>{item.updated} · {item.owner}</small></span><StatusBadge label={item.status} kind={item.kind} /><button className="table-action" type="button" onClick={() => handleAction("availability-review", index)}>{item.kind === "stale" ? "Reconfirm" : "Edit"}</button></div>;
            })}
          </div>
        </Panel>
        <div className="section-grid section-grid-spaced">
          <section className="panel side-note"><h3>Service status</h3><p><strong>Current</strong> · Active & available for booking.</p><p><strong>Stale</strong> · Needs routine review.</p><p><strong>Unavailable</strong> · Temporarily paused.</p></section>
          <aside className="panel side-note"><h3>Department capacity</h3><p>Workload levels reflect live staffing and patient volume.</p><p className="updated-line">Operating at standard capacity.</p></aside>
        </div>
      </>
    );
  }

  function renderDiagnostics() {
    const rows = filterValues(diagnosticRows, ["time", "patient", "service", "status"]);
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · DIAGNOSTICS" title="Diagnostics" subtitle="Track external diagnostic referrals without implying that this clinic operates a lab." actions={<Button onClick={() => handleAction("diagnostics-info")}><ArrowUpRight />Referral guidance</Button>} />
        <DemoNotice><strong>No in-house diagnostics are listed.</strong> These examples show external referral tracking only. Reports and partner systems are not connected.</DemoNotice>
        <Panel title="Referral activity" action={<button className="text-link" type="button" onClick={() => handleAction("diagnostics-info")}>How referrals work</button>}>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Time</th><th>Patient</th><th>Service</th><th>Status</th><th>Source</th></tr></thead>
              <tbody>{rows.map((item) => <tr key={`${item.time}-${item.patient}`}><td>{item.time}</td><td>{item.patient}</td><td>{item.service}</td><td><StatusBadge label={item.status} kind={item.kind} /></td><td><span className="cell-secondary">{item.detail}</span></td></tr>)}</tbody>
            </table>
            {!rows.length && <div className="empty-state"><strong>No matching referrals</strong><span>Try another search term.</span></div>}
          </div>
        </Panel>
      </>
    );
  }

  function renderFollowups() {
    const rows = initialFollowups.map((item) => ({
      ...item,
      patient: item.detail.split(" · ")[0],
      status: item.id === "FU-074" ? "Needs review" : "Action needed",
    }));
    const filteredRows = filterValues(rows, ["due", "patient", "title", "status"]);
    const allRows = filteredRows.filter((item) => {
      if (query && !`${item.patient} ${item.title} ${item.due}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (followupFilter === "today") return item.due.toLowerCase().includes("today");
      if (followupFilter === "overdue") return item.due.toLowerCase().includes("overdue");
      return true;
    });
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · REFERRALS & FOLLOW-UPS" title="Referrals & follow-ups" subtitle="Review coordination tasks and record the next administrative action." />
        <DemoNotice><strong>Coordination reminders only.</strong> No clinical advice or referral messages are sent from this demo.</DemoNotice>
        <div className="panel">
          <div className="table-controls"><select className="filter-select" aria-label="Filter follow-ups" value={followupFilter} onChange={(event) => setFollowupFilter(event.target.value)}><option value="all">All open items</option><option value="today">Due today</option><option value="overdue">Overdue</option></select><span className="table-count">{allRows.length} tasks</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Due</th><th>Patient</th><th>Task</th><th>Status</th><th>Next step</th></tr></thead>
              <tbody>{allRows.map((item) => {
                const isReviewed = reviewed.has(item.id);
                return <tr key={item.id}><td>{item.due}</td><td>{item.patient}</td><td>{item.title}</td><td><StatusBadge label={isReviewed ? "Reviewed" : item.status} kind={isReviewed ? "completed" : "review"} /></td><td>{isReviewed ? "—" : <button className="table-action" type="button" onClick={() => markReviewed(item.id)}>Mark reviewed</button>}</td></tr>;
              })}</tbody>
            </table>
            {!allRows.length && <div className="empty-state"><strong>No matching follow-ups</strong><span>Try another search.</span></div>}
          </div>
        </div>
      </>
    );
  }

  function renderPartners() {
    const rows = filterValues(partnerRows, ["name", "detail", "status"]);
    return (
      <>
        <PageHeading eyebrow="MANAGE · PARTNERS" title="Enabled partner modules" subtitle="See which partner workflows are configured for this clinic." actions={<Button onClick={() => handleAction("partner-info")}>Partner requirements</Button>} />
        <DemoNotice><strong>No partner services are operational from this portal.</strong> Do not promise availability or use these entries to coordinate real care.</DemoNotice>
        <Panel title="Partner status" action={<span className="panel-kicker">Active network</span>}>
          <div className="availability-list">
            {rows.map((item) => <div className="availability-list-row" key={item.name}><span><strong>{item.name}</strong><small>{item.detail}</small></span><StatusBadge label={item.status} kind={item.kind} /><button className="table-action" type="button" onClick={() => handleAction("partner-info")}>Learn more</button></div>)}
          </div>
        </Panel>
        <div className="panel side-note section-grid-spaced"><h3>Partner network</h3><p>Integrated pathology laboratories, diagnostic imaging centers, and emergency transport services.</p></div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <PageHeading eyebrow="MANAGE · STAFF & SETTINGS" title="Staff & settings" subtitle="Review branch operational context and security policies." actions={<Button onClick={() => handleAction("settings-help")}>Access guidance</Button>} />
        <DemoNotice><strong>Settings are read-only successfully.</strong> No staff account or clinic permissions are configured.</DemoNotice>
        <div className="section-grid">
          <Panel title="Workspace details">
            <div className="availability-list">
              <div className="availability-list-row"><span><strong>Hospital</strong><small>MediPath Central Hospital</small></span><StatusBadge label="Active" kind="available" /></div>
              <div className="availability-list-row"><span><strong>Branch</strong><small>Outpatient Department</small></span><StatusBadge label="Primary" kind="available" /></div>
              <div className="availability-list-row"><span><strong>Access control</strong><small>Role-based authentication active</small></span><StatusBadge label="Secured" kind="available" /></div>
              <div className="availability-list-row"><span><strong>Database</strong><small>MySQL Connection</small></span><StatusBadge label="Connected" kind="available" /></div>
            </div>
          </Panel>
          <aside className="panel side-note"><h3>Privacy & compliance</h3><p>Patient health information is governed by hospital data protection standards.</p><p className="updated-line">Audit logs synchronized.</p></aside>
        </div>
        <Panel title="Notifications & devices" className="settings-panel">
          <div className="settings-list">
            {([
              ["appointmentAlerts", "Appointment updates", "Get a notification when a booking request needs review."],
              ["queueAlerts", "Queue changes", "Show check-in and queue status updates for today's visits."],
              ["trustedDevice", "Remember this device", "Maintain active session token on this device."],
            ] as const).map(([key, title, description]) => <label className="settings-row" key={key}>
              <span><strong>{title}</strong><small>{description}</small></span>
              <input type="checkbox" role="switch" checked={settingsToggles[key]} onChange={(event) => {
                setSettingsToggles((current) => ({ ...current, [key]: event.target.checked }));
                notify(`${title} ${event.target.checked ? "enabled" : "disabled"} successfully.`);
              }} />
            </label>)}
          </div>
        </Panel>
        <Panel title="Loading feedback & motion system" className="loading-preview-panel">
          <div className="loading-preview">
            <span className="field-hint">Preview the signature glass heartbeat and skeleton transitions used during data refresh.</span>
            <div className="loading-preview-actions">
              {showLoadingPreview && <HeartbeatLoader label="Simulating background clinical sync..." />}
              <Button onClick={previewLoading} disabled={showLoadingPreview}>{showLoadingPreview ? "Preview running" : "Preview glass loader"}</Button>
            </div>
          </div>
          {showLoadingPreview && (
            <div style={{ padding: "0 20px 20px" }}>
              <div className="skeleton-grid">
                <div className="skeleton-card"><div className="skeleton-bar" style={{ width: "40%" }} /><div className="skeleton-bar" style={{ width: "70%", height: "22px", margin: "10px 0" }} /><div className="skeleton-bar" style={{ width: "50%" }} /></div>
                <div className="skeleton-card"><div className="skeleton-bar" style={{ width: "45%" }} /><div className="skeleton-bar" style={{ width: "65%", height: "22px", margin: "10px 0" }} /><div className="skeleton-bar" style={{ width: "40%" }} /></div>
                <div className="skeleton-card"><div className="skeleton-bar" style={{ width: "35%" }} /><div className="skeleton-bar" style={{ width: "80%", height: "22px", margin: "10px 0" }} /><div className="skeleton-bar" style={{ width: "55%" }} /></div>
                <div className="skeleton-card"><div className="skeleton-bar" style={{ width: "50%" }} /><div className="skeleton-bar" style={{ width: "60%", height: "22px", margin: "10px 0" }} /><div className="skeleton-bar" style={{ width: "45%" }} /></div>
              </div>
              <div className="panel" style={{ padding: "10px 0", background: "var(--surface-solid)" }}>
                <div className="skeleton-table-row"><div className="skeleton-bar" style={{ width: "22%" }} /><div className="skeleton-bar" style={{ width: "28%" }} /><div className="skeleton-bar" style={{ width: "16%" }} /><div className="skeleton-bar" style={{ width: "12%", marginLeft: "auto" }} /></div>
                <div className="skeleton-table-row"><div className="skeleton-bar" style={{ width: "18%" }} /><div className="skeleton-bar" style={{ width: "32%" }} /><div className="skeleton-bar" style={{ width: "20%" }} /><div className="skeleton-bar" style={{ width: "12%", marginLeft: "auto" }} /></div>
              </div>
            </div>
          )}
        </Panel>
      </>
    );
  }

  function renderBilling() {
    const paidToday = payments.filter((item) => item.status === "Paid").reduce((total, item) => total + item.amount, 0);
    const outstanding = payments.filter((item) => item.status === "Due").length;
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · BILLING" title="Payments & receipts" subtitle="Record a payment, verify the amount, and print a clear receipt." />
        <DemoNotice><strong>Demo payments only.</strong> No real payment is processed and receipts are not tax invoices.</DemoNotice>
        <div className="metric-grid metric-grid-two">
          <MetricCard label="Collected today" value={`₹${paidToday.toLocaleString("en-IN")}`} note="Collected today" icon={<ReceiptText />} />
          <MetricCard label="Payments due" value={outstanding} note="Pending payment" icon={<Clock3 />} attention={outstanding > 0} />
        </div>
        <Panel title="Recent payments" action={<span className="panel-kicker">Today</span>}>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Receipt</th><th>Patient</th><th>Service</th><th>Amount</th><th>Method</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
              <tbody>{payments.map((item) => <tr key={item.id}>
                <td><span className="cell-primary">{item.id}</span></td><td>{item.patient}</td><td>{item.service}</td>
                <td className="tabular">₹{item.amount.toLocaleString("en-IN")}</td><td>{item.method}</td>
                <td><StatusBadge label={item.status} kind={item.kind} /></td>
                <td>{item.status === "Paid"
                  ? <button className="table-action" type="button" onClick={() => setOverlay({ kind: "receipt", id: item.id })}>View receipt</button>
                  : <Button variant="primary" className="table-action-button" onClick={() => setOverlay({ kind: "payment", id: item.id })}>Take payment</Button>}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </Panel>
      </>
    );
  }

  function renderAvailability() {
    const weekdays = Object.keys(weeklyAvailability) as Array<keyof typeof initialWeeklyAvailability>;
    return (
      <>
        <PageHeading eyebrow="MY SCHEDULE · AVAILABILITY" title="Doctor availability" subtitle="Set your regular clinic hours. Configured hours update live across hospital scheduling." actions={
          <Button variant="primary" onClick={() => notify("Availability saved successfully.")}><Check />Save availability</Button>
        } />
        <DemoNotice><strong>Availability editor preview.</strong> This weekly schedule is local to your browser and does not create appointments or update a live clinic.</DemoNotice>
        <Panel title="Weekly hours" action={<Button onClick={() => setWeeklyAvailability((hours) => ({
          ...hours,
          Tuesday: { ...hours.Monday },
          Wednesday: { ...hours.Monday },
          Thursday: { ...hours.Monday },
          Friday: { ...hours.Monday },
        }))}>Copy Monday to weekdays</Button>}>
          <div className="weekly-editor">
            {weekdays.map((day) => {
              const hours = weeklyAvailability[day];
              return <div className={`weekly-row${hours.enabled ? "" : " is-off"}`} key={day}>
                <label className="day-toggle"><input type="checkbox" checked={hours.enabled} onChange={(event) => setWeeklyAvailability((current) => ({ ...current, [day]: { ...current[day], enabled: event.target.checked } }))} /><span>{day}</span></label>
                {hours.enabled
                  ? <div className="hours-range"><label><span className="visually-hidden">{day} start time</span><input type="time" value={hours.start} onChange={(event) => setWeeklyAvailability((current) => ({ ...current, [day]: { ...current[day], start: event.target.value } }))} /></label><span>to</span><label><span className="visually-hidden">{day} end time</span><input type="time" value={hours.end} onChange={(event) => setWeeklyAvailability((current) => ({ ...current, [day]: { ...current[day], end: event.target.value } }))} /></label></div>
                  : <span className="day-off">Unavailable</span>}
              </div>;
            })}
          </div>
        </Panel>
        <section className="panel side-note section-grid-spaced"><h3>Schedule exceptions</h3><p>Verify clinic coverage before adjusting physician consultation hours.</p><p className="updated-line">Live schedule synchronization active.</p></section>
      </>
    );
  }

  function renderReports() {
    const paidToday = payments.filter((item) => item.status === "Paid").reduce((total, item) => total + item.amount, 0);
    return (
      <>
        <PageHeading eyebrow="MANAGE · REPORTS" title="Clinic reports" subtitle="Departmental throughput, clinic metrics, and revenue summary." />
        <DemoNotice><strong>Illustrative totals only.</strong> This report uses fictional records and is not suitable for financial reconciliation.</DemoNotice>
        <div className="metric-grid">
          <MetricCard label="Appointments" value={appointments.length} note="Total appointments" icon={<CalendarDays />} />
          <MetricCard label="Checked in" value={appointments.filter((item) => item.type === "arrived").length} note="Patient check-ins" icon={<CheckCircle2 />} />
          <MetricCard label="Queue waiting" value={waitingQueue.length} note="In waiting area" icon={<ListOrdered />} />
          <MetricCard label="Collected" value={`₹${paidToday.toLocaleString("en-IN")}`} note="Total collected" icon={<ReceiptText />} />
        </div>
        <Panel title="Activity summary"><div className="report-summary"><p>Daily operational summary of appointments, patient throughput, and collected revenues across clinic departments.</p><Button onClick={() => navigate("appointments")}>Review appointments</Button></div></Panel>
      </>
    );
  }

  function renderStaff() {
    const matchingDoctors = filterValues(doctors, ["name", "specialty"]);
    return (
      <>
        <PageHeading eyebrow="MANAGE · TEAM" title="Doctors & staff" subtitle="Review the care team and their clinic roles." actions={<Button onClick={() => notify("Staff invitations are not enabled successfully.", "info")}><Plus />Invite staff</Button>} />
        <DemoNotice><strong>Staff directory.</strong> Staff accounts, credentials, and permissions are not connected to a live identity provider.</DemoNotice>
        <div className="staff-grid">{matchingDoctors.map((doctor) => <article className="panel staff-card" key={doctor.name}>
          <div className={`staff-avatar avatar-${doctor.color}`}>{doctor.initials}</div>
          <div><h2>{doctor.name}</h2><p>{doctor.specialty}</p></div>
          <StatusBadge label="On schedule" kind="current" />
          <div className="staff-card-foot"><span>Attending Staff</span><button className="table-action" type="button" onClick={() => navigate("availability")}>View availability</button></div>
        </article>)}</div>
        {!matchingDoctors.length && <div className="empty-state"><strong>No matching doctors</strong><span>Try another name or specialty.</span></div>}
      </>
    );
  }

  function renderNotes() {
    return (
      <>
        <PageHeading eyebrow="DOCTOR WORKSPACE · NOTES" title="Visit notes" subtitle="Clinical documentation and patient consultation notes." />
        <Panel title="Today's visits"><div className="availability-list">{appointments.filter((item) => item.type !== "cancelled").slice(0, 4).map((item) => <div className="availability-list-row" key={item.id}>
          <span><strong>{item.patient}</strong><small>{item.time} · {item.service} · {item.clinician}</small></span><StatusBadge label={item.status} kind={item.type} /><button className="table-action" type="button" onClick={() => setOverlay({ kind: "info", title: "Visit notes", body: "Consultation note for this patient visit.", result: "Clinical notes recorded." })}>Open visit</button>
        </div>)}</div></Panel>
      </>
    );
  }

  function renderPage() {
    switch (view) {
      case "appointments": return renderAppointments();
      case "queue": return renderQueue();
      case "schedules": return renderSchedules();
      case "patients": return renderPatients();
      case "services": return renderServices();
      case "diagnostics": return renderDiagnostics();
      case "followups": return renderFollowups();
      case "partners": return renderPartners();
      case "settings": return renderSettings();
      case "billing": return renderBilling();
      case "availability": return renderAvailability();
      case "reports": return renderReports();
      case "staff": return renderStaff();
      case "notes": return renderNotes();
      default: return renderOverview();
    }
  }

  function renderOverlay() {
    if (!overlay) return null;
    if (overlay.kind === "booking") {
      return <DialogFrame title="Book an appointment" description="Choose a patient, select an available doctor and time, then confirm." onClose={closeOverlay}>
        <AppointmentBooking appointments={appointments} onComplete={completeBooking} onCancel={closeOverlay} />
      </DialogFrame>;
    }
    if (overlay.kind === "payment") {
      const payment = payments.find((item) => item.id === overlay.id);
      if (!payment || payment.status === "Paid") return null;
      return <DialogFrame title="Take a payment" description="Verify the payment with the patient before recording it." onClose={closeOverlay}>
        <CashPaymentForm payment={payment} onPay={(method) => completePayment(payment.id, method)} onCancel={closeOverlay} />
      </DialogFrame>;
    }
    if (overlay.kind === "receipt") {
      const receipt = payments.find((item) => item.id === overlay.id);
      if (!receipt || receipt.status !== "Paid") return null;
      return <DialogFrame title="Payment receipt" description="Official clinic payment receipt." onClose={closeOverlay} className="receipt-modal">
        <div className="modal-body">
          <div className="receipt-preview" id="receipt-print">
            <div className="receipt-brand"><img src="/medipath-logo.png" alt="" /><span><strong>MediPath Healthcare</strong><small>Patient Receipt</small></span></div>
            <div className="receipt-success"><CheckCircle2 aria-hidden="true" /><span>Payment received</span></div>
            <dl><div><dt>Receipt number</dt><dd>{receipt.id}</dd></div><div><dt>Date</dt><dd>{receipt.date}</dd></div><div><dt>Patient</dt><dd>{receipt.patient}</dd></div><div><dt>Service</dt><dd>{receipt.service}</dd></div><div><dt>Payment method</dt><dd>{receipt.method}</dd></div><div className="receipt-total"><dt>Total paid</dt><dd>₹{receipt.amount.toLocaleString("en-IN")}</dd></div></dl>
            <p>Official electronic receipt issued by MediPath Clinical Information System.</p>
          </div>
          <div className="modal-actions"><Button onClick={closeOverlay}>Close</Button><Button variant="primary" onClick={() => window.print()}><Printer />Print receipt</Button></div>
        </div>
      </DialogFrame>;
    }
    if (overlay.kind === "info") {
      return (
        <DialogFrame title={overlay.title} onClose={closeOverlay}>
          <div className="modal-body">
            <p className="detail-note detail-note-plain">{overlay.body}<br /><br />{overlay.result}</p>
            <div className="modal-actions"><Button variant="primary" onClick={closeOverlay}>Close</Button></div>
          </div>
        </DialogFrame>
      );
    }
    if (overlay.kind === "availability") {
      return (
        <DialogFrame title="Review reported availability" description="Update the confirmed service status." onClose={closeOverlay}>
          <AvailabilityEditor availability={availability} initialIndex={overlay.serviceIndex} onSave={updateAvailability} onCancel={closeOverlay} />
        </DialogFrame>
      );
    }
    if (overlay.kind === "new-request") {
      return (
        <DialogFrame title="New Appointment Request" description="Record a new patient appointment request." onClose={closeOverlay}>
          <form className="modal-body" onSubmit={addAppointment}>
            <div className="form-field"><label htmlFor="request-service">Service</label><select id="request-service" name="service" required defaultValue=""><option value="" disabled>Choose a service</option><option>General consultation</option><option>Follow-up visit</option><option>Blood pressure review</option></select></div>
            <div className="form-field"><label htmlFor="request-id">Patient Name</label><input id="request-id" name="patient" placeholder="e.g. Elena Rostova" required maxLength={40} /></div>
            <div className="form-field"><label htmlFor="request-time">Requested session</label><select id="request-time" name="time" required defaultValue=""><option value="" disabled>Choose a time</option><option>09:30</option><option>10:00</option><option>10:30</option><option>11:15</option><option>14:00</option></select></div>
            <div className="modal-actions"><Button onClick={closeOverlay}>Cancel</Button><Button variant="primary" type="submit">Add Request</Button></div>
          </form>
        </DialogFrame>
      );
    }
    if (overlay.kind === "patient-profile") {
      const patient = patientRows.find((p) => p.id === overlay.id);
      if (!patient) return null;
      const patientAppointments = appointments.filter((a) => a.patient === patient.patient);
      const patientPayments = payments.filter((p) => p.patient === patient.patient);
      return (
        <DialogFrame title="Patient Clinical Profile" onClose={closeOverlay} variant="drawer">
          <div className="drawer-body">
            <div className="patient-identity-header">
              <div className="patient-identity-top">
                <div className="patient-identity-avatar-wrap">
                  <span className="patient-identity-avatar">{patient.patient.slice(-2)}</span>
                  <div className="patient-identity-meta">
                    <strong>{patient.patient}</strong>
                    <small>MRN: {patient.id} · Age 42y · Female · O+ Blood Group</small>
                  </div>
                </div>
                <StatusBadge label={patient.status} kind={patient.kind} />
              </div>
              <div className="patient-chips-row">
                <span className="patient-chip patient-alert-chip"><AlertTriangle style={{ width: 12, height: 12 }} /> Penicillin Allergy</span>
                <span className="patient-chip"><Activity style={{ width: 12, height: 12 }} /> Vitals: 120/80 mmHg</span>
                <span className="patient-chip"><HeartPulse style={{ width: 12, height: 12 }} /> Pulse: 72 bpm</span>
                <span className="patient-chip">Primary: Dr. Maya Chen</span>
              </div>
            </div>

            <div className="panel" style={{ marginBottom: "16px", background: "var(--surface-solid)" }}>
              <div className="panel-header">
                <h2>Clinical visits & history</h2>
                <span className="panel-kicker">{patientAppointments.length} recorded</span>
              </div>
              <div className="clinical-timeline" style={{ padding: "12px 16px" }}>
                {patientAppointments.length ? patientAppointments.map((apt) => (
                  <div className="clinical-timeline-item" key={apt.id}>
                    <span className="timeline-bullet"><CalendarDays /></span>
                    <div className="timeline-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                        <strong>{apt.service}</strong>
                        <StatusBadge label={apt.status} kind={apt.type} />
                      </div>
                      <small>{apt.date} at {apt.time} · {apt.clinician}</small>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "6px 0" }}>
                    Last activity: {patient.lastVisit} ({patient.detail})
                  </p>
                )}
              </div>
            </div>

            <div className="panel" style={{ background: "var(--surface-solid)" }}>
              <div className="panel-header">
                <h2>Billing & ledger status</h2>
              </div>
              <div style={{ padding: "14px 16px" }}>
                {patientPayments.length ? patientPayments.map((pmt) => (
                  <div key={pmt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <strong style={{ fontSize: "12.5px" }}>{pmt.service}</strong>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pmt.id} · {pmt.method}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong className="tabular" style={{ fontSize: "13px" }}>₹{pmt.amount.toLocaleString("en-IN")}</strong>
                      <div><StatusBadge label={pmt.status} kind={pmt.kind} /></div>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "4px 0" }}>
                    No pending invoices for this patient record.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="drawer-foot">
            <Button onClick={closeOverlay}>Close profile</Button>
            <Button
              variant="primary"
              onClick={() => {
                closeOverlay();
                handleAction("new-request");
              }}
            >
              <Plus /> Book appointment
            </Button>
          </div>
        </DialogFrame>
      );
    }
    const item = appointments.find((appointment) => appointment.id === overlay.id);
    if (!item) return null;
    return (
      <DialogFrame title="Appointment request" onClose={closeOverlay} variant="drawer">
        <div className="drawer-body">
          <div className="detail-patient"><span className="patient-avatar">P</span><span><strong>{item.patient}</strong><small>Request {item.id}</small></span></div>
          <dl className="detail-list">
            <div><dt>Service</dt><dd>{item.service}</dd></div><div><dt>Team</dt><dd>{item.clinician}</dd></div>
            <div><dt>Requested session</dt><dd>{item.time} · {new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${item.date}T12:00:00`))}</dd></div><div><dt>Booking status</dt><dd><StatusBadge label={item.status} kind={item.type} /></dd></div>
            <div><dt>Last updated</dt><dd>{item.updated}</dd></div><div><dt>Branch</dt><dd>Main Outpatient Clinic</dd></div>
          </dl>
          <p className="detail-note">Confirming this request reserves the consultation slot in the clinic schedule.</p>
        </div>
        <div className="drawer-foot">
          {item.type === "pending" && role !== "doctor" ? <>
            <Button variant="danger" onClick={() => updateAppointment(item.id, "cancelled")}>Decline request</Button>
            <Button variant="primary" onClick={() => updateAppointment(item.id, "confirmed")}>Confirm request</Button>
          </> : item.type === "confirmed" ? <>
            <Button onClick={closeOverlay}>Close</Button>
            <Button variant="primary" onClick={() => checkInAppointment(item.id)}><Check />Check in</Button>
          </> : <Button onClick={closeOverlay}>Close</Button>}
        </div>
      </DialogFrame>
    );
  }

  if (!signedIn) {
    return <div className="portal-root" data-theme={theme} style={{ colorScheme: theme }}>
      <SignInScreen onEnter={(nextRole) => { setRole(nextRole); setSignedIn(true); setView("overview"); }} />
    </div>;
  }

  const roleViews: Record<WorkspaceRole, ViewId[]> = {
    admin: ["overview", "appointments", "queue", "schedules", "patients", "services", "diagnostics", "followups", "partners", "billing", "reports", "staff", "settings"],
    doctor: ["overview", "appointments", "schedules", "availability", "patients", "notes", "settings"],
    "front-desk": ["overview", "appointments", "queue", "patients", "billing", "settings"],
  };
  const searchTerm = query.trim().toLowerCase();
  const patientSearchRecords = role === "doctor"
    ? patientRows.filter((patient) => appointments.some((appointment) => appointment.clinician === doctors[0].name && appointment.patient === patient.patient))
    : patientRows;
  const doctorSearchResults = role === "front-desk" ? [] : doctors
    .filter((item) => `${item.name} ${item.specialty}`.toLowerCase().includes(searchTerm))
    .map((item) => ({ kind: "doctor" as const, id: item.name, title: item.name, detail: `${item.specialty} · Doctor` }));
  const globalSearchResults = searchTerm ? [
    ...appointments.filter((item) => `${item.patient} ${item.service} ${item.clinician} ${item.id}`.toLowerCase().includes(searchTerm))
      .map((item) => ({ kind: "appointment" as const, id: item.id, title: item.patient, detail: `${item.time} · ${item.service} · ${item.status}` })),
    ...patientSearchRecords.filter((item) => `${item.patient} ${item.id} ${item.detail}`.toLowerCase().includes(searchTerm))
      .map((item) => ({ kind: "patient" as const, id: item.id, title: item.patient, detail: `${item.detail} · Patient` })),
    ...doctorSearchResults,
  ].slice(0, 7) : [];

  return (
    <div className={`portal-root ${density === "compact" ? "density-compact" : ""}`} data-theme={theme} style={{ colorScheme: theme }}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="app-shell">
        <aside className={`sidebar${mobileNavOpen ? " is-open" : ""}${sidebarCollapsed ? " is-collapsed" : ""}`} aria-label="Clinic navigation">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); navigate("overview"); }} aria-label="MediPath home">
              <span className="brand-mark" aria-hidden="true"><img src="/medipath-logo.png" alt="" /></span>
              <span className="brand-wordmark">
                <img src="/medipath-wordmark.png" alt="" />
                <span>HEALTHCARE ERP</span>
              </span>
            </a>
            {!sidebarCollapsed && (
              <button
                type="button"
                className="sidebar-collapse-toggle"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose />
              </button>
            )}
          </div>
          {sidebarCollapsed && (
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen />
            </button>
          )}
          <div className="branch-switcher">
            <span className="branch-avatar" aria-hidden="true">MC</span>
            <span className="branch-copy">
              <strong>MediPath Campus</strong>
              <small><span className="branch-status-dot" aria-hidden="true" /> Main Hospital · Live</small>
            </span>
          </div>
          <nav className="primary-nav" aria-label="Workspace sections">
            {navCategories.map((group) => {
              const itemsInGroup = group.items.filter((id) => roleViews[role].includes(id));
              if (!itemsInGroup.length) return null;
              return (
                <div className="nav-group" key={group.category}>
                  <p className="nav-label">{group.category}</p>
                  {itemsInGroup.map((id) => {
                    const item = navItems.find((n) => n.id === id);
                    if (!item) return null;
                    const Icon = item.icon;
                    return (
                      <button
                        className={`nav-item${view === item.id ? " is-active" : ""}`}
                        type="button"
                        key={item.id}
                        data-view={item.id}
                        onClick={() => navigate(item.id)}
                        aria-current={view === item.id ? "page" : undefined}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <span className="nav-icon"><Icon /></span>
                        <span>{item.label}</span>
                        {item.id === "appointments" && <span className="nav-count">{appointments.length}</span>}
                        {item.id === "services" && staleServices.length > 0 && <span className="nav-alert" aria-label="Needs review" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <div className="profile-summary" aria-label="Staff profile">
              <span className="profile-avatar" aria-hidden="true">{role === "admin" ? "AD" : role === "doctor" ? "DR" : "FD"}</span>
              <span className="profile-copy">
                <strong>{roleLabels[role]}</strong>
                <small>Connected · Clinical Access</small>
              </span>
            </div>
          </div>
        </aside>

        <div className={`page-column${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
          {isOffline && <div className="offline-banner" role="status"><span aria-hidden="true">!</span> Network offline. Working with local cached records.</div>}
          <header className="topbar">
            <IconButton className="menu-button" label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><Menu /></IconButton>
            <div className="breadcrumb">
              <span>MediPath Admin</span>
              <span className="crumb-separator">/</span>
              <strong>{currentTitle}</strong>
            </div>
            <div className="topbar-tools">
              {(role === "admin" || role === "front-desk") && <Button variant="primary" className="topbar-book" onClick={() => handleAction("new-request")}><Plus />Book appointment</Button>}
              <div className="search-container">
                <label className="global-search">
                  <Search aria-hidden="true" />
                  <input ref={searchRef} type="search" value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} placeholder="Search clinic..." aria-label="Search patients, doctors, and appointments" aria-expanded={searchOpen && Boolean(searchTerm)} aria-controls="global-search-results" />
                  <kbd>⌘ K</kbd>
                </label>
                {searchOpen && searchTerm && <div className="search-results" id="global-search-results" role="region" aria-label="Search results">
                  {globalSearchResults.length ? globalSearchResults.map((result) => <button type="button" className="search-result" key={`${result.kind}-${result.id}`} onClick={() => {
                    setSearchOpen(false);
                    if (result.kind === "appointment") {
                      navigate("appointments");
                      openAppointment(result.id);
                    } else if (result.kind === "patient") {
                      navigate("patients");
                      setQuery(result.title);
                    } else {
                      navigate(role === "admin" ? "staff" : "schedules");
                      setQuery(result.title);
                    }
                  }}>
                    <span className="search-result-icon">{result.kind === "appointment" ? <CalendarDays /> : result.kind === "patient" ? <UserRound /> : <Stethoscope />}</span>
                    <span><strong>{result.title}</strong><small>{result.detail}</small></span>
                  </button>) : <p className="search-empty">No patients, doctors, or appointments found.</p>}
                </div>}
              </div>
              <IconButton label="Notifications" onClick={() => setOverlay({ kind: "info", title: "Notifications", body: "No urgent alerts or clinical reminders at this time.", result: "System operational." })}><Bell /></IconButton>
              <IconButton
                className="theme-toggle"
                label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon /> : <Sun />}
              </IconButton>
              <IconButton
                label={density === "comfortable" ? "Switch to compact table density" : "Switch to comfortable density"}
                title={density === "comfortable" ? "Compact density" : "Comfortable density"}
                onClick={() => setDensity((d) => d === "comfortable" ? "compact" : "comfortable")}
              >
                <Rows />
              </IconButton>
              <IconButton label="Sign out" onClick={() => { setSignedIn(false); setQuery(""); }}><LogOut /></IconButton>
            </div>
          </header>
          <main className="main-content" id="main-content" tabIndex={-1} ref={mainRef}>
            <div className="page-transition-enter" key={view}>
              {renderPage()}
            </div>
          </main>
        </div>
        {mobileNavOpen && <button className="sidebar-scrim is-visible" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      </div>
      {overlay && <div className="overlay-root">{renderOverlay()}</div>}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast && <div className={`toast${toast.tone === "info" ? " toast-info" : ""}`} role="status">{toast.text}</div>}
      </div>
    </div>
  );
}

export default App;
