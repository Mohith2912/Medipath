<div align="center">
Medipath
One connected pathway from finding care to coordinating it.
A multi-hospital healthcare coordination prototype connecting patients, hospital teams, blood-donor volunteers, and ambulance partners through role-specific experiences.
Prototype · Healthcare coordination · Multi-hospital access · Human-supervised workflows
Problem · Solution · Experiences · Workflows · Roadmap
</div>
 
Medipath is a prototype, not an operational emergency service or a clinically validated medical product. The sections below describe the intended experience and development direction; they are not a claim that every integration or safeguard is already implemented.
Overview
Finding a hospital is only the beginning. Patients also need to understand which services are offered, whether a relevant doctor is available, how to request a consultation, and whether displayed information is still current.
Medipath explores a shared platform where participating hospitals manage their service information and patient requests, while patients discover and coordinate care through a single interface. The broader concept extends that connection to pharmacy access, institution-verified blood requests, and supervised ambulance coordination.
The central idea is simple: connect hospital operations with the patient journey instead of treating them as separate experiences.
The Problem
Healthcare access involves a chain of decisions and handoffs—not just a search result.
•	Patients need service-specific information, not only hospital names and locations.
•	Doctor registration, on-duty availability, and bookable consultation sessions are different things.
•	A bed count without a reporting time or confirmation source can be difficult to interpret.
•	Appointment requests need clear acceptance, cancellation, and queue updates.
•	Blood requests need institutional verification before volunteer mobilisation.
•	Emergency requests need accountable dispatch and receiving-facility coordination, not an assumption that the nearest vehicle or hospital is suitable.
Medipath investigates how a connected workflow can make these steps clearer, more traceable, and easier to coordinate.
Problem Statement
Design a multi-hospital coordination prototype that allows participating hospitals to publish accountable service information, helps patients request and track care, and demonstrates verified, human-supervised handoffs for future blood-donor and ambulance services.
The Solution
Medipath is designed around four primary experiences supported by administrative and dispatch functions.
Experience	Intended users	Purpose
Hospital workspace	Authorised hospital teams	Manage doctor schedules, consultation requests, queues, capacity information, and service updates.
Patient experience	Patients and authorised caregivers	Discover participating hospitals, review reported availability, request consultations, and track service status.
Blood-donor experience	Opted-in volunteers	Discover institution-verified requests, express willingness, and coordinate assessment appointments.
Ambulance-driver experience	Verified partner drivers and crews	Receive supervised assignments, navigate to pickup locations, and update trip milestones.

Administrative functions support organisation verification, permissions, complaints, and audit history. A dispatcher workspace is part of the proposed emergency operating model.
The Medipath Experience
Hospital Workspace
The proposed hospital interface brings routine coordination into one workspace:
•	Hospital registration and verification review.
•	Doctor profiles, specialties, duty schedules, and consultation-session capacity.
•	Appointment requests, confirmations, cancellations, and token queues.
•	Ward information and hospital-reported bed readiness or availability.
•	Service-load indicators with clear reporting ownership.
•	Pharmacy inventory and order-review workflows for authorised sellers.
•	Blood-request submission and institutional verification.
•	Role-specific access and operational change history.
Patient Experience
The patient journey is designed to support informed requests rather than unconditional availability promises:
•	Find participating nearby hospitals or choose a locality manually.
•	Filter by specialty and relevant services.
•	Review doctor sessions and timestamped hospital-reported information.
•	Request a consultation and track hospital confirmation.
•	Follow queue and appointment-status updates.
•	Explore pharmacy ordering and private service-history workflows.
•	Submit a blood-request draft for institutional review.
•	Access emergency-help options and, in a future partner-operated service, track dispatch status.
Blood-Donor Experience
The donor concept focuses on verified requests and voluntary participation:
•	Opt in to alerts and manage availability preferences.
•	Review the requesting institution, component requirement, location, and expiry.
•	Express willingness to be assessed.
•	Coordinate an appointment at an authorised collection location.
•	Keep contact information and assessment outcomes private.
A volunteer response is not a confirmation of donor eligibility, available blood stock, or transfusion compatibility.
Ambulance-Driver Experience
The ambulance concept is intended for verified operators with supervised dispatch:
•	Driver, crew, and vehicle verification.
•	Shift availability and location freshness.
•	Assignment offers and explicit acceptance.
•	Pickup address, landmark, and navigation support.
•	Arrival, transport, and receiving-hospital handoff updates.
An SOS submission does not mean an ambulance has accepted. Free-to-patient transport is a funding and partnership goal—not an established service commitment.
How It Works
Primary Prototype Journey
Hospital publishes a consultation session
                    |
Patient discovers the participating hospital
                    |
Patient submits a consultation request
                    |
Hospital confirms or proposes an alternative
                    |
Patient receives the confirmed booking status
                    |
Check-in and queue updates follow the visit

This connected hospital-to-patient loop is the recommended first implementation milestone.
Availability That Explains Itself
The proposed availability model distinguishes:
State	Meaning
Current report	Information is within the reporting policy agreed with the hospital.
Stale report	Information needs reconfirmation; affirmative availability should not be assumed.
Unknown	Current information has not been supplied.
Unavailable	The hospital explicitly reports no availability for that service.

Published capacity should include its source and confirmation time. A capacity listing is not an admission approval or a reserved bed.
Hospital Service Modes
Mode	Intended meaning
Normal	Routine service load as reported by the hospital.
Busy	Higher workload that may affect particular services or waiting times.
Emergency load	Exceptional demand or disruption, with affected services identified.

These modes describe operating load. Emergency-receiving capability, doctor duty, and staffed bed readiness must remain separate fields.
What Medipath Aims to Demonstrate
Medipath's proposed distinction is not simply the number of healthcare features it combines. It is the connection between information quality and an accountable next action.
1.	Freshness-aware discovery: show when information was confirmed and when it needs review.
2.	Shared request status: patient and hospital follow the same confirmation lifecycle.
3.	Service-specific clarity: distinguish a busy facility from an unavailable doctor or an unready bed.
4.	Verified mobilisation: review blood requests before broadcasting them to volunteers.
5.	Supervised emergency coordination: keep dispatch, assignment, and receiving handoff distinct.
6.	Inclusive access: design for manual location entry, readable status labels, low-bandwidth use, and English/Tamil content.
These are design objectives to implement and validate—not audited competitive advantages.
Conceptual Architecture
flowchart TB
    H[Hospital Workspace] --> C[Coordination Services]
    P[Patient Experience] --> C
    B[Blood-Donor Experience] --> C
    A[Ambulance-Driver Experience] --> C
    O[Admin and Dispatch] --> C
    C --> D[Shared Operational Records]
    C --> N[Notifications and Status Delivery]
    C --> I[Authorised Partner Integrations]

This diagram describes the intended system boundaries, not a verified technology stack. Critical actions should be authorised and validated on the server; notifications should communicate committed state rather than create it.
Prototype Scope and Boundaries
Area	Development position
Hospital discovery and consultation coordination	Core prototype focus.
Duty, queue, and availability freshness	Priority connected workflows.
Pharmacy fulfilment	Staged extension requiring authorised seller operations.
Blood-donor mobilisation	Staged, institution-verified workflow.
Ambulance dispatch	Supervised partner-service concept; not a public emergency commitment.
Full hospital ERP	Outside the initial scope.
Autonomous diagnosis or emergency triage	Outside the prototype's purpose.

No production deployment, partner participation, clinical outcome, security certification, or measured adoption is asserted here.
Development Roadmap
Phase 1 — Connect the Core Journey
•	Establish hospital-specific roles and service records.
•	Connect doctor sessions, patient discovery, and consultation requests.
•	Implement explicit confirmation, cancellation, and queue states.
Phase 2 — Build Trust in Operational Data
•	Add source timestamps and stale-information handling.
•	Test retries, concurrent booking attempts, and cross-hospital access restrictions.
•	Improve accessibility, manual-location recovery, and language support.
Phase 3 — Validate With Users
•	Review workflows with hospital staff and potential patients.
•	Observe task completion and update effort.
•	Document feedback, revisions, failures, and measured results.
Phase 4 — Extend Through Accountable Partners
•	Introduce pharmacy workflows with authorised sellers.
•	Pilot institution-verified donor coordination.
•	Explore ambulance coordination only with dispatch oversight, operational agreements, and identified funding.
These phases are development priorities, not completed milestones or promised delivery dates.
Evaluation Plan
Question	Evidence to collect
Can patients complete the booking journey?	Observed completion, errors, and assistance required.
Can staff keep information current?	Update effort, stale-record frequency, and staff feedback.
Does booking handle competing requests safely?	Reproducible concurrency and retry tests.
Are hospital records appropriately separated?	Negative access tests across records, files, and subscriptions.
Do both sides see consistent status?	End-to-end state and reconnect tests.

Results should identify the test conditions, sample size, limitations, and whether the evidence comes from simulation or real use. Performance and impact remain unmeasured until those evaluations are completed.
Responsible Use
Medipath is intended to support coordination—not replace professional judgement, emergency services, blood-centre assessment, or authorised pharmacy review.
Prototype demonstrations should use clearly labelled fictional records. Real patient data, live emergency alerts, production integrations, and public service commitments require appropriate consent, agreements, professional oversight, security review, and operational readiness.
 
<div align="center">
Medipath
A clearer pathway between the people seeking care and the teams coordinating it.
</div>
