const iconPaths = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="13" width="7" height="8" rx="1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  queue: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r=".7"/><circle cx="4" cy="12" r=".7"/><circle cx="4" cy="18" r=".7"/>',
  schedule: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0M19 8h3M20.5 6.5v3"/>',
  patients: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M16 11h6"/>',
  services: '<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="19" r="2"/>',
  diagnostics: '<path d="M9 3v7.5L4 19a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8.5V3M8 3h8M8 16h8"/>',
  followup: '<path d="M20 11.5a8.4 8.4 0 0 1-8.5 8.5 9.2 9.2 0 0 1-4-.9L3 21l1.5-4.1a9.2 9.2 0 0 1-.9-4A8.4 8.4 0 0 1 12 4.5a8.4 8.4 0 0 1 8 7Z"/><path d="M8 12h8M12 8v8"/>',
  partners: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 11l2 2 4-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>'
};

const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || ""}</svg>`;
const todayLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
const appointments = [
  { id: "MP-2048", patient: "Patient •••• 2841", service: "General consultation", clinician: "General medicine", time: "09:30", status: "Awaiting confirmation", updated: "8 min ago", type: "pending" },
  { id: "MP-2047", patient: "Patient •••• 1093", service: "Follow-up visit", clinician: "General medicine", time: "10:00", status: "Confirmed", updated: "22 min ago", type: "confirmed" },
  { id: "MP-2046", patient: "Patient •••• 6380", service: "Blood pressure review", clinician: "Nursing desk", time: "10:30", status: "Confirmed", updated: "34 min ago", type: "confirmed" },
  { id: "MP-2045", patient: "Patient •••• 7152", service: "General consultation", clinician: "General medicine", time: "11:15", status: "Awaiting confirmation", updated: "51 min ago", type: "pending" }
];
const sessionData = [
  { time: "09:00", service: "General medicine", detail: "Consultation session", count: "4 bookings" },
  { time: "11:30", service: "Nursing desk", detail: "Vitals &amp; review", count: "3 bookings" },
  { time: "14:00", service: "General medicine", detail: "Afternoon session", count: "6 bookings" }
];
const followupData = [
  { id: "FU-081", title: "Referral response due", detail: "Patient •••• 4550 · Referred externally", due: "Review today" },
  { id: "FU-079", title: "Follow-up reminder", detail: "Patient •••• 2038 · General consultation", due: "Due today" },
  { id: "FU-074", title: "Update requested", detail: "Patient •••• 9902 · Appointment outcome", due: "1 day overdue" }
];
const availabilityData = [
  { service: "General consultation", status: "Current", kind: "current", updated: "Updated 18 min ago", owner: "Clinic staff" },
  { service: "Nursing desk", status: "Needs reconfirmation", kind: "stale", updated: "Last updated yesterday", owner: "Clinic staff" },
  { service: "Diagnostics", status: "Not offered", kind: "not-offered", updated: "No in-house service listed", owner: "Clinic staff" }
];
const patientsData = [
  { id: "PT-2841", patient: "Patient •••• 2841", lastVisit: "Today, 09:30", detail: "General consultation", status: "Awaiting confirmation", kind: "pending" },
  { id: "PT-1093", patient: "Patient •••• 1093", lastVisit: "Today, 10:00", detail: "Follow-up visit", status: "Confirmed", kind: "confirmed" },
  { id: "PT-6380", patient: "Patient •••• 6380", lastVisit: "Today, 10:30", detail: "Blood pressure review", status: "Confirmed", kind: "confirmed" },
  { id: "PT-4550", patient: "Patient •••• 4550", lastVisit: "Nov 22, 2026", detail: "External referral", status: "Needs follow-up", kind: "review" },
  { id: "PT-2038", patient: "Patient •••• 2038", lastVisit: "Nov 20, 2026", detail: "General consultation", status: "Follow-up due", kind: "review" }
];
const scheduleData = [
  { time: "09:00 – 11:30", service: "General medicine", type: "Consultation session", availability: "6 / 8 slots", status: "Current", kind: "current" },
  { time: "11:30 – 13:00", service: "Nursing desk", type: "Vitals &amp; review", availability: "3 / 5 slots", status: "Current", kind: "current" },
  { time: "14:00 – 17:00", service: "General medicine", type: "Consultation session", availability: "6 / 8 slots", status: "Current", kind: "current" },
  { time: "Wed · 10:00 – 12:00", service: "Visiting specialist", type: "Schedule needs confirmation", availability: "Not published", status: "Needs review", kind: "review" }
];
const diagnosticData = [
  { time: "10:15", patient: "Patient •••• 9901", service: "External lab referral", status: "Referral sent", kind: "confirmed", detail: "Partner-reported status · updated yesterday" },
  { time: "13:40", patient: "Patient •••• 6178", service: "External lab referral", status: "Awaiting update", kind: "pending", detail: "No result reported to this workspace" }
];
const followupTableData = [
  ...followupData.map((item) => ({ time: item.due, patient: item.detail.split(" · ")[0], service: item.title, status: item.id === "FU-074" ? "Needs review" : "Action needed", kind: "review" })),
  { time: "Tomorrow", patient: "Patient •••• 7719", service: "Follow-up appointment", status: "Scheduled", kind: "confirmed" }
];
let currentView = "overview";
let openDrawerId = null;
let focusedBeforeOverlay = null;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const statusBadge = (label, kind) => `<span class="status status-${escapeHtml(kind)}">${escapeHtml(label)}</span>`;
const appointmentRow = (item) => `<tr data-searchable="${escapeHtml(`${item.patient} ${item.service} ${item.clinician} ${item.id} ${item.status}`.toLowerCase())}">
  <td><span class="cell-primary">${escapeHtml(item.patient)}</span><span class="cell-secondary">${escapeHtml(item.id)}</span></td>
  <td><span class="cell-primary">${escapeHtml(item.service)}</span><span class="cell-secondary">${escapeHtml(item.clinician)}</span></td>
  <td>${escapeHtml(item.time)}</td>
  <td>${statusBadge(item.status, item.type)}</td>
  <td>${escapeHtml(item.updated)}</td>
  <td><button class="table-action" data-open-detail="${escapeHtml(item.id)}">View details</button></td>
</tr>`;
const appointmentsTable = (items) => `<div class="table-wrap"><table class="data-table">
  <thead><tr><th scope="col">Patient / request</th><th scope="col">Service / team</th><th scope="col">Session</th><th scope="col">Status</th><th scope="col">Last update</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
  <tbody>${items.map(appointmentRow).join("")}</tbody>
</table><div class="empty-state no-results"><strong>No matching appointments</strong><span>Try a different search or clear the status filter.</span></div></div>`;

function metricCard(label, value, note, iconName, attention = false) {
  return `<article class="metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon(iconName)}</span></div><div class="metric-value">${value}</div><div class="metric-foot${attention ? " attention" : ""}">${note}</div></article>`;
}

function pageHeading(eyebrow, title, subtitle, actions = "") {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}

function sectionPanel(title, body, action = "") {
  return `<section class="panel"><div class="panel-header"><div class="panel-heading"><h2>${title}</h2></div>${action}</div>${body}</section>`;
}

function appointmentList(items = appointments) {
  if (!items.length) return `<div class="empty-state"><strong>Nothing needs confirmation</strong><span>New requests will appear here when received.</span></div>`;
  return `<div class="request-list">${items.map((item) => `<article class="request-row" data-searchable="${escapeHtml(`${item.patient} ${item.service} ${item.id}`.toLowerCase())}">
    <div class="request-main"><div class="request-title">${escapeHtml(item.service)} <span class="request-id">${escapeHtml(item.id)}</span></div>
      <div class="request-meta">${escapeHtml(item.patient)} · ${escapeHtml(item.clinician)} · ${escapeHtml(item.time)}</div>
      <span class="request-time">Received ${escapeHtml(item.updated)}</span>
    </div>
    <div class="row-actions">${statusBadge(item.status, item.type)}<button class="button button-quiet" data-open-detail="${escapeHtml(item.id)}">Review</button></div>
  </article>`).join("")}</div>`;
}

function overviewPage() {
  const pending = appointments.filter((item) => item.type === "pending");
  return `${pageHeading(todayLabel, "Today at the clinic", "A clear view of requests, sessions and follow-ups that need attention.",
    `<button class="button button-secondary" data-action="availability-review">${icon("clock")}<span>Review availability</span></button><button class="button button-primary" data-action="new-request">${icon("plus")}<span>New request</span></button>`)}
    <div class="demo-notice"><span class="notice-icon" aria-hidden="true">i</span><div><strong>Demo workspace · sample records only.</strong> Changes made here are temporary and do not reach a clinic, patient, or external partner.</div></div>
    <div class="metric-grid">
      ${metricCard("Awaiting confirmation", pending.length, "Requests need a staff decision", "clock", true)}
      ${metricCard("Today's appointments", appointments.length, "Across 3 published sessions", "calendar")}
      ${metricCard("In queue", 2, "Check-in status is demo data", "queue")}
      ${metricCard("Follow-ups due", followupData.length, "Review tasks for clinic staff", "followup", true)}
    </div>
    <div class="overview-grid">
      <div class="left-stack">
        ${sectionPanel("Requests awaiting confirmation", `<div class="panel-kicker panel-header-inline">${pending.length} need review</div>${appointmentList(pending)}`, `<button class="text-link" data-view="appointments">All appointments <span aria-hidden="true">→</span></button>`)}
        ${sectionPanel("Today's sessions", `<div class="session-list">${sessionData.map((session) => `<div class="session-row"><span class="session-time">${session.time}</span><span class="session-marker" aria-hidden="true"></span><span class="session-copy"><strong>${session.service}</strong><small>${session.detail}</small></span><span class="session-count">${session.count}</span></div>`).join("")}</div>`, `<button class="text-link" data-view="schedules">View schedule</button>`)}
        ${sectionPanel("Upcoming appointments", `<div class="table-controls"><span class="table-count">Today · ${appointments.length} sample records</span><button class="text-link" data-view="appointments">Open appointments</button></div>${appointmentsTable(appointments)}`)}
      </div>
      <div class="right-stack">
        ${sectionPanel("Follow-ups to review", `<div class="followup-list">${followupData.map((item) => `<label class="followup-item"><input class="followup-check" type="checkbox" data-followup="${item.id}" aria-label="Mark ${item.title} complete"><span class="followup-copy"><strong>${item.title}</strong><small>${item.detail}<br>${item.due}</small></span></label>`).join("")}</div>`, `<button class="text-link" data-view="followups">Open list</button>`)}
        ${sectionPanel("Availability check", `<div class="availability-card"><div class="availability-heading"><span><strong>Services need review</strong><small>One report may be out of date.</small></span>${statusBadge("Stale", "stale")}</div><div class="availability-foot"><span>Last updated yesterday<br>By clinic staff</span><button data-action="availability-review">Review services</button></div></div>`)}
        ${sectionPanel("Queue snapshot", `<div class="queue-summary"><div class="queue-stat"><strong>02</strong><span>Waiting</span></div><div class="queue-stat"><strong>01</strong><span>In consultation</span></div></div><div class="availability-foot" style="margin:0 16px 14px"><span>Sample queue · no patient names shown</span><button data-view="queue">Open queue</button></div>`)}
      </div>
    </div>`;
}

function appointmentsPage() {
  return `${pageHeading("WORKSPACE · APPOINTMENTS", "Appointments", "Review requests and confirmed visits. A request stays unconfirmed until clinic staff acts.",
    `<button class="button button-secondary" data-action="export-demo">${icon("arrow")}<span>Export list</span></button><button class="button button-primary" data-action="new-request">${icon("plus")}<span>New request</span></button>`)}
    <div class="demo-notice"><span class="notice-icon" aria-hidden="true">i</span><div><strong>Demo records only.</strong> This page is not connected to a booking system. Status changes remain in this browser session.</div></div>
    <div class="panel">
      <div class="table-controls"><div class="filter-row"><select class="filter-select" id="status-filter" aria-label="Filter appointments by status"><option value="all">All statuses</option><option value="pending">Awaiting confirmation</option><option value="confirmed">Confirmed</option><option value="arrived">Checked in</option><option value="cancelled">Cancelled</option></select><select class="filter-select" aria-label="Filter appointments by date"><option>Today · ${todayLabel}</option><option>All dates</option></select></div><span class="table-count" id="appointment-count">${appointments.length} sample appointments</span></div>
      ${appointmentsTable(appointments)}
    </div>
    <p class="field-hint" style="margin:12px 2px">Reception list shows only the minimum patient identifier and service information needed for coordination.</p>`;
}

function queuePage() {
  const queue = [
    { token: "Q-018", patient: "Patient •••• 1093", service: "General medicine", arrival: "09:18", status: "Waiting", kind: "pending" },
    { token: "Q-019", patient: "Patient •••• 6380", service: "Nursing desk", arrival: "09:26", status: "Waiting", kind: "pending" },
    { token: "Q-017", patient: "Patient •••• 2841", service: "General medicine", arrival: "09:05", status: "In consultation", kind: "confirmed" }
  ];
  return `${pageHeading("WORKSPACE · QUEUE", "Queue", "A staff-facing view of check-ins and current session flow.",
    `<button class="button button-secondary" data-action="queue-checkin">${icon("plus")}<span>Record check-in</span></button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>Sample queue only.</strong> This demo does not issue real tokens or send queue updates to patients.</div></div>
    <div class="metric-grid">${metricCard("Waiting", "02", "Across current sessions", "queue")}${metricCard("In consultation", "01", "Sample status only", "clock")}${metricCard("Completed today", "03", "No clinical information shown", "check")}${metricCard("Next scheduled", "09:30", "General medicine", "calendar")}</div>
    <div class="panel"><div class="panel-header"><div class="panel-heading"><h2>Current queue</h2><span class="panel-kicker">Updated just now · demo</span></div><button class="text-link" data-action="refresh-demo">Refresh view</button></div>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Token</th><th>Patient identifier</th><th>Service</th><th>Checked in</th><th>Status</th><th>Next step</th></tr></thead><tbody>${queue.map((item) => `<tr data-searchable="${escapeHtml(`${item.token} ${item.patient} ${item.service}`.toLowerCase())}"><td><span class="cell-primary">${item.token}</span></td><td>${item.patient}</td><td>${item.service}</td><td>${item.arrival}</td><td>${statusBadge(item.status, item.kind)}</td><td><button class="table-action" data-action="queue-advance" data-token="${item.token}">${item.status === "Waiting" ? "Call next" : "Mark complete"}</button></td></tr>`).join("")}</tbody></table><div class="empty-state no-results"><strong>No matching queue entries</strong><span>Try another search.</span></div></div></div>`;
}

function schedulePage() {
  return `${pageHeading("WORKSPACE · DOCTORS & SCHEDULES", "Doctors & schedules", "Review published sessions and confirm exceptions before patients rely on them.",
    `<button class="button button-primary" data-action="schedule-request">${icon("plus")}<span>Add session</span></button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>Schedule preview.</strong> No clinician identities or calendar integrations are configured in this demo.</div></div>
    <div class="section-grid"><div class="panel"><div class="panel-header"><div class="panel-heading"><h2>Sessions</h2><span class="panel-kicker">Today and upcoming</span></div><button class="text-link" data-action="schedule-request">Manage sessions</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Service / session</th><th>Capacity</th><th>Publication</th><th></th></tr></thead><tbody>${scheduleData.map((item, index) => `<tr data-searchable="${escapeHtml(`${item.service} ${item.type} ${item.time}`.toLowerCase())}"><td>${item.time}</td><td><span class="cell-primary">${item.service}</span><span class="cell-secondary">${item.type}</span></td><td>${item.availability}</td><td>${statusBadge(item.status, item.kind)}</td><td><button class="table-action" data-action="schedule-request" data-index="${index}">Review</button></td></tr>`).join("")}</tbody></table></div></div>
      <aside class="panel side-note"><h3>Before changing a session</h3><p>Check existing bookings and tell affected patients before changing a published time or capacity.</p><p>Visiting sessions need location and date confirmation before they are visible to patients.</p><p class="updated-line">Booking-impact warnings are not connected in this demo.</p></aside></div>`;
}

function patientsPage() {
  return `${pageHeading("WORKSPACE · PATIENTS", "Patients", "Find a patient record by its masked identifier or related service.",
    `<button class="button button-secondary" data-action="patient-info">About access</button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>Fictional identifiers only.</strong> There are no medical records or personal patient details in this workspace.</div></div>
    <div class="panel"><div class="table-controls"><span class="table-count">5 sample records · limited reception view</span><button class="text-link" data-action="patient-info">Access guidance</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Patient identifier</th><th>Last activity</th><th>Service</th><th>Status</th><th></th></tr></thead><tbody>${patientsData.map((item) => `<tr data-searchable="${escapeHtml(`${item.id} ${item.patient} ${item.detail} ${item.status}`.toLowerCase())}"><td><span class="cell-primary">${item.patient}</span><span class="cell-secondary">${item.id}</span></td><td>${item.lastVisit}</td><td>${item.detail}</td><td>${statusBadge(item.status, item.kind)}</td><td><button class="table-action" data-action="patient-info">View summary</button></td></tr>`).join("")}</tbody></table><div class="empty-state no-results"><strong>No matching patient records</strong><span>Try searching by masked identifier or service.</span></div></div></div>`;
}

function servicesPage() {
  return `${pageHeading("WORKSPACE · SERVICES & AVAILABILITY", "Services & availability", "Make clear what this clinic offers and how recently each service was checked.",
    `<button class="button button-primary" data-action="availability-review">${icon("check")}<span>Confirm availability</span></button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>Reported status is not a guarantee of care.</strong> Freshness reflects when a staff member last updated the listing.</div></div>
    <div class="panel"><div class="panel-header"><div class="panel-heading"><h2>Service directory</h2><span class="panel-kicker">Main branch · demo</span></div><button class="text-link" data-action="service-add">Add service</button></div>
      <div class="availability-list">${availabilityData.map((item, index) => `<div class="availability-list-row" data-searchable="${escapeHtml(`${item.service} ${item.status}`.toLowerCase())}"><span><strong>${item.service}</strong><small>${item.updated} · ${item.owner}</small></span>${statusBadge(item.status, item.kind)}<button class="table-action" data-action="availability-edit" data-index="${index}">${item.kind === "stale" ? "Reconfirm" : "Edit"}</button></div>`).join("")}</div>
    </div>
    <div class="section-grid" style="margin-top:16px"><section class="panel side-note"><h3>Availability states</h3><p><strong>Current</strong> · recently confirmed by clinic staff.</p><p><strong>Stale</strong> · the last update is outside the clinic's review window.</p><p><strong>Unknown</strong> · no current report. Do not imply availability.</p><p><strong>Unavailable / Not offered</strong> · explicit service status, not a booking outcome.</p></section><aside class="panel side-note"><h3>Operational load</h3><p>Normal, busy and emergency load describe staff-reported workload only. They do not indicate clinical capability or acceptance of a patient.</p><p class="updated-line">No load status is being reported in this demo.</p></aside></div>`;
}

function diagnosticsPage() {
  return `${pageHeading("WORKSPACE · DIAGNOSTICS", "Diagnostics", "Track external diagnostic referrals without implying that this clinic operates a lab.",
    `<button class="button button-secondary" data-action="diagnostics-info">${icon("arrow")}<span>Referral guidance</span></button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>No in-house diagnostics are listed.</strong> These examples show external referral tracking only. Reports and partner systems are not connected.</div></div>
    <div class="metric-grid">${metricCard("Referrals today", "02", "Sample records only", "diagnostics")}${metricCard("Awaiting partner update", "01", "No automatic status sync", "clock", true)}${metricCard("Reports ready", "00", "No reports stored here", "check")}${metricCard("Recollection cases", "00", "No partner exceptions", "followup")}</div>
    <div class="panel"><div class="panel-header"><div class="panel-heading"><h2>Referral activity</h2><span class="panel-kicker">Today · demo</span></div><button class="text-link" data-action="diagnostics-info">How referrals work</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Patient identifier</th><th>Service</th><th>Status</th><th>Source</th></tr></thead><tbody>${diagnosticData.map((item) => `<tr data-searchable="${escapeHtml(`${item.patient} ${item.service} ${item.status}`.toLowerCase())}"><td>${item.time}</td><td>${item.patient}</td><td>${item.service}</td><td>${statusBadge(item.status, item.kind)}</td><td><span class="cell-secondary">${item.detail}</span></td></tr>`).join("")}</tbody></table><div class="empty-state no-results"><strong>No matching referrals</strong><span>Try another search term.</span></div></div></div>`;
}

function followupsPage() {
  return `${pageHeading("WORKSPACE · REFERRALS & FOLLOW-UPS", "Referrals & follow-ups", "Review coordination tasks and record the next administrative action.",
    `<button class="button button-primary" data-action="followup-add">${icon("plus")}<span>Add follow-up</span></button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>Coordination reminders only.</strong> No clinical advice or referral messages are sent from this demo.</div></div>
    <div class="panel"><div class="table-controls"><div class="filter-row"><select class="filter-select" aria-label="Filter follow-ups"><option>All open items</option><option>Due today</option><option>Overdue</option></select></div><span class="table-count">4 sample tasks</span></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Due</th><th>Patient identifier</th><th>Task</th><th>Status</th><th>Next step</th></tr></thead><tbody>${followupTableData.map((item, index) => `<tr data-searchable="${escapeHtml(`${item.patient} ${item.service} ${item.time}`.toLowerCase())}"><td>${item.time}</td><td>${item.patient}</td><td>${item.service}</td><td>${statusBadge(item.status, item.kind)}</td><td><button class="table-action" data-action="followup-complete" data-index="${index}">Mark reviewed</button></td></tr>`).join("")}</tbody></table></div></div>`;
}

function partnersPage() {
  const partners = [
    { name: "Diagnostic partner", detail: "External referrals · no connection configured", status: "Not connected", kind: "unknown" },
    { name: "Pharmacy partner", detail: "No participating seller configured", status: "Not enabled", kind: "not-offered" },
    { name: "Blood coordination", detail: "Institution verification required", status: "Not enabled", kind: "not-offered" },
    { name: "Ambulance assistance", detail: "Partner-supervised service only", status: "Not enabled", kind: "not-offered" }
  ];
  return `${pageHeading("MANAGE · PARTNERS", "Enabled partner modules", "See which partner workflows are configured for this clinic.",
    `<button class="button button-secondary" data-action="partner-info">Partner requirements</button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>No partner services are operational from this portal.</strong> Do not promise availability or use these entries to coordinate real care.</div></div>
    <div class="panel"><div class="panel-header"><div class="panel-heading"><h2>Partner status</h2><span class="panel-kicker">Main branch · demo configuration</span></div></div><div class="availability-list">${partners.map((item) => `<div class="availability-list-row" data-searchable="${escapeHtml(`${item.name} ${item.detail}`.toLowerCase())}"><span><strong>${item.name}</strong><small>${item.detail}</small></span>${statusBadge(item.status, item.kind)}<button class="table-action" data-action="partner-info">Learn more</button></div>`).join("")}</div></div>
    <div class="panel side-note" style="margin-top:16px"><h3>Keep the handoff explicit</h3><p>A referral submitted is not a test booking. A request received is not a confirmed appointment. Partner acknowledgement and the responsible organisation should be visible before a patient relies on an update.</p></div>`;
}

function settingsPage() {
  return `${pageHeading("MANAGE · STAFF & SETTINGS", "Staff & settings", "Review this workspace's branch context and demonstration access details.",
    `<button class="button button-secondary" data-action="settings-help">Access guidance</button>`)}
    <div class="demo-notice"><span class="notice-icon">i</span><div><strong>Settings are read-only in this demo.</strong> No staff account or clinic permissions are configured.</div></div>
    <div class="section-grid"><div class="panel"><div class="panel-header"><div class="panel-heading"><h2>Workspace details</h2></div></div><div class="availability-list">
      <div class="availability-list-row"><span><strong>Clinic</strong><small>Demonstration workspace · not a real provider</small></span><span class="status status-unknown">Demo</span></div>
      <div class="availability-list-row"><span><strong>Branch</strong><small>Main branch · sample context</small></span><span class="status status-unknown">Sample</span></div>
      <div class="availability-list-row"><span><strong>Signed-in role</strong><small>Clinic staff · reception view</small></span><span class="status status-unknown">Preview</span></div>
      <div class="availability-list-row"><span><strong>Data connection</strong><small>Local in-memory sample records</small></span><span class="status status-not-offered">No backend</span></div>
    </div></div><aside class="panel side-note"><h3>Privacy reminder</h3><p>Use minimum necessary information in reception workflows. Clinical notes, diagnostic reports and patient contact details are not part of this demo.</p><p class="updated-line">Session changes reset when the page is reloaded.</p></aside></div>`;
}

const views = {
  overview: { title: "Overview", render: overviewPage },
  appointments: { title: "Appointments", render: appointmentsPage },
  queue: { title: "Queue", render: queuePage },
  schedules: { title: "Doctors & schedules", render: schedulePage },
  patients: { title: "Patients", render: patientsPage },
  services: { title: "Services & availability", render: servicesPage },
  diagnostics: { title: "Diagnostics", render: diagnosticsPage },
  followups: { title: "Referrals & follow-ups", render: followupsPage },
  partners: { title: "Enabled partner modules", render: partnersPage },
  settings: { title: "Staff & settings", render: settingsPage }
};

function renderView(viewName) {
  currentView = views[viewName] ? viewName : "overview";
  document.querySelector("#main-content").innerHTML = views[currentView].render();
  document.querySelector("#current-section").textContent = views[currentView].title;
  document.querySelectorAll(".nav-item").forEach((item) => {
    const active = item.dataset.view === currentView;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  document.querySelector("#global-search").value = "";
  document.querySelector("#sidebar").classList.remove("is-open");
  document.querySelector("#sidebar-scrim").classList.remove("is-visible");
  document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
}

function toast(message, info = false) {
  const element = document.createElement("div");
  element.className = `toast${info ? " toast-info" : ""}`;
  element.setAttribute("role", "status");
  element.textContent = message;
  document.querySelector("#toast-region").append(element);
  window.setTimeout(() => element.remove(), 3600);
}

function closeOverlay() {
  document.querySelector("#overlay-root").replaceChildren();
  if (focusedBeforeOverlay && document.contains(focusedBeforeOverlay)) focusedBeforeOverlay.focus();
  focusedBeforeOverlay = null;
  openDrawerId = null;
}

function showDrawer(appointmentId) {
  const item = appointments.find((appointment) => appointment.id === appointmentId);
  if (!item) return;
  closeOverlay();
  focusedBeforeOverlay = document.activeElement;
  openDrawerId = appointmentId;
  const overlay = document.querySelector("#overlay-root");
  overlay.innerHTML = `<div class="drawer-backdrop" data-close-overlay></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <div class="drawer-head"><h2 id="drawer-title">Appointment request</h2><button class="icon-button" data-close-overlay aria-label="Close appointment details">${icon("close")}</button></div>
    <div class="drawer-body"><div class="detail-patient"><span class="patient-avatar">P</span><span><strong>${escapeHtml(item.patient)}</strong><small>Request ${escapeHtml(item.id)}</small></span></div>
      <dl class="detail-list"><div><dt>Service</dt><dd>${escapeHtml(item.service)}</dd></div><div><dt>Team</dt><dd>${escapeHtml(item.clinician)}</dd></div><div><dt>Requested session</dt><dd>${escapeHtml(item.time)} · Today</dd></div><div><dt>Booking status</dt><dd>${statusBadge(item.status, item.type)}</dd></div><div><dt>Last updated</dt><dd>${escapeHtml(item.updated)}</dd></div><div><dt>Branch</dt><dd>Main branch · Demo</dd></div></dl>
      <p class="detail-note">This is a fictional request in an interactive demo. Confirming or cancelling updates only this page's sample state; no patient is notified.</p>
    </div><div class="drawer-foot">${item.type === "pending" ? `<button class="button button-danger" data-appointment-action="cancel" data-id="${item.id}">Decline request</button><button class="button button-primary" data-appointment-action="confirm" data-id="${item.id}">Confirm request</button>` : `<button class="button button-secondary" data-close-overlay>Close</button>`}</div>
  </aside>`;
  overlay.querySelector(".drawer").focus?.();
  overlay.querySelector("[data-close-overlay]:not(.drawer-backdrop)")?.focus();
}

function showModal(title, description, body, submitLabel = "Save demo entry", onSubmit = null) {
  closeOverlay();
  focusedBeforeOverlay = document.activeElement;
  const overlay = document.querySelector("#overlay-root");
  overlay.innerHTML = `<div class="modal-backdrop" data-close-overlay><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
    <div class="modal-head"><div><h2 id="modal-title">${title}</h2><p id="modal-description">${description}</p></div><button class="icon-button" type="button" data-close-overlay aria-label="Close dialog">${icon("close")}</button></div>
    <form class="modal-body" id="modal-form">${body}<div class="modal-actions"><button class="button button-secondary" type="button" data-close-overlay>Cancel</button><button class="button button-primary" type="submit">${submitLabel}</button></div></form>
  </section></div>`;
  overlay.querySelector(".modal").addEventListener("click", (event) => event.stopPropagation());
  overlay.querySelector(".modal-backdrop").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeOverlay();
  });
  overlay.querySelector(".modal-body").addEventListener("submit", (event) => {
    event.preventDefault();
    if (onSubmit) onSubmit(new FormData(event.currentTarget));
  });
  overlay.querySelector("input, select, button")?.focus();
}

function createRequest() {
  showModal("Add a demo request", "Create a temporary sample entry to try the review flow. No real patient or clinic will be contacted.", `
    <div class="form-field"><label for="request-service">Service</label><select id="request-service" name="service" required><option value="">Choose a service</option><option>General consultation</option><option>Follow-up visit</option><option>Blood pressure review</option></select></div>
    <div class="form-field"><label for="request-id">Masked patient identifier</label><input id="request-id" name="patient" placeholder="Patient •••• 0000" pattern="Patient [•*]{4} [0-9]{4}" required maxlength="30"><span class="field-hint">Fictional format only: Patient •••• 2040.</span></div>
    <div class="form-field"><label for="request-time">Requested session</label><select id="request-time" name="time" required><option value="">Choose a time</option><option>09:30</option><option>10:00</option><option>10:30</option><option>11:15</option><option>14:00</option></select></div>`, "Add sample request", (formData) => {
      const patient = String(formData.get("patient") || "").trim();
      const service = String(formData.get("service") || "");
      const time = String(formData.get("time") || "");
      if (!/^Patient [•*]{4} \d{4}$/.test(patient) || !service || !time) {
        toast("Use the fictional identifier format shown and complete each field.", true);
        return;
      }
      const next = `MP-${2049 + appointments.length - 4}`;
      appointments.unshift({ id: next, patient, service, clinician: "Clinic team", time, status: "Awaiting confirmation", updated: "just now", type: "pending" });
      closeOverlay();
      renderView(currentView);
      toast("Sample request added. It is not sent to a clinic or patient.");
    });
}

function availabilityModal(initialIndex = 0) {
  const selected = Number.isInteger(initialIndex) && availabilityData[initialIndex] ? initialIndex : 0;
  const options = availabilityData.map((item, index) => `<option value="${index}"${index === selected ? " selected" : ""}>${escapeHtml(item.service)}</option>`).join("");
  showModal("Review reported availability", "Update the staff-reported service status. This only changes the local demo view.", `
    <div class="form-field"><label for="availability-service">Service</label><select id="availability-service" name="index">${options}</select></div>
    <div class="form-field"><label for="availability-status">Reported status</label><select id="availability-status" name="status"><option value="current">Current</option><option value="stale">Needs reconfirmation</option><option value="unknown">Unknown</option><option value="unavailable">Unavailable</option><option value="not-offered">Not offered</option></select></div>
    <p class="field-hint">Current means recently confirmed by clinic staff; it does not guarantee a service or appointment.</p>`, "Update demo status", (formData) => {
      const item = availabilityData[Number(formData.get("index"))];
      const kind = String(formData.get("status"));
      const labels = { current: "Current", stale: "Needs reconfirmation", unknown: "Unknown", unavailable: "Unavailable", "not-offered": "Not offered" };
      if (!item || !labels[kind]) return;
      item.status = labels[kind];
      item.kind = kind;
      item.updated = kind === "current" ? "Updated just now" : "Updated just now";
      item.owner = "Clinic staff";
      closeOverlay();
      renderView(currentView);
      toast("Reported availability updated in this demo only.");
    });
}

function actionModal(action) {
  const copy = {
    "availability-review": ["Review reported availability", "Confirming an item changes only its sample status. No public listing is updated.", "Reconfirming a service updates its sample timestamp for this session."],
    "availability-edit": ["Update service status", "Choose a truthful status for this fictional service listing.", "Service status updated in this demo only."],
    "schedule-request": ["Schedule changes are not connected", "A real schedule change must check existing bookings, location, leave and clinician availability.", "This demo does not save schedule changes."],
    "service-add": ["Service catalogue is read-only", "Adding a service requires branch configuration and an accountable staff update.", "No service was added."],
    "queue-checkin": ["Record a demo check-in", "Check-in and queue tokens are not connected to a booking system.", "A sample check-in can be explored in the Queue section."],
    "followup-add": ["Follow-up reminders are read-only", "This demo cannot create a patient reminder or referral message.", "No reminder was created."],
    "patient-info": ["Patient information access", "Reception views should show only the minimum information required to coordinate a visit. Clinical notes and reports are intentionally absent here.", "This page contains only fictional, masked identifiers."],
    "diagnostics-info": ["External diagnostic referral", "A referral is not a test booking. Partner confirmation, sample collection, report release and clinician review are separate states.", "No diagnostic partner is connected."],
    "partner-info": ["Partner configuration", "Partner workflows require a verified organisation, explicit operating agreement and clear responsibility for status updates.", "No partner service is enabled."],
    "settings-help": ["Workspace access", "A production workspace must enforce role-based access and audit sensitive actions on the server.", "Staff access settings are not configured in this demo."],
    "export-demo": ["Export is unavailable", "This demo does not export patient or operational records.", "No data was exported."],
    "refresh-demo": ["Sample view refreshed", "This view uses local sample data and has no live updates.", "No external system was contacted."],
    "notifications": ["Workspace updates", "These sample notices are not generated by a live clinic system.", "2 demo items: availability needs reconfirmation; 1 follow-up needs review."],
    "staff-profile": ["Staff profile", "This demo has no staff account or sign-in session.", "Role preview: clinic staff · reception."]
  }[action];
  if (!copy) return;
  showModal(copy[0], copy[1], `<p class="detail-note" style="margin:0">${copy[2]}</p>`, "Close", () => closeOverlay());
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const nav = target.closest("[data-view]");
  if (nav) {
    event.preventDefault();
    renderView(nav.dataset.view);
    return;
  }
  const detail = target.closest("[data-open-detail]");
  if (detail) {
    showDrawer(detail.dataset.openDetail);
    return;
  }
  if (target.closest("[data-close-overlay]")) {
    closeOverlay();
    return;
  }
  const appointmentAction = target.closest("[data-appointment-action]");
  if (appointmentAction) {
    const appointment = appointments.find((item) => item.id === appointmentAction.dataset.id);
    if (!appointment) return;
    const confirmed = appointmentAction.dataset.appointmentAction === "confirm";
    appointment.status = confirmed ? "Confirmed" : "Cancelled";
    appointment.type = confirmed ? "confirmed" : "cancelled";
    appointment.updated = "just now";
    closeOverlay();
    renderView(currentView);
    toast(`Sample request ${confirmed ? "confirmed" : "cancelled"} in this demo only.`);
    return;
  }
  const followup = target.closest("[data-followup]");
  if (followup) {
    if (followup.checked) {
      followup.closest(".followup-item")?.classList.add("is-complete");
      toast("Follow-up marked reviewed in this demo.");
    }
    return;
  }
  const actionElement = target.closest("[data-action]");
  if (actionElement) {
    const action = actionElement.dataset.action;
    if (action === "new-request") createRequest();
    else if (action === "availability-review") availabilityModal();
    else if (action === "availability-edit") availabilityModal(Number(actionElement.dataset.index));
    else if (action === "queue-advance") toast(`${actionElement.dataset.token} updated in the sample queue only.`);
    else if (action === "followup-complete") toast("Follow-up marked reviewed in this demo.");
    else actionModal(action);
  }
});

document.querySelector("#global-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll("#main-content [data-searchable]").forEach((row) => {
    const matches = !query || row.dataset.searchable.includes(query);
    row.hidden = !matches;
    if (matches) visible += 1;
  });
  document.querySelectorAll("#main-content .no-results").forEach((empty) => {
    empty.style.display = visible === 0 && query ? "block" : "none";
  });
  const count = document.querySelector("#appointment-count");
  if (count && currentView === "appointments") count.textContent = `${visible} matching sample appointments`;
});

document.querySelector("#main-content").addEventListener("change", (event) => {
  if (event.target.id === "status-filter") {
    const filter = event.target.value;
    let visible = 0;
    document.querySelectorAll("#main-content tbody tr[data-searchable]").forEach((row, index) => {
      const item = appointments.find((appointment) => appointment.id === row.querySelector("[data-open-detail]")?.dataset.openDetail) || appointments[index];
      const matches = filter === "all" || item?.type === filter;
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    document.querySelector("#appointment-count").textContent = `${visible} sample appointments`;
  }
});

document.querySelector("#menu-button").addEventListener("click", () => {
  const sidebar = document.querySelector("#sidebar");
  const open = !sidebar.classList.contains("is-open");
  sidebar.classList.toggle("is-open", open);
  document.querySelector("#sidebar-scrim").classList.toggle("is-visible", open);
  document.querySelector("#menu-button").setAttribute("aria-expanded", String(open));
});
document.querySelector("#sidebar-scrim").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.remove("is-open");
  document.querySelector("#sidebar-scrim").classList.remove("is-visible");
  document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    document.querySelector("#global-search").focus();
  }
  if (event.key === "Escape" && document.querySelector("#overlay-root").firstElementChild) closeOverlay();
});

renderView("overview");
