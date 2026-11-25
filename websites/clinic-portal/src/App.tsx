import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes, FormEvent, ReactNode, RefObject } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  HeartPulse,
  ListOrdered,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  diagnosticRows,
  getLocalDateValue,
  initialAppointments,
  initialAvailability,
  initialFollowups,
  initialQueue,
  navItems,
  partnerRows,
  patientRows,
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
  | { kind: "info"; title: string; body: string; result: string }
  | null;
type ActionId = "patient-info" | "diagnostics-info" | "partner-info" | "settings-help";

const todayLabel = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

const actionMessages: Record<ActionId, { title: string; body: string; result: string }> = {
  "patient-info": {
    title: "Patient information access",
    body: "Reception views should show only the minimum information required to coordinate a visit. Clinical notes and reports are intentionally absent here.",
    result: "This page contains only fictional, masked identifiers.",
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
    result: "Staff access settings are not configured in this demo.",
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
  return <span className={`status status-${kind}`}>{label}</span>;
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
  return (
    <div className="demo-notice">
      <span className="notice-icon" aria-hidden="true">i</span>
      <div>{children}</div>
    </div>
  );
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
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  variant?: "modal" | "drawer";
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
        className="modal"
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
        <Button variant="primary" type="submit">Update demo status</Button>
      </div>
    </form>
  );
}

function App() {
  const [view, setView] = useState<ViewId>("overview");
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
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

  const currentTitle = navItems.find((item) => item.id === view)?.label ?? "Overview";
  const pendingAppointments = appointments.filter((item) => item.type === "pending");
  const staleServices = availability.filter((item) => item.kind === "stale");
  const waitingQueue = queue.filter((item) => item.status === "Waiting");
  const activeQueue = queue.filter((item) => item.status === "In consultation");

  const visibleAppointments = useMemo(() => appointments.filter((item) => {
    const searchText = `${item.patient} ${item.service} ${item.clinician} ${item.id} ${item.status}`.toLowerCase();
    const matchesSearch = searchText.includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || item.type === statusFilter;
    const matchesDate = item.date === appointmentDateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  }), [appointments, query, statusFilter, appointmentDateFilter]);
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
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName ?? "")) {
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
      setOverlay({ kind: "new-request" });
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
    notify("Reported availability updated in this demo only.");
  }

  function updateAppointment(id: string, next: "confirmed" | "cancelled") {
    const status = next === "confirmed" ? "Confirmed" : "Cancelled";
    setAppointments((items) => items.map((item) => item.id === id
      ? { ...item, type: next, status, updated: "just now" }
      : item));
    closeOverlay();
    notify(`Sample request ${next} in this demo only.`);
  }

  function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const patient = String(form.get("patient") ?? "").trim();
    const service = String(form.get("service") ?? "");
    const time = String(form.get("time") ?? "");
    if (!/^Patient [•*]{4} \d{4}$/.test(patient) || !service || !time) {
      notify("Use the fictional identifier format shown and complete each field.", "info");
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
    notify("Sample request added. It is not sent to a clinic or patient.");
  }

  function advanceQueue(token: string) {
    const item = queue.find((entry) => entry.token === token);
    if (!item) return;
    const nextStatus = item.status === "Waiting" ? "In consultation" : "Completed";
    const nextKind: StatusKind = nextStatus === "Completed" ? "completed" : "confirmed";
    setQueue((items) => items.map((entry) => entry.token === token
      ? { ...entry, status: nextStatus, kind: nextKind }
      : entry));
    notify(`${token} updated in the sample queue only.`);
  }

  function markReviewed(id: string) {
    setReviewed((items) => new Set(items).add(id));
    notify("Follow-up marked reviewed in this demo.");
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
    const visiblePending = pendingAppointments.filter((item) => (
      `${item.patient} ${item.service} ${item.id}`.toLowerCase().includes(query.trim().toLowerCase())
    ));
    const visibleUpcoming = filterValues(appointments, ["patient", "service", "clinician", "status", "id"]);

    return (
      <>
        <PageHeading
          eyebrow={todayLabel}
          title="Today at the clinic"
          subtitle="A clear view of requests, sessions and follow-ups that need attention."
          actions={<>
            <Button onClick={() => handleAction("availability-review")}><Clock3 />Review availability</Button>
            <Button variant="primary" onClick={() => handleAction("new-request")}><Plus />New request</Button>
          </>}
        />
        <DemoNotice><strong>Demo workspace · sample records only.</strong> Changes made here are temporary and do not reach a clinic, patient, or external partner.</DemoNotice>
        <div className="metric-grid">
          <MetricCard label="Awaiting confirmation" value={pendingAppointments.length} note="Requests need a staff decision" icon={<Clock3 />} attention />
          <MetricCard label="Today's appointments" value={todaysAppointments.length} note="Sample visits for today" icon={<CalendarDays />} />
          <MetricCard label="In queue" value={waitingQueue.length} note="Check-in status is demo data" icon={<ListOrdered />} />
          <MetricCard label="Follow-ups due" value={followupCount} note="Review tasks for clinic staff" icon={<MessageSquareText />} attention={followupCount > 0} />
        </div>
        <div className="overview-grid">
          <div className="left-stack">
            <Panel title="Requests awaiting confirmation" action={<button className="text-link" type="button" onClick={() => navigate("appointments")}>All appointments <span aria-hidden="true">→</span></button>}>
              <div className="panel-kicker panel-header-inline">{visiblePending.length} need review</div>
              <AppointmentRequests appointments={visiblePending} onOpen={openAppointment} />
            </Panel>
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
            <Panel title="Upcoming appointments">
              <div className="table-controls"><span className="table-count">Today · {visibleUpcoming.length} sample records</span><button className="text-link" type="button" onClick={() => navigate("appointments")}>Open appointments</button></div>
              <AppointmentTable appointments={visibleUpcoming} onOpen={openAppointment} />
            </Panel>
          </div>
          <div className="right-stack">
            <Panel title="Follow-ups to review" action={<button className="text-link" type="button" onClick={() => navigate("followups")}>Open list</button>}>
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
                    <span className="followup-copy"><strong>{item.title}</strong><small>{item.detail}<br />{reviewed.has(item.id) ? "Reviewed in demo" : item.due}</small></span>
                  </label>
                ))}
              </div>
            </Panel>
            <Panel title="Availability check">
              <div className="availability-card">
                <div className="availability-heading">
                  <span><strong>{staleServices.length ? "Services need review" : "No stale services reported"}</strong><small>{staleServices.length ? `${staleServices.length} report${staleServices.length === 1 ? "" : "s"} may be out of date.` : "Reported status is current for this demo."}</small></span>
                  {staleServices.length ? <StatusBadge label="Stale" kind="stale" /> : <StatusBadge label="Current" kind="current" />}
                </div>
                <div className="availability-foot">
                  <span>{staleServices.length ? <>{staleServices[0].updated}<br />By {staleServices[0].owner}</> : "Last reviewed in this demo"}</span>
                  <button type="button" onClick={() => handleAction("availability-review")}>Review services</button>
                </div>
              </div>
            </Panel>
            <Panel title="Queue snapshot">
              <div className="queue-summary">
                <div className="queue-stat"><strong>{String(waitingQueue.length).padStart(2, "0")}</strong><span>Waiting</span></div>
                <div className="queue-stat"><strong>{String(activeQueue.length).padStart(2, "0")}</strong><span>In consultation</span></div>
              </div>
              <div className="availability-foot queue-foot"><span>Sample queue · no patient names shown</span><button type="button" onClick={() => navigate("queue")}>Open queue</button></div>
            </Panel>
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
            <Button variant="primary" onClick={() => handleAction("new-request")}><Plus />New request</Button>
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
            <span className="table-count">{visibleAppointments.length} matching sample appointments</span>
          </div>
          <AppointmentTable appointments={paginatedAppointments} onOpen={openAppointment} />
          <div className="pagination-controls">
            <span className="table-count">Showing {visibleAppointments.length ? (appointmentPage - 1) * appointmentPageSize + 1 : 0}–{Math.min(appointmentPage * appointmentPageSize, visibleAppointments.length)} of {visibleAppointments.length}</span>
            <nav aria-label="Appointments pagination">
              <Button className="pagination-button" disabled={appointmentPage === 1} onClick={() => setAppointmentPage((page) => Math.max(1, page - 1))}>Previous</Button>
              <span>Page {appointmentPage} of {appointmentPageCount}</span>
              <Button className="pagination-button" disabled={appointmentPage >= appointmentPageCount} onClick={() => setAppointmentPage((page) => Math.min(appointmentPageCount, page + 1))}>Next</Button>
            </nav>
          </div>
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
          <MetricCard label="Waiting" value={String(waitingQueue.length).padStart(2, "0")} note="Across current sessions" icon={<ListOrdered />} />
          <MetricCard label="In consultation" value={String(activeQueue.length).padStart(2, "0")} note="Sample status only" icon={<Clock3 />} />
        </div>
        <Panel title="Current queue" action={<span className="panel-kicker">Local demo records</span>}>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Token</th><th>Patient identifier</th><th>Service</th><th>Checked in</th><th>Status</th><th>Next step</th></tr></thead>
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
    const rows = filterValues(scheduleRows, ["time", "service", "type", "status"]);
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · DOCTORS & SCHEDULES" title="Doctors & schedules" subtitle="Review published sessions and confirm exceptions before patients rely on them." />
        <DemoNotice><strong>Schedule preview.</strong> No clinician identities or calendar integrations are configured in this demo.</DemoNotice>
        <div className="section-grid">
          <Panel title="Sessions" action={<span className="panel-kicker">Today and upcoming</span>}>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Time</th><th>Service / session</th><th>Publication</th></tr></thead>
                <tbody>{rows.map((item) => (
                  <tr key={`${item.time}-${item.service}`}><td>{item.time}</td><td><span className="cell-primary">{item.service}</span><span className="cell-secondary">{item.type}</span></td><td><StatusBadge label={item.status} kind={item.kind} /></td></tr>
                ))}</tbody>
              </table>
            </div>
          </Panel>
          <aside className="panel side-note"><h3>Before changing a session</h3><p>Check existing bookings and tell affected patients before changing a published time or capacity.</p><p>Visiting sessions need location and date confirmation before they are visible to patients.</p><p className="updated-line">Booking-impact warnings are not connected in this demo.</p></aside>
        </div>
      </>
    );
  }

  function renderPatients() {
    const rows = filterValues(patientRows, ["id", "patient", "detail", "status"]);
    return (
      <>
        <PageHeading eyebrow="WORKSPACE · PATIENTS" title="Patients" subtitle="Find a patient record by its masked identifier or related service." />
        <DemoNotice><strong>Fictional identifiers only.</strong> There are no medical records or personal patient details in this workspace.</DemoNotice>
        <div className="panel">
          <div className="table-controls"><span className="table-count">5 sample records · limited reception view</span><button className="text-link" type="button" onClick={() => handleAction("patient-info")}>Access guidance</button></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Patient identifier</th><th>Last activity</th><th>Service</th><th>Status</th></tr></thead>
              <tbody>{rows.map((item) => <tr key={item.id}><td><span className="cell-primary">{item.patient}</span><span className="cell-secondary">{item.id}</span></td><td>{item.lastVisit}</td><td>{item.detail}</td><td><StatusBadge label={item.status} kind={item.kind} /></td></tr>)}</tbody>
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
        <Panel title="Service directory" action={<span className="panel-kicker">Main branch · demo</span>}>
          <div className="availability-list">
            {rows.map((item) => {
              const index = availability.findIndex((candidate) => candidate.service === item.service);
              return <div className="availability-list-row" key={item.service}><span><strong>{item.service}</strong><small>{item.updated} · {item.owner}</small></span><StatusBadge label={item.status} kind={item.kind} /><button className="table-action" type="button" onClick={() => handleAction("availability-review", index)}>{item.kind === "stale" ? "Reconfirm" : "Edit"}</button></div>;
            })}
          </div>
        </Panel>
        <div className="section-grid section-grid-spaced">
          <section className="panel side-note"><h3>Availability states</h3><p><strong>Current</strong> · recently confirmed by clinic staff.</p><p><strong>Stale</strong> · the last update is outside the clinic's review window.</p><p><strong>Unknown</strong> · no current report. Do not imply availability.</p><p><strong>Unavailable / Not offered</strong> · explicit service status, not a booking outcome.</p></section>
          <aside className="panel side-note"><h3>Operational load</h3><p>Normal, busy and emergency load describe staff-reported workload only. They do not indicate clinical capability or acceptance of a patient.</p><p className="updated-line">No load status is being reported in this demo.</p></aside>
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
              <thead><tr><th>Time</th><th>Patient identifier</th><th>Service</th><th>Status</th><th>Source</th></tr></thead>
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
          <div className="table-controls"><select className="filter-select" aria-label="Filter follow-ups" value={followupFilter} onChange={(event) => setFollowupFilter(event.target.value)}><option value="all">All open items</option><option value="today">Due today</option><option value="overdue">Overdue</option></select><span className="table-count">{allRows.length} sample tasks</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Due</th><th>Patient identifier</th><th>Task</th><th>Status</th><th>Next step</th></tr></thead>
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
        <Panel title="Partner status" action={<span className="panel-kicker">Main branch · demo configuration</span>}>
          <div className="availability-list">
            {rows.map((item) => <div className="availability-list-row" key={item.name}><span><strong>{item.name}</strong><small>{item.detail}</small></span><StatusBadge label={item.status} kind={item.kind} /><button className="table-action" type="button" onClick={() => handleAction("partner-info")}>Learn more</button></div>)}
          </div>
        </Panel>
        <div className="panel side-note section-grid-spaced"><h3>Keep the handoff explicit</h3><p>A referral submitted is not a test booking. A request received is not a confirmed appointment. Partner acknowledgement and the responsible organisation should be visible before a patient relies on an update.</p></div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <PageHeading eyebrow="MANAGE · STAFF & SETTINGS" title="Staff & settings" subtitle="Review this workspace's branch context and demonstration access details." actions={<Button onClick={() => handleAction("settings-help")}>Access guidance</Button>} />
        <DemoNotice><strong>Settings are read-only in this demo.</strong> No staff account or clinic permissions are configured.</DemoNotice>
        <div className="section-grid">
          <Panel title="Workspace details">
            <div className="availability-list">
              <div className="availability-list-row"><span><strong>Clinic</strong><small>Demonstration workspace · not a real provider</small></span><StatusBadge label="Demo" kind="unknown" /></div>
              <div className="availability-list-row"><span><strong>Branch</strong><small>Main branch · sample context</small></span><StatusBadge label="Sample" kind="unknown" /></div>
              <div className="availability-list-row"><span><strong>Signed-in role</strong><small>Clinic staff · reception view</small></span><StatusBadge label="Preview" kind="unknown" /></div>
              <div className="availability-list-row"><span><strong>Data connection</strong><small>Local in-memory sample records</small></span><StatusBadge label="No backend" kind="not-offered" /></div>
            </div>
          </Panel>
          <aside className="panel side-note"><h3>Privacy reminder</h3><p>Use minimum necessary information in reception workflows. Clinical notes, diagnostic reports and patient contact details are not part of this demo.</p><p className="updated-line">Session changes reset when the page is reloaded.</p></aside>
        </div>
        <Panel title="Loading feedback" className="loading-preview-panel">
          <div className="loading-preview">
            <span className="field-hint">Preview the heartbeat treatment used for loading states.</span>
            <div className="loading-preview-actions">
              {showLoadingPreview && <HeartbeatLoader label="Previewing loading state" />}
              <Button onClick={previewLoading} disabled={showLoadingPreview}>{showLoadingPreview ? "Preview running" : "Preview heartbeat"}</Button>
            </div>
          </div>
        </Panel>
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
      default: return renderOverview();
    }
  }

  function renderOverlay() {
    if (!overlay) return null;
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
        <DialogFrame title="Review reported availability" description="Update the staff-reported service status. This only changes the local demo view." onClose={closeOverlay}>
          <AvailabilityEditor availability={availability} initialIndex={overlay.serviceIndex} onSave={updateAvailability} onCancel={closeOverlay} />
        </DialogFrame>
      );
    }
    if (overlay.kind === "new-request") {
      return (
        <DialogFrame title="Add a demo request" description="Create a temporary sample entry to try the review flow. No real patient or clinic will be contacted." onClose={closeOverlay}>
          <form className="modal-body" onSubmit={addAppointment}>
            <div className="form-field"><label htmlFor="request-service">Service</label><select id="request-service" name="service" required defaultValue=""><option value="" disabled>Choose a service</option><option>General consultation</option><option>Follow-up visit</option><option>Blood pressure review</option></select></div>
            <div className="form-field"><label htmlFor="request-id">Masked patient identifier</label><input id="request-id" name="patient" placeholder="Patient •••• 0000" pattern="Patient [•*]{4} [0-9]{4}" required maxLength={30} /><span className="field-hint">Fictional format only: Patient •••• 2040.</span></div>
            <div className="form-field"><label htmlFor="request-time">Requested session</label><select id="request-time" name="time" required defaultValue=""><option value="" disabled>Choose a time</option><option>09:30</option><option>10:00</option><option>10:30</option><option>11:15</option><option>14:00</option></select></div>
            <div className="modal-actions"><Button onClick={closeOverlay}>Cancel</Button><Button variant="primary" type="submit">Add sample request</Button></div>
          </form>
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
            <div><dt>Requested session</dt><dd>{item.time} · Today</dd></div><div><dt>Booking status</dt><dd><StatusBadge label={item.status} kind={item.type} /></dd></div>
            <div><dt>Last updated</dt><dd>{item.updated}</dd></div><div><dt>Branch</dt><dd>Main branch · Demo</dd></div>
          </dl>
          <p className="detail-note">This is a fictional request in an interactive demo. Confirming or cancelling updates only this page's sample state; no patient is notified.</p>
        </div>
        <div className="drawer-foot">
          {item.type === "pending" ? <>
            <Button variant="danger" onClick={() => updateAppointment(item.id, "cancelled")}>Decline request</Button>
            <Button variant="primary" onClick={() => updateAppointment(item.id, "confirmed")}>Confirm request</Button>
          </> : <Button onClick={closeOverlay}>Close</Button>}
        </div>
      </DialogFrame>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="app-shell">
        <aside className={`sidebar${mobileNavOpen ? " is-open" : ""}`} aria-label="Clinic navigation">
          <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); navigate("overview"); }} aria-label="MediPath clinic workspace home">
            <span className="brand-mark" aria-hidden="true"><HeartPulse /></span>
            <span className="brand-name">MediPath<span>CLINIC WORKSPACE</span></span>
          </a>
          <div className="branch-switcher">
            <span className="branch-avatar" aria-hidden="true">MC</span>
            <span className="branch-copy"><strong>MediPath Clinic</strong><small>Main branch · Demo</small></span>
          </div>
          <nav className="primary-nav" aria-label="Workspace sections">
            <p className="nav-label">WORKSPACE</p>
            {navItems.slice(0, 8).map((item) => {
              const Icon = item.icon;
              return (
                <button className={`nav-item${view === item.id ? " is-active" : ""}`} type="button" key={item.id} data-view={item.id} onClick={() => navigate(item.id)} aria-current={view === item.id ? "page" : undefined}>
                  <span className="nav-icon"><Icon /></span><span>{item.label}</span>
                  {item.id === "appointments" && <span className="nav-count">{appointments.length}</span>}
                  {item.id === "services" && staleServices.length > 0 && <span className="nav-alert" aria-label="Needs review" />}
                </button>
              );
            })}
            <p className="nav-label nav-label-spaced">MANAGE</p>
            {navItems.slice(8).map((item) => {
              const Icon = item.icon;
              return <button className={`nav-item${view === item.id ? " is-active" : ""}`} type="button" key={item.id} data-view={item.id} onClick={() => navigate(item.id)} aria-current={view === item.id ? "page" : undefined}><span className="nav-icon"><Icon /></span><span>{item.label}</span></button>;
            })}
          </nav>
          <div className="sidebar-bottom">
            <div className="profile-summary" aria-label="Demo role preview">
              <span className="profile-avatar" aria-hidden="true">ST</span><span className="profile-copy"><strong>Clinic staff</strong><small>Reception role · demo</small></span>
            </div>
          </div>
        </aside>

        <div className="page-column">
          <header className="topbar">
            <IconButton className="menu-button" label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><Menu /></IconButton>
            <div className="breadcrumb"><span>Clinic workspace</span><span className="crumb-separator">/</span><strong>{currentTitle}</strong></div>
            <div className="topbar-tools">
              <span className="demo-label"><span />Demo workspace</span>
              <label className="global-search">
                <Search aria-hidden="true" />
                <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this page" aria-label="Search current page" />
                <kbd>/</kbd>
              </label>
            </div>
          </header>
          <main className="main-content" id="main-content" tabIndex={-1} ref={mainRef}>
            {renderPage()}
          </main>
        </div>
        {mobileNavOpen && <button className="sidebar-scrim is-visible" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      </div>
      {overlay && <div className="overlay-root">{renderOverlay()}</div>}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast && <div className={`toast${toast.tone === "info" ? " toast-info" : ""}`} role="status">{toast.text}</div>}
      </div>
    </>
  );
}

export default App;
