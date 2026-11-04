# Product Requirements Document (PRD)
## AI-Powered Plant & Spare Part Intelligence Platform

**Project:** CALIBER 2026 — Spare Part Intelligence & Inventory Optimization  
**Version:** 2.0 — Role-Based Inventory Management & Plant Monitoring MVP  
**Document status:** Implementation proposal; provisional demo assumptions explicitly identified  
**Primary objective:** Connect a functioning spare-part ERP workflow with technician plant monitoring and adjustable cost–risk scenarios, so operational evidence produces reviewable inventory and procurement actions.  
**Primary product workspace:** Inventory Management  
**Second product workspace:** Plant Monitoring, for Technician  
**Deployment target:** Vercel  
**Required database artifact:** SQLite (`demo.sqlite`)  
**Language:** English  
**Revision date:** 4 November 2026, Asia/Jakarta

> **MVP promise:** Inventory staff manage one reliable spare-part record, identify stockout and excess exposure, and proceed from explainable recommendations to reviewed replenishment. Technicians monitor equipment, investigate changes in operating conditions, simulate maintenance and inventory consequences, and submit traceable spare-part requests to the same system.

**Revision scope:** This revision preserves the original nine main sections and Appendices A–B. It expands the problem, two-role access, dashboard specifications, normalized data model, simulation, workflow contracts, acceptance criteria, and implementation plan. It defines requirements; it does not claim that the application or models have already been built or validated.

---

## 1. Project Brief

### 1.1 Product summary

The platform combines **Inventory Management**, **Plant Monitoring**, **Spare Part Demand Intelligence**, and **Cost–Risk Optimization Scenarios** in one shared data model. Inventory Management is the core product: an ERP-style workspace for standardized material records, stock transactions, reservations, inventory health, and procurement. Plant Monitoring supplies the equipment and maintenance context that helps explain changing spare-part requirements.

Exactly **two operational roles** are exposed:

1. **Inventory:** maintains material and stock records, resolves data issues, reviews technician requests, reserves/issues stock, and reviews or processes replenishment recommendations.
2. **Technician:** monitors plant equipment, records inspections and maintenance, explores what-if scenarios, checks material coverage, and submits or tracks spare-part requests.

The two roles have different landing pages and navigation. They use the same material, equipment, request, and stock records. A technician request is immediately visible in the inventory queue within the shared demo workspace; it is not copied into a separate dataset.

The six provided CSV files seed the normalized database. The organizer describes their values as synthetic case data. Operating telemetry is not included in those files. The MVP therefore supports deterministic, clearly labeled simulated condition readings and a future-compatible monitoring interface. Scenario calculations are precise and reproducible for their inputs; physical failure timing remains an estimate whose strength depends on the available evidence.

### 1.2 Desired business outcomes

- Improve critical spare-part readiness and reduce avoidable shortage exposure and emergency procurement.
- Reduce excess purchasing and working capital tied up in stock while retaining justified strategic spares.
- Prevent repeated imports, duplicated joins, missing mandatory fields, and inconsistent identifiers from distorting inventory decisions.
- Translate observed equipment conditions, maintenance records, and scenario assumptions into material requirements that inventory staff can review.
- Expose the trade-off among purchase investment, holding cost, readiness, and expected shortage-related downtime.
- Make decisions traceable to source records, observations, model versions, user assumptions, approvals, and resulting transactions.

### 1.3 The 24-hour proof of value

The demo must answer two connected questions:

**Inventory:** “Which materials require action, why, how much should we replenish, and how do we process that action without duplicating stock or demand?”

**Technician:** “If this equipment continues under the selected operating conditions, or maintenance is delayed, what intervention may be needed, when should parts be ready, and does current inventory cover that requirement?”

The primary demo sequence is:

1. Open the Inventory dashboard and show a critical stockout exposure plus a separate excess/slow-moving example.
2. Switch to Technician and inspect an equipment condition trend and maintenance context.
3. Run an asset-specific what-if scenario, compare operating/maintenance alternatives, and inspect material readiness.
4. Confirm a candidate material requirement and submit a technician request linked to that scenario.
5. Switch to Inventory, review the request, reserve available quantity, and convert the shortage or validated policy recommendation into a draft PR.
6. Record a demo PO and receipt, observe updated availability, and issue the requested material.

Use a **90-day planning horizon** as an editable demo default, with shorter 7/30-day risk windows where supported. Do not make a universal “100% to 120% production” scenario the product premise. Any load increase must use an equipment-specific reference and valid configured envelope. Values are scenario inputs, not operating instructions or case facts.

### 1.4 Hackathon constraints from the case

- Deliver a working interactive MVP, not a static HTML mockup.
- Deploy to Vercel.
- Include SQLite, complete source code, and the database in the submission ZIP.
- Capture a timestamped screenshot of the latest deployed version.
- Prepare an English deck covering the required problem, solution, impact, roadmap/risks, and team/technology topics.
- Retain the synthetic nature of the supplied baseline data in the evidence labels.

**Source basis:** CALIBER Final Case Brief, pp. 2–9; Data Context & Relationship Diagram, pp. 1–2. See Appendix B.

**Provisional MVP decisions:** one shared warehouse scope; analytical reference date 30 September 2026; explicitly assumed stock snapshot date because BoM has no timestamp; two demo identities; same-browser role handoff; simulated telemetry; internal procurement demonstration. These defaults make the specification implementable and may be changed in configuration after business validation. Do not imply the user has confirmed undocumented warehouse semantics, criticality policy, or operating limits.

---

## 2. Clear Problem Statement

### 2.1 Core problem

Spare-part planning is disconnected from the operational events that create demand. Historical consumption and static Min–Max settings provide a partial picture, while equipment condition, maintenance work, material applicability, procurement timing, and inventory commitments are not consistently connected. Repeated and incomplete source records further reduce trust in the stock position and resulting recommendations.

The company needs a common operational record that answers both **“What should inventory do?”** and **“Is the plant prepared for the maintenance implied by current or projected conditions?”** Monitoring, prediction, and transactions must form one workflow.

### 2.2 Two opposing consequences

| Problem | Business consequence | What the MVP should reveal |
|---|---|---|
| Too little usable stock | Emergency procurement, delayed maintenance, and shortage-related downtime | Time-phased shortfall, required-by date, available/reserved quantities, lead-time exposure, and a reorder path |
| Too much stock | Tied-up capital, carrying cost, and potentially obsolete inventory | Excess versus a risk-adjusted target, pending inbound, future maintenance demand, and strategic-spare exceptions |

Both can coexist across materials. Slow movement is a separate observation: a rarely used critical spare may be economically justified.

### 2.3 Why existing planning falls short

1. Source files mix equipment–material assignments with repeated material-level inventory values.
2. Duplicate rows and repeated imports can inflate stock, demand, purchasing, or reported spend.
3. Intermittent issues provide sparse evidence; no recorded consumption does not prove no future need.
4. Notifications include maintenance requests and activities, not exclusively confirmed equipment failures.
5. Maintenance plans identify a location and task but do not directly specify parts and task quantities.
6. Operating-condition evidence is disconnected from procurement decisions and is absent from the supplied baseline telemetry.
7. Inventory staff cannot see a consistent path from a technician concern to an approved requirement, reservation, and replenishment.
8. Static thresholds do not expose cost–risk trade-offs or the consequences of late incoming supply.

### 2.4 Product hypothesis

Combining a normalized inventory record with equipment observations, confirmed maintenance requirements, and uncertainty-aware material forecasts will produce more useful and explainable readiness decisions than unchanged static thresholds alone. Role-specific workflows should reduce the gap between identifying an equipment concern and preparing the required parts.

This is a hypothesis to evaluate through backtesting, scenario replay, and a pilot. The prototype must show the calculations and transactions working, without claiming measured business savings or calibrated failure accuracy that have not been established.

---

## 3. Target Users

| Operational role | Primary need | Authorized actions | Landing workspace |
|---|---|---|---|
| **Inventory** | Maintain reliable stock and procurement decisions | Material maintenance, import review, stock receipt/issue/return/adjustment, request review, reservation, PR/PO demonstration, policy review | `/inventory` — Inventory Overview |
| **Technician** | Understand equipment condition and secure maintenance readiness | Read plant/material coverage, record observations and maintenance, run scenarios, confirm candidate requirements, submit/track requests | `/technician` — Plant Monitoring |

Operations, procurement, reliability, and finance are stakeholder perspectives represented in explanations and scenario metrics. They are not additional MVP login roles.

**Permission matrix:**

| Capability | Inventory | Technician |
|---|---|---|
| View stock, material applicability, and request status | Yes | Yes, read-only stock |
| View equipment and maintenance context | Yes, contextual read | Yes, full monitoring workspace |
| Edit material master, inventory policy, or source mappings | Yes | No |
| Record inspections and maintenance work | Read and reconcile linked material use | Yes |
| Run a what-if scenario | Read shared results; evaluate inventory alternatives | Create, compare, and share |
| Submit a maintenance spare-part request | Review; internal replenishment actions | Create and submit |
| Approve request, reserve, or issue material | Yes | No |
| Create draft PR/demo PO and record receipt | Yes | No |
| Change physical on-hand quantity directly | Only through authorized stock transaction | No |
| Correct a posted transaction | Reversal/correction with reason | No |

Use role checks in the domain command layer, not only hidden menu items. The hackathon uses demo identities; its browser-local role enforcement demonstrates workflow permissions and is not production authentication. Production authorization requires server-side identity and permission enforcement.

**Role handoff:** a persistent role indicator opens a controlled demo role switch. Preserve the database, selected scenario, request IDs, and timestamps across the switch. A change of role must not reset stock or duplicate submitted requests.

---

## 4. Solution Overview

### 4.1 Value proposition

**A reliable spare-part ERP informed by plant conditions and maintenance scenarios.** Inventory staff receive actionable readiness and replenishment decisions. Technicians see whether current or projected equipment needs can be supported by available materials, then submit evidence-linked requirements into the same workflow.

Demand forecasting is one analytical component. Monitoring, data quality, maintenance recording, scenario comparison, inventory policies, and transaction execution are equally necessary to demonstrate the complete solution.

### 4.2 Functional architecture

| Layer | Responsibility | Shared output |
|---|---|---|
| Source and quality | Import six CSVs, preserve raw records, normalize keys/units/dates, quarantine unresolved issues | Validated master data and history with lineage |
| Operational record | Maintain equipment, BoM, stock, maintenance logs, requests, reservations, and procurement | One current operational state |
| Monitoring and diagnosis support | Display condition readings, trends, engineering limits, observation freshness, and candidate mechanisms | Equipment attention queue and evidence |
| Demand intelligence | Combine material history with explicitly confirmed maintenance needs and conditional scenario requirements | Forecast distribution and due-dated requirements |
| Inventory and scenario engine | Evaluate time-phased supply, dynamic parameters, alternative actions, and costs | Readiness, shortage/excess exposure, and ranked alternatives |
| Role workspaces | Technician creates evidence-linked needs; Inventory reviews and fulfills them | Approved actions and auditable transactions |

**Data flow:** imported history and current operational records feed the baseline. A scenario creates an isolated projection. Only an explicit submit/review action promotes selected scenario requirements into the operational request workflow. Stock changes only through posted movements; completing a simulation does not change on-hand inventory.

### 4.3 Four demand drivers

| Driver | Source and capture | Operational meaning | Model use and evidence boundary |
|---|---|---|---|
| Historical consumption | Supplied Movement Material CSV; subsequent posted issues and returns | Recorded material use over time | Intermittent-demand baseline; historical issues may omit unmet demand |
| Equipment failures | Historical notifications after classification; technician-confirmed incident records; monitoring-supported investigation | A recorded failure is a confirmed event; abnormal readings indicate a possible problem | Model incident recurrence only from validated labels; condition-based exposure remains conditional until calibrated |
| Maintenance activities | Mitem/Mplan, notification history, and new technician maintenance logs | Planned work and completed activities, with confirmed material requirements/usage | Add due-dated task needs after mapping confirmation; do not equate installed quantity with replacement quantity |
| Operating conditions | Future historian/manual readings; deterministic simulated readings for MVP; user scenario assumptions | Equipment-specific observations and projected operating regime | Condition/trend analysis and what-if sensitivity; no learned causal load effect without training evidence |

Monitoring provides exact recorded values, timestamps, units, and status under configured thresholds. It does not by itself establish the exact future failure date or root cause. Distinguish **observed condition**, **confirmed event**, **estimated future exposure**, and **user assumption** in storage and presentation.

### 4.4 Baseline data and relationships

| Input supplied as CSV | Useful fields | Required interpretation |
|---|---|---|
| FuncLoc list | Functional Location, description, criticality | Unique location master; not every hierarchy node is a separately instrumented machine |
| BoM | Functional Loc., Material No, description, Installed Qty, Unit, Min.Qty, Max.Qty, Stock, MRP Type | One material assignment per location; repeated inventory values belong to the material stock scope |
| Movement Material | Posting Date, Movement Type, Material Number, description, Quantity, Base Unit, Order | Material issue rows; no source transaction-document ID supplied |
| Notif History | Notification, Order, Functional Location, type, priority, description, required dates, completion date, status | Notification key is unique; order-to-location mapping is not universally unique |
| Mitem & Mplan | Functional Location, Maintenance Plan, Maintenance Item, task text, Priority, Cycle Descriptions, Start of cycle | Unique maintenance item; cycle-based nominal schedule, not proof of actual last execution |
| PR PO | PR/PO and line IDs, material, PR quantity/UoM, dates, plant/group, supplier, amount, currency | Historical procurement context; actual receipt, PO quantity, PO creation date, and open status are not established |

**Verified source profile, before cleaning:**

| Dataset | Raw rows | Relevant finding |
|---|---:|---|
| BoM | 20,653 | 7,481 unique materials; 230 exact duplicate rows; repeated Stock/Min/Max/Unit/MRP values are consistent within each material |
| FuncLoc | 14,484 | Unique location keys; 33 blank criticality values require hierarchy-aware handling |
| Maintenance items | 10,153 | Unique Maintenance Item keys; 28 differently written cycle labels need normalization |
| Movement | 17,518 | 1,930 materials with issues; 863 repeated rows identical across supplied columns; identity is insufficient for unconditional deletion |
| Notifications | 5,795 | 553 missing order values; 1,305 empty completion dates correspond to In Progress records; 52 non-empty order IDs span different locations |
| PR/PO | 11,609 | 5,420 exact duplicate rows; 6,189 distinct rows; 1,250 materials have procurement history; five currencies |

All material and location references resolve to their provided masters. However, only **2,791 of 17,518 raw movement rows (15.9%)** have an order found in notification history. Matching an order does not guarantee unique equipment attribution. Material forecasting must retain valid movements that cannot be linked to a location.

**ETL/data-integrity rules:**

1. Preserve source file hash, import batch, source row number, original values, and transformation decisions. Source identifiers remain strings.
2. Use one deterministic import key per file/batch and stable row provenance. Re-importing the same file must not add the same history again.
3. Normalize separators in numeric fields, parse known date formats explicitly, normalize cycle strings, and preserve UoM. Do not infer unit conversions such as EA-to-SET without a conversion master.
4. Collapse confirmed exact BoM assignment duplicates and PR/PO duplicates with retained lineage. For a previously seen business key with changed values, stage a conflict; do not silently overwrite history.
5. Flag identical movement rows as **possible duplicates**. Preserve raw rows and use an explicit accepted-row policy for analytical views; source-row identity cannot prove whether two issues were separate transactions. Show sensitivity or use a reviewed curated subset if the ambiguity affects a demo item.
6. Store one material inventory snapshot per configured warehouse scope. Never sum repeated BoM stock across locations. Conflicting future snapshots require resolution.
7. Aggregate movements at material grain before joining to location assignments. Attribute an order to equipment only where mapping is unambiguous or explicitly reviewed; preserve unresolved evidence separately.
8. Treat absent order as unlinked, not invalid consumption. Treat absent completion on an open task as valid. Do not auto-populate hierarchy-node criticality with an invented value.
9. Convert maintenance cycle strings to numeric value plus unit. Calendar-month/year recurrence uses calendar arithmetic. A nominal due date is labeled estimated if execution history is unavailable.
10. Import PR quantity as PR quantity. Do not call it confirmed PO quantity, interpret a scheduled delivery as receipt, or infer an open order solely from a future date.
11. Prevent missing mandatory keys, invalid quantities, or broken foreign keys from entering active operational tables. Quarantine affected rows with a reason and correction path. Optional missing fields remain null.
12. Classify notification types/tasks using a documented mapping with an Unknown category. Do not assume N1/N2/N3 labels imply failure modes without a business definition.

**Stock cutoff:** supplied movements end on 30 September 2026, used as the provisional analytical date. BoM's stock timestamp is absent; attach `snapshot_date_assumed=true`. Do not subtract the full historical issue series from this stock again. Only post-snapshot demo transactions update its opening balance.

### 4.5 The four dynamic inventory parameters — MVP definitions

Separate **imported current policy**, **recommended policy**, and **approved active policy**. Imported BoM provides Min and Max; current Safety Stock and ROP are unavailable unless supplied separately or derived with an explicit label. Accepting a recommendation updates the active policy with an audit record; generating one does not.

| Parameter | MVP calculation under the selected policy | Required context |
|---|---|---|
| Safety Stock | `max(0, ROP - ceil(expected residual lead-time demand))` | Demand/supply uncertainty, service target, approved commitments handled consistently |
| Reorder Point | `max(policy_floor, ceil(Q_alpha(residual demand over lead time)))` | Alpha is a configured service target; lead time has source and confidence |
| Dynamic Min–Max | `Min = ROP`; `Max = max(Min, ceil(Q_alpha(residual demand over lead time + review period)))` | Review period, criticality/strategic floor, replenishment constraints |
| Reorder Quantity | When adjusted inventory position is at/below Min: `max(0, Max - adjusted_inventory_position)`, rounded to a valid UoM/pack increment | Net commitments, confirmed inbound, no duplicate pending PR/PO coverage |

**Inventory quantities:**

- `available_now = on_hand - active_reserved_qty`.
- Outstanding approved commitments include both reserved and approved-but-unreserved quantities, once each.
- `adjusted_inventory_position = on_hand + eligible_confirmed_inbound - outstanding_approved_commitments`.
- Demand distributions used against this adjusted position exclude those same explicit commitments. Time-phased readiness separately places commitments and inbound on their dates. Never subtract reservations and the full request quantity twice.
- Only confirmed demo/validated open orders contribute inbound. Historical PR/PO records without status/receipt evidence do not.

The aggregate reorder policy supports ongoing stock planning. **Time-phased shortage before arrival overrides a reassuring aggregate position:** show earliest uncovered need, required order-by date, and any gap that ordinary procurement cannot close. Expedite/inspect/reschedule alternatives remain explicit reviewed decisions.

Do not recommend a second order for a request already covered by a linked draft PR or PO. Unsubmitted recommendations may be recomputed. Draft PRs do not count as arriving supply, but are shown as existing actions and require amendment rather than duplicate creation.

Extremely sparse materials use an explicit fallback and optional approved strategic floor. A material with unknown demand or lead time has **insufficient evidence**, not a default zero-risk label. Do not divide by zero to produce artificial days-of-cover values.

### 4.6 Prediction and simulation logic

**Historical material model:** use validated material-level issues over a common daily/weekly calendar including zero-issue periods. Estimate occurrence frequency and positive issue size, with reproducible bootstrap/scenario draws. Compare a simple intermittent baseline and an appropriate alternative only if time and data permit. Keep train/test cutoffs in time order and never use future notifications, future completion, or future procurement information as baseline features.

**Maintenance demand:** use confirmed task–material–quantity mappings and required dates. BoM identifies applicability; installed quantity is an upper context, not a replacement instruction. Historical unambiguous order/material links propose candidates. Technician confirmation is required to promote an inferred candidate into a requirement.

**Avoid double counting:** forecast components are shown separately as residual historical demand, explicit approved maintenance requirements, and unapproved scenario-conditional requirements. For a material/event/date, use a stable origin reference. If historical demand has not been decomposed reliably, show scheduled requirements as a separate overlay or bounded scenario rather than adding an arbitrary increment to a forecast that already represents the same work. Only submitted/approved requirements enter operational commitments.

**Monitoring and failure exposure:** use available condition readings, trends, maintenance context, and validated incident labels. A threshold exceedance is a condition alert. A trend-based threshold-crossing interval is an estimated attention/intervention window, not automatically a failure probability or remaining useful life. If the model lacks calibration, return categorical evidence strength and conditional exposure; leave numerical failure probability unavailable.

**Asset-specific scenario inputs:**

| Equipment class | Observed condition examples | Adjustable scenario drivers | Potential intervention/material context |
|---|---|---|---|
| Pump / compressor / rotating machine | Vibration with correct measurement type, bearing temperature, lube condition/pressure, suction/discharge pressure | Load relative to a defined baseline, runtime, maintenance date/delay, assumed degradation progression | Inspect lubrication, alignment, seal, bearing, or cooler as supported by the selected mechanism |
| Heat exchanger | Differential pressure, inlet/outlet temperatures, flow, thermal duty/performance | Throughput within configured envelope, fouling progression assumption, cleaning date, cooling-side conditions | Cleaning/inspection may precede any replacement; gasket/tube needs require scope confirmation |
| Piping / valve | Thickness readings, leakage observations, pressure, temperature, validated corrosion trend | Duty regime, inspection date, assumed corrosion progression where justified | Inspection, repair, valve/gasket/pipe candidate requirements confirmed by technician |

Each parameter definition has metric name, engineering unit, measurement type, asset applicability, baseline, allowed scenario bounds, source, and direction of concern. Keep vibration displacement and velocity separate. No universal alarm/trip threshold or universal multiplier is applied across equipment classes.

Users may enter a hypothetical condition reading through an advanced control, labeled **Assumed condition**. Default controls alter plausible operational/maintenance assumptions. Result metrics are outputs, not independent arbitrary sliders. Related inputs must be internally coherent; bounds and engineering-limit sources remain visible in details.

**Simulation steps:** freeze source version and stock state; select asset/system scope and horizon; apply parameters and intervention alternatives; estimate condition/exposure progression; derive confirmed or candidate part needs; evaluate dated stock coverage and lead-time feasibility; calculate inventory policy and cost–risk alternatives; return results with uncertainty and provenance. Use the same opening inventory and random seed for fair comparisons.

**Required outputs:** affected asset/component candidate, supporting signals, intervention type/window if estimable, material applicability and quantity confidence, required-by date, on-hand/reserved/available/inbound quantities, uncovered quantity/date, revised SS/ROP/Min/Max/reorder quantity, estimated cost–risk, and a request draft action. When component identity or timing is unsupported, say which evidence or inspection is needed rather than inventing a prediction.

### 4.7 Cost–risk logic

Compare at least **Current plan**, **Changed conditions with no additional action**, and **Changed conditions plus a selected mitigation**. Add a second mitigation such as earlier inspection/cleaning when supported. Each alternative uses the same horizon, currency basis, and opening stock.

`estimated_total_cost = holding_cost + procurement_cost + intervention_cost + expected_shortage_related_downtime_cost`

- Holding cost uses projected average on-hand inventory value over time multiplied by the annual carrying rate and horizon fraction. Show the excess-only portion separately; total holding cost is not restricted to excess.
- Procurement cost uses incremental order quantity, validated/estimated unit price, and declared order/expedite charges. A PR/PO amount is a line amount. An amount/PR-quantity price is only an explicitly accepted proxy where quantity linkage is justified.
- Intervention cost includes configured inspection, cleaning, repair, or planned downtime assumptions; replenishment cannot be credited with preventing the physical failure itself.
- Shortage-related downtime must depend on both the equipment need and lack of usable parts when required. For calibrated scenarios, estimate it jointly over simulated event/arrival paths; do not multiply unrelated marginal probabilities and present the result as validated.
- When calibrated probabilities are unavailable, show a clearly named **conditional cost exposure** or sensitivity range instead of unsupported expected monetary risk. Do not rank an unknown-cost alternative as zero-cost.
- Count shared-asset/system downtime once; several missing materials for the same event do not create several independent full production-loss charges.
- Record all prices, quantities, currencies, FX assumptions, and cost dates. If a defensible conversion is absent, show separate currency subtotals or exclude the unavailable consolidated value with a reason.

Rank feasible alternatives within configured service/strategic-spare constraints. Show purchase cash requirement, inventory value, availability, and downtime exposure separately. A lower purchase total is not automatically the preferred option. Recommend **Review** where evidence cannot support a unique choice. All monetary savings remain scenario comparisons until validated against actual outcomes.

### 4.8 Screen map and primary workflow

**Navigation is role-specific.** Each dashboard has a distinct first screen and action queue. Shared detail drawers display the same underlying records.

| Role | Menu / route | Purpose |
|---|---|---|
| Inventory | Overview — `/inventory` | Inventory risk and action queue |
| Inventory | Materials & Stock — `/inventory/materials` | Material master, position, policy, and equipment applicability |
| Inventory | Stock Transactions — `/inventory/transactions` | Receipt, issue, return, adjustment, and movement ledger |
| Inventory | Procurement — `/inventory/procurement` | Technician request inbox, draft PRs, demo POs, and receipt tracking |
| Inventory | Data Management — `/inventory/data` | Import preview, quality exceptions, mappings, and lineage |
| Technician | Plant Monitoring — `/technician` | Plant overview, asset detail, observations, and maintenance context |
| Technician | What-if Simulation — `/technician/scenarios` | Adjustable asset/system scenarios and cost–risk comparison |
| Technician | My Requests — `/technician/requests` | Draft/submitted requests, status, shortages, and fulfillment |

Supplier details stay inside Procurement. Maintenance plans/logs stay inside Plant Monitoring. Forecast and inventory policy stay inside material detail. Do not create separate top-level modules for every table or AI output.

#### 4.8.1 Shared dashboard conventions

- Header: workspace/role, analytical date, latest import, stock/observation freshness, and compact evidence-mode indicator.
- Filters: relevant equipment/material/criticality, risk window, and stock scope. Scenarios additionally display baseline version and horizon.
- Every KPI opens the exact filtered records behind its numerator. Define denominators and evaluate counts at unique material or asset grain.
- Separate latest observed values from forecasts and scenario projections. Missing/stale observations produce Unknown/Stale, not Normal.
- Use distinct business labels: Attention, Critical, Stockout risk, Excess, Slow-moving, Strategic spare, Insufficient evidence. Do not overload a generic “AI score.”
- Retain filter state and origin links during drilldown and role handoff. Provide loading, empty, invalid-input, stale-result, and insufficient-data states.
- Keep implementation details in diagnostics; user-facing explanations emphasize evidence, timing, quantity, and next action.

#### 4.8.2 Inventory Overview — primary product dashboard

**Top area:** analytical date and stock scope, material search, risk horizon, criticality filter, and latest-data status.

**KPI cards:**

| Card | Definition | Click-through |
|---|---|---|
| Stockout exposure | Unique evaluated materials with projected uncovered demand within the chosen risk window | Ranked Stockout risk table |
| Replenishment actions | Unique actionable recommendations not already covered by a linked open action | Reorder queue |
| Excess stock | Materials/quantity/value above risk-adjusted target; show valuation coverage | Excess table |
| Slow/non-moving | Materials meeting documented movement criteria; strategic-spare flag remains separate | Movement health table |
| Technician requests awaiting review | Submitted, not yet decided requests; separate overdue count | Procurement request inbox |
| Data exceptions | Active blocking/warning items affecting current decisions | Data Management filtered queue |

Value KPIs are hidden or marked partial when prices/FX are unavailable. Do not sum quantities with different UoMs into one stock total. Show evaluated/total material coverage so sparse-history items are not silently excluded.

**Main action table:** tabs for Stockout risk, Reorder recommendations, Excess, and Slow/non-moving; allow simultaneous badges on a material. Default sorting combines urgency/required-by date and validated criticality, with evidence quality visible. Criticality S/A/B/C meaning is configuration pending company validation, not alphabetic sorting.

Minimum stockout/reorder columns: material ID/description/UoM, critical equipment context, on-hand, reserved, available, confirmed inbound and ETA, required/projected demand with interval, earliest shortage, lead-time basis, recommended quantity, latest order-by, existing action status, reason, and **Review Reorder**.

Excess/slow-moving columns: material, stock, approved target, excess, latest issue/observation window, consumption frequency, upcoming confirmed maintenance need, strategic status, valuation basis, and **Review Stock**. Use “No recorded issue in available history” for materials never seen in movement; do not invent last-use dates.

**Secondary panels:** projected material balance chart, current/recommended parameter comparison for the selected material, request inbox preview, and import exceptions. Avoid allowing a decorative plant illustration to displace the inventory action queue.

**Reorder review drawer:** quantity, UoM, need-by/order-by dates, lead time, source forecast/scenario/request, existing PR/PO, cost assumptions, and comment. **Proceed Reorder Recommendation** creates or amends an internal draft PR after Inventory confirmation. It does not place an external order or increase stock.

#### 4.8.3 Materials & Stock / Material Decision Detail

Show the authoritative material record and its BoM applicability, active strategic-spare floor, current stock ledger, request reservations, confirmed inbound, procurement history, and source lineage. Material IDs are immutable; conflicts and UoM changes require reviewed mapping/correction.

Charts display historical issues through the cutoff, forecast interval after it, approved maintenance requirements on dates, and projected available balance. Separate historical and forecast regions. Tables compare imported policy, approved active policy, and scenario recommendation; unavailable imported ROP/SS display “Not supplied.”

Inventory may edit validated master fields and accept policy changes with a reason. Technician sees the same stock quantities as read-only from the coverage drawer.

#### 4.8.4 Stock Transactions

Provide receipt, issue, return, and adjustment forms. Required fields: material, stock scope, quantity/UoM, effective date, source/request/order reference where applicable, reason, and actor. A receipt from a new demo PO updates received and remaining quantities. An issue validates available/reserved entitlement, posts one ledger movement, and updates request fulfillment. A return references the original issue; an adjustment requires a reason.

Do not allow negative physical stock, over-issue, over-return, or over-receipt against the relevant source without an explicit correction workflow. Post related stock/request updates atomically. Posted records are immutable; corrections use linked reversals and replacement records. Maintenance completion references existing issues and cannot silently issue the same parts again.

#### 4.8.5 Procurement and technician request review

One screen contains Request Inbox, Draft PR, Demo PO, and Receiving views. Show request/scenario/equipment origins and required-by dates throughout. Supplier records are normalized and selected within this workflow.

Inventory can approve, partially approve, reject with reason, or return for clarification. Approval is line-level and records approved quantity. Reserve the available portion and create/amend a shortage PR for the remainder. Policy replenishment and shortage replenishment for the same need must be reconciled into one reviewed quantity, not added automatically.

Demo purchase stages are internal application records. Imported historical procurement remains distinguishable and does not become open supply without validation. Confirming a demo PO creates dated inbound; only recording receipt increases stock. Late delivery leaves pre-arrival shortfall visible.

#### 4.8.6 Data Management

Display source batches with file hash, import date, original/accepted/quarantined/possible-duplicate counts, and published dataset version. Preview standardized columns, required-field failures, ambiguous joins, UoM/date conflicts, and before/after values.

Inventory can accept a deterministic mapping, resolve a conflict using a cited source value, exclude a reviewed duplicate, or leave an issue unresolved. No “AI fill all missing values” action. Publish the validated batch atomically; a failed batch must not partially change stock. Importing historical movements does not replay them against the opening stock snapshot.

#### 4.8.7 Technician Plant Monitoring — role landing dashboard

Use RootSync as a **monitoring interaction reference**: priority decision queue, equipment landscape, condition progression, evidence, proposed action, and follow-up. Its asset IDs, incident losses, historical sensor readings, and thresholds are not CALIBER source facts and must not be transplanted into this database without separately identified source/mapping.

**Top KPIs:** monitored assets with recent observations; assets in Attention/Critical; Unknown/Stale assets; maintenance due within the selected window; assets with confirmed material gaps; and technician requests needing follow-up. Denominators distinguish 14,484 functional locations from the smaller number of instrumented or demo-monitored equipment records.

**Plant landscape:** clickable 2D schematic or equipment list grouped by validated system/location. Support criticality, condition, observation freshness, maintenance due, and part readiness filters. Preserve parent/system membership using validated mapping; do not infer a complete physical topology from naming patterns alone. 3D is optional.

**Priority equipment queue:** asset/location ID, description, criticality, dominant abnormal signal, latest value/unit, trend, last observation time, next planned maintenance, material readiness, evidence strength, and **Inspect / Run What-if**. Prioritization explanation separates consequence, condition evidence, maintenance timing, and stock readiness.

**Three independent status dimensions:**

| Dimension | Example statuses | Meaning |
|---|---|---|
| Equipment condition | Normal / Attention / Critical / Unknown | Recorded readings versus configured rules and trend evidence |
| Maintenance readiness | Ready / Partial / Short / Unconfirmed scope | Availability against a defined material requirement |
| Action progress | Observation / Review / Request submitted / Fulfilled / Verification | Human workflow state |

A healthy machine can have poor spare readiness. A concerning machine can have all parts available. Do not imply that receiving a bearing changes the machine condition to Normal.

**Near-live demonstration:** replay deterministic condition samples with event time and playback controls. Stop/restart must not overwrite historical samples or create maintenance events. Label the stream Simulated/Replayed. Actual integration is a later adapter.

#### 4.8.8 Equipment Monitoring Detail and maintenance log

Arrange content around the next technical decision:

1. Asset identity, system, criticality, observation date, evidence source, and data freshness.
2. Equipment illustration/2D anatomy with selectable component candidates; component location is illustrative unless mapped.
3. Synchronized condition charts with units, configured attention boundaries, observed/assumed/projected regions, and missing-data gaps.
4. Notification timeline, classified incident/maintenance history, planned tasks, cycle basis, and last confirmed execution where known.
5. Candidate mechanism and alternative explanations, supporting/conflicting evidence, confidence limitations, and recommended next inspection.
6. Potential intervention window, or “Insufficient trend evidence,” plus **Run What-if** and **Check Spare Parts**.
7. BoM applicability and confirmed/candidate task material requirements, with warehouse coverage and **Create Request**.
8. Maintenance/inspection log and post-intervention verification.

**New maintenance log fields:** log ID, asset, task/notification reference, started/completed times, activity category, observations, confirmed failure mode or Unknown, action taken, measured condition before/after, technician, linked request and stock issue IDs, and follow-up. A service/inspection activity can legitimately consume no material. New observations retain metric, value, unit, event timestamp, source, and author.

Completing maintenance creates a recorded activity and updates its schedule context. It does not prove recovery. A separate verification sample/check determines whether the relevant condition improved.

#### 4.8.9 What-if Simulation — controls, results, and cost–risk comparison

**Layout:** parameter controls on the left, baseline/scenario equipment and condition projection in the main area, and material readiness plus recommended actions below. Keep comparison controls visible when scrolling on desktop; stack coherently on smaller screens.

**Controls:** asset/system scope; 7/30/90-day or configured horizon; equipment-specific operating drivers; maintenance date/delay; degradation/fouling/corrosion assumptions only where defined; supplier lead-time or delay assumption; and optional service/cost assumptions in Advanced. Defaults inherit the selected asset and source snapshot.

**Validation:** ranges are equipment-specific and declared. Parameters outside the model's supported range show an extrapolation warning or cannot run. An invalid combination explains what to fix. Changing inputs marks old results Stale until recalculation; never mix new sliders with old recommendations.

**Results:**

- Affected equipment/component candidates with evidence and intervention timing basis.
- Observed versus projected condition trend and uncertainty/assumption range.
- Material requirements with confirmed/inferred status, quantity basis, need-by date, and warehouse coverage.
- Earliest uncovered need, expected shortfall, feasible delivery date, and order urgency.
- Current versus recommended Safety Stock, ROP, Min, Max, and reorder quantity.
- Comparison table: Current plan / Changed conditions / Selected mitigation, with intervention, purchase investment, average inventory/holding cost, shortage exposure, and readiness.
- A readable answer to “Would this scenario increase concern?”, “Are existing parts sufficient?”, and “What should be reviewed next?”

**Primary action:** **Create Spare-Part Request** pre-fills equipment, selected scenario revision, material lines, quantity, need-by date, rationale, and evidence. Technician reviews and confirms candidate requirements before submission. A non-material intervention such as cleaning may create a maintenance action without forcing a purchase request.

Scenario knobs must change computations and, where relevant, the result tables and recommendations. Some changes legitimately produce no shortage or no new order; do not force every slider change to increase risk.

#### 4.8.10 Request lifecycle and cross-role consistency

**Request states:** Draft → Submitted → Under Review → Approved / Partially Approved / Rejected / Needs Clarification. Fulfillment is tracked separately as Unreserved / Partially Reserved / Reserved / Partially Issued / Fulfilled. This avoids one ambiguous status hiding approval and physical fulfillment.

Technician may edit Draft or Needs Clarification records; a submitted revision requires a new review. Inventory records approval/rejection reasons and quantities. Availability checks are repeated on approval and issue because stock may have changed since simulation.

Reservations reduce available quantity, not physical stock. Issues reduce on-hand and release/consume the relevant reservation in one transaction. Rejected/cancelled remaining quantities release reservations and require review of linked PRs; never silently cancel an already confirmed PO. Partial receipts/issues preserve the outstanding balance.

Use a stable requirement origin `(scenario_revision, asset, task, material, need_by)` plus a submission idempotency key. Repeated clicks and revisiting a scenario open the existing request. Scenarios sharing one real requirement require explicit merge/amendment rather than automatic duplicate commitments.

Both requests for **available stock** and requests for **short stock** are valid. Warehouse reservation is necessary even when all requested material is currently available.

---

## 5. MVP Features and Scope

### 5.1 Must Have — demo-critical

| ID | Feature | Build scope (24 hours) | Definition of done |
|---|---|---|---|
| M1 | Data pipeline + SQLite | Import all six CSVs, normalize material/location grains, preserve lineage, publish reviewed analytical views | No stock inflation; stable imports; unresolved duplicate/order issues visible |
| M2 | Two role workspaces | Inventory and Technician identities, distinct landing/navigation, command permission checks | Role handoff preserves shared requests/stock; forbidden domain command rejected |
| M3 | Inventory dashboard and material records | Search, stockout/reorder/excess/slow-moving queues, material detail, import quality view | KPI drilldowns reconcile and recommendation can proceed to draft PR |
| M4 | Transactional inventory loop | Request review, reservation, issue, receipt, return/adjustment forms with reasons | Stock and request states update atomically in the demo SQLite session |
| M5 | Plant Monitoring | Portfolio queue/list or 2D schematic, at least two equipment examples, condition trends, evidence/freshness | Equipment detail, maintenance context, material readiness, and observation log work |
| M6 | Maintenance recording | Record inspection/work, confirmed/inferred scope, linked material issues, verification | Completion does not double-issue stock or automatically assert recovery |
| M7 | What-if simulator | Asset-specific parameters, horizon, maintenance/supply change, baseline and mitigation comparison | Inputs reproducibly affect relevant projections, coverage, and costs |
| M8 | Demand and inventory engine | Intermittent baseline/uncertainty, maintenance overlay, four dynamic parameters, time-phased readiness | Coherent calculations, critical-spare guardrail, missing-data fallback |
| M9 | Cost–risk alternatives | At least three alternatives; intervention, cash, holding, shortage exposure | Assumptions and unavailable values explicit; receiving stock does not erase equipment risk |
| M10 | Technician-to-Inventory handoff | Submit confirmed material need, review/partial reserve, shortage draft PR, demo PO/receipt/issue | One full cross-role loop works without developer tools |
| M11 | Deployment and submission | Vercel, browser-session state, SQLite export, source ZIP, timestamped screenshot, English deck | Public link runs full loop; reset restores a known state |

Import the full source coverage. Demonstrate deep condition monitoring on a small reviewed equipment subset; do not pretend every functional location has sensor data. Use at least three coherent material examples: shortage-critical, excess/noncritical, and slow-moving strategic spare. Curated scenario state remains separate from imported case facts.

### 5.2 Nice to Have — only after the golden path works

| Feature | Why defer it? |
|---|---|
| Detailed 3D plant and component geometry | 2D/list plus condition charts proves the workflow |
| Multiple simultaneous equipment scenarios and shared-system dependency model | Requires validated topology and correlated failure consequences |
| Advanced calibrated failure/RUL model | Needs condition-to-event histories and validation |
| Full model comparison/backtesting UI | Core backtest evidence can be exported/logged without a dashboard |
| Multiwarehouse transfer and supplier optimization | Current source stock scope and confirmed supplier performance are incomplete |
| PDF exports, email/push notifications, conversational assistant | Lower priority than the transaction and scenario loop |
| Production SSO and remote multi-user persistence | Separate deployment/security architecture beyond the local-session MVP |

Role-based workspaces, request review, basic data integrity, and stock transactions are mandatory. They must not remain in the optional login/ERP category from the earlier proposal.

### 5.3 Explicitly out of scope

- Direct control of plant equipment, protective systems, or SCADA setpoints.
- Claims of actual live telemetry or guaranteed failure timing from the supplied six CSVs.
- Autonomous maintenance or external supplier order placement.
- Full finance/accounting, sales, HR, supplier negotiation, and complete enterprise ERP integration.
- Production-certified monitoring, cross-user authorization, and concurrent shared-cloud database operation in the hackathon demo.
- Automatic part substitution based only on similar descriptions; compatibility needs explicit approval.

Internal request approvals and demo PR/PO/receipt workflows are in scope. They create application records, not real purchase commitments.

### 5.4 Demo success / acceptance criteria

- [ ] Both roles land on distinct, task-appropriate dashboards and see consistent shared records.
- [ ] A Technician command cannot post stock or approve procurement through the domain service.
- [ ] Full import preserves material-level stock; re-importing a file does not multiply transactions.
- [ ] Confirmed duplicates and unresolved possible movement duplicates are handled differently with lineage.
- [ ] Ambiguous order/location mapping cannot duplicate or falsely attribute material issues.
- [ ] Valid open tasks with no completion date are not reported as mandatory-field errors.
- [ ] Inventory shows evaluated/total coverage, and unknown evidence never becomes a green zero-risk item.
- [ ] At least two asset examples have appropriate, differently named condition parameters; data mode/time/unit are visible.
- [ ] A stale/missing observation remains Unknown/Stale, while part readiness is assessed separately.
- [ ] Scenario inputs recalculate projections and inventory coverage under a reproducible seed; unsupported failure timing stays unavailable.
- [ ] Maintenance can be recorded with no parts; linked issues are not posted twice.
- [ ] A confirmed requirement is counted once across forecast, request, reservation, and simulation origin.
- [ ] `SS >= 0`, `Min = ROP`, `Max >= Min`, quantities respect UoM, and policy floors remain enforced.
- [ ] A future PO arriving after the need date does not mark readiness as covered before arrival.
- [ ] Above-Min policy position creates no ordinary reorder merely to fill Max; dated shortage can still require explicit action.
- [ ] Slow-moving and excess are independent; a strategic spare is not automatically marked for disposal.
- [ ] Submitting the same request or proceeding the same reorder twice does not duplicate an operational action.
- [ ] A request can be partly reserved and partly procured; receipt and issue update its remaining quantity correctly.
- [ ] Request approval/reservation does not change physical on-hand; receipt/issue does.
- [ ] Cost comparisons use matching horizons/currencies and avoid shared-event downtime duplication.
- [ ] Role switch and page refresh preserve demo state; explicit reset restores seed; updated SQLite export works.
- [ ] Full workflow operates on the public Vercel link; SQLite, source ZIP, screenshot, and English deck are ready.

### 5.5 Demo narrative — 3 to 4 minutes

1. **35 seconds — Inventory problem:** show stockout, excess, and strategic slow-moving cases, then open a material recommendation.
2. **40 seconds — Technician monitoring:** switch role, inspect equipment trend and separate spare readiness.
3. **50 seconds — What-if:** change relevant runtime/maintenance/condition assumptions; show intervention window, parts, and cost–risk alternatives.
4. **35 seconds — Handoff:** confirm candidate scope and submit a request with its required-by date.
5. **55 seconds — Inventory action:** review request, reserve available stock, proceed shortage to draft PR/demo PO, and demonstrate receipt/issue.
6. **20 seconds — Decision value:** show updated readiness, parameter comparison, preserved equipment concern, and traceable action history.

**Total:** approximately 3 minutes 55 seconds. Prepare a seeded pending PO to accelerate the receipt step; label any shortened delivery time as demo time advancement. Do not imply that ordering instantly makes a part available.

---

## 6. API Endpoint Plan

**Approach:** one Next.js application with shared TypeScript domain services. Vercel hosts stateless read/calculation endpoints. The single-browser MVP uses a writable in-memory `sql.js` SQLite instance, serialized to IndexedDB after valid commands. Both roles operate against that same instance. No request relies on writing a serverless local file for durability.

Production uses an authenticated service and durable shared database adapter later. The browser-local demo boundary is disclosed once in the workspace guide; do not present it as remote multi-user persistence.

### 6.1 Must-have endpoints

| Method | Endpoint | Description | Primary response |
|---|---|---|---|
| GET | `/api/health` | Seed/schema/calculation availability | status, seedVersion, schemaVersion |
| GET | `/api/plant/overview` | Seed equipment/monitoring configuration | equipment, metricDefinitions, telemetryMode |
| GET | `/api/equipment/:functionalLocation` | Seed equipment context and usable historical links | equipment, notifications, maintenanceItems, materials, mappingQuality |
| GET | `/api/inventory/health` | Seed baseline evaluation; client recalculates after local transactions | coverage, riskRows, exceptions, baselineVersion |
| GET | `/api/materials/:materialNo` | Seed material/history/policy context | material, history, stockSnapshot, procurementContext |
| POST | `/api/scenarios/simulate` | Stateless simulation using validated inputs and current session context | versioned scenario, projected conditions, requirements, readiness, policy, costRisk, evidence |

GET endpoints expose seed/baseline information only. After local commands, active dashboards read/recalculate from the current SQLite repository; they must not overwrite changed stock with an older GET response. Simulation accepts a validated current stock/commitment context with version/hash, never an undocumented server write.

**Must-have workflow service commands (client SQLite adapter in MVP):**

| Command | Actor | Mutation/result |
|---|---|---|
| `recordObservation`, `recordMaintenance`, `recordVerification` | Technician | Append evidence/log; link issued material, never auto-issue |
| `submitRequest`, `reviseRequest` | Technician | Idempotent versioned request with evidence and lines |
| `reviewRequest`, `reserveStock`, `releaseReservation` | Inventory | Approval quantities/reason and reservation records |
| `proceedReorder`, `confirmDemoPO` | Inventory | Deduplicated draft PR/amendment and confirmed dated supply |
| `postReceipt`, `postIssue`, `postReturn`, `postAdjustment` | Inventory | Atomic ledger and source/request updates |
| `publishImport`, `resolveDataException`, `acceptPolicy` | Inventory | Reviewed batch, quality decision, or versioned active policy |

Each command has actor role, idempotency key, expected workspace/entity version, payload, and audit reason where required. Returns updated IDs/version and affected records. Reset invalidates scenario/request context. The same service interface can be transported over authenticated HTTP later without rewriting business rules.

### 6.2 Optional endpoints (if implementation stays on schedule)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/forecast` | Standalone forecast with history/quality context |
| POST | `/api/inventory/optimize` | Policy and dated supply/need evaluation |
| POST | `/api/scenarios/compare` | Multiple alternatives under identical baseline state |

Remote workflow mutation endpoints are not required unless a durable authenticated backend is separately implemented. Do not add fake stateless POST endpoints that acknowledge a request without storing it in the active workspace.

### 6.3 Key request contract

`POST /api/scenarios/simulate` — illustrative identifiers and values only:

```json
{
  "scenarioId": "DEMO-SCENARIO-001",
  "revision": 2,
  "asOfDate": "2026-09-30",
  "baselineVersion": "seed-v2",
  "workspaceVersion": 12,
  "stockContextHash": "DEMO-HASH",
  "scope": { "functionalLocation": "DEMO-FLOC-001", "equipmentClass": "pump" },
  "horizonDays": 30,
  "randomSeed": 42,
  "operatingAssumptions": {
    "runtimeHoursPerDay": 20,
    "maintenanceDelayDays": 7,
    "loadRelativeToReferencePct": 105
  },
  "conditionInputs": [
    { "metric": "bearing_temperature", "value": 85, "unit": "degC", "source": "simulated" }
  ],
  "planning": {
    "reviewPeriodDays": 30,
    "leadTimeMode": "historical_proxy",
    "serviceLevelPolicy": "configured_by_criticality"
  },
  "costAssumptions": {
    "currency": "IDR",
    "holdingRateAnnual": 0.18,
    "downtimeCostPerHour": 1000000,
    "source": "illustrative"
  },
  "inventoryContext": [
    {
      "materialId": "DEMO-MAT-001",
      "onHand": 2,
      "activeReservations": [],
      "approvedRequirements": [],
      "confirmedInbound": []
    }
  ]
}
```

Use equipment metric definitions for bounds; the example is not an engineering recommendation. The server resolves material/equipment references against the seed or explicitly namespaced demo records and rejects mismatched baseline versions. It validates session context but does not authenticate ownership of browser-provided inventory; outputs remain demo calculations.

**Minimum response shape:**

```json
{
  "scenarioId": "DEMO-SCENARIO-001",
  "revision": 2,
  "baselineVersion": "seed-v2",
  "workspaceVersion": 12,
  "dataQuality": { "telemetry": "simulated", "leadTime": "proxy", "costs": "illustrative" },
  "equipmentImpacts": [
    {
      "functionalLocation": "DEMO-FLOC-001",
      "conditionStatus": "attention",
      "failureProbability": null,
      "interventionWindow": { "earliestDay": null, "latestDay": null, "basis": "insufficient_trend" },
      "candidateMechanisms": [],
      "evidence": []
    }
  ],
  "materialImpacts": [
    {
      "materialId": "DEMO-MAT-001",
      "uom": "EA",
      "requirement": { "quantity": null, "needBy": null, "status": "needs_scope_confirmation" },
      "forecastDemand": { "expectedUnits": null, "lowerUnits": null, "upperUnits": null },
      "inventory": { "onHand": 2, "reserved": 0, "available": 2, "confirmedInbound": [] },
      "readiness": { "status": "unconfirmed_scope", "shortageQty": null, "earliestShortageDate": null },
      "recommended": { "safetyStock": null, "reorderPoint": null, "minStock": null, "maxStock": null, "reorderQuantity": null },
      "risk": { "stockout": "insufficient_evidence", "overstock": "not_evaluated", "slowMoving": false, "strategicSpare": false },
      "existingActionIds": [],
      "explanation": []
    }
  ],
  "alternatives": [],
  "assumptions": ["No measured operating-condition history supplied"],
  "warnings": [],
  "requestDraft": null
}
```

Nulls represent unavailable results, not zeros. A sufficient-data fixture returns populated computed fields. Every output carries metric units, model/version context, and source basis through its typed contract.

### 6.4 API implementation rules

- Validate role on each domain command and reject unauthorized mutations; UI hiding alone is insufficient.
- Validate numeric bounds, UoM, date order, supported asset class, source version, and scenario horizon.
- Require actor, entity version, and idempotency key on commands. Detect stale reviews and re-evaluate availability.
- Return assumptions/warnings and field-level input errors; distinguish unsupported, unavailable, invalid, and computed zero.
- Use one simulation orchestration function shared by API and client computation to prevent divergent dashboard numbers.
- Persist a command, its ledger/source/request effects, and audit entry atomically before reporting success. A failed IndexedDB save leaves an explicit unsaved/error state and no false success confirmation.
- Refetch/recompute only affected views after a valid command; mark dependent scenarios stale when stock or maintenance context changes.
- Never count a dry-run scenario as active demand or call an external procurement/plant-control service.

---

## 7. Suggested Project Structure

### 7.1 Recommended stack

- Frontend: Next.js, TypeScript, Tailwind CSS, lightweight charts, and a 2D plant/equipment view.
- Backend: stateless Next.js calculation/read handlers; shared domain services.
- Database: normalized SQLite seed generated using Python `sqlite3`; `sql.js` browser instance for the editable demo workspace.
- Session persistence: serialize SQLite to IndexedDB after validated commands; support updated `.sqlite` download and explicit reset.
- Data preparation: Python CSV/pandas utilities and SQLite; read supplied CSVs directly. Excel support is optional and must not block the provided inputs.
- Analytics: deterministic lightweight TypeScript calculations or versioned Python-prepared features; reproducible uncertainty draws.
- Deployment: Vercel; no always-on Python service or persistent serverless local-file write requirement.

**Persistence and role boundary:** Vercel-local SQLite is not a shared durable serverless database. The browser adapter provides a functioning same-browser inventory/technician workflow with persisted local state. Switching identities uses the same database. Reload restores the serialized state. Other browsers/devices are separate workspaces. Restrict MVP to one active writer tab or implement an explicit tab lock; do not allow last-write-wins corruption. The required ZIP contains the seed SQLite and schema; export can additionally capture the final demo state.

**Authentication boundary:** demo role identities and command checks are required now. Production login, server-side authorization, durable multi-user transactions, backups, and audit integrity are later rollout requirements. Label the application as a demo workspace and keep the implementation explanation in Help/README.

### 7.2 Folder structure

```text
caliber-plant-inventory/
├── app/
│   ├── page.tsx
│   ├── inventory/
│   │   ├── page.tsx
│   │   ├── materials/page.tsx
│   │   ├── materials/[materialId]/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── procurement/page.tsx
│   │   └── data/page.tsx
│   ├── technician/
│   │   ├── page.tsx
│   │   ├── equipment/[functionalLocation]/page.tsx
│   │   ├── scenarios/page.tsx
│   │   └── requests/page.tsx
│   └── api/
│       ├── health/route.ts
│       ├── plant/overview/route.ts
│       ├── equipment/[functionalLocation]/route.ts
│       ├── inventory/health/route.ts
│       ├── materials/[materialNo]/route.ts
│       └── scenarios/simulate/route.ts
├── components/
│   ├── shared/RoleWorkspace.tsx
│   ├── inventory/InventoryOverview.tsx
│   ├── inventory/MaterialDecisionDetail.tsx
│   ├── inventory/RequestReview.tsx
│   ├── inventory/TransactionForm.tsx
│   ├── plant/PlantMap.tsx
│   ├── plant/EquipmentDetail.tsx
│   ├── plant/MaintenanceLog.tsx
│   ├── scenario/ScenarioControls.tsx
│   ├── scenario/ReadinessTable.tsx
│   └── risk/CostRiskComparison.tsx
├── lib/
│   ├── domain/permissions.ts
│   ├── domain/commands.ts
│   ├── domain/requests.ts
│   ├── domain/stockLedger.ts
│   ├── data/sqlite.ts
│   ├── data/indexedDb.ts
│   ├── data/repositories.ts
│   ├── data/importValidation.ts
│   ├── monitoring/metricDefinitions.ts
│   ├── monitoring/conditionRules.ts
│   ├── forecast/intermittent.ts
│   ├── forecast/uncertainty.ts
│   ├── scenarios/simulate.ts
│   ├── scenarios/failureExposure.ts
│   ├── inventory/policy.ts
│   ├── inventory/timePhasedReadiness.ts
│   ├── inventory/risk.ts
│   ├── risk/cost.ts
│   └── types.ts
├── data/
│   ├── demo.sqlite
│   ├── schema.sql
│   ├── data-dictionary.md
│   ├── import-quality-report.json
│   └── sample-scenarios.json
├── scripts/
│   ├── ingest_caliber.py
│   ├── validate_data.py
│   └── seed_demo_cases.py
├── tests/
│   ├── dataIntegrity.test.ts
│   ├── policy.test.ts
│   ├── workflow.test.ts
│   ├── scenario.test.ts
│   └── costRisk.test.ts
├── public/assets/
├── README.md
├── package.json
└── next.config.ts
```

The root route restores/selects the demo identity and directs to the appropriate workspace. Avoid a universal plant-first landing page. Include the SQLite and WASM assets in the Vercel build and verify asset loading from the deployed URL.

### 7.3 Data model — minimum entities

The following are normalized implementation groups, not additional navigation modules. Every source-derived row retains lineage. Generated IDs use a separate namespace from source business IDs.

| Table / group | Standardized required fields and grain | Source / constraints |
|---|---|---|
| `materials` | `material_id` PK, `description`, `base_uom`, `mrp_type` | BoM authoritative; compare descriptions/UoM in other files and stage conflicts |
| `functional_locations` | `functional_location_id` PK, `description`, nullable `criticality`, optional validated `parent_id`, optional equipment class | FuncLoc; do not invent a hierarchy or instrumented status |
| `bom_material_assignments` | Composite PK `(functional_location_id, material_id)`, `installed_qty` | BoM assignment grain; inventory stock not stored per assignment |
| `inventory_snapshots`, `inventory_policies` | Snapshot: material, stock scope, snapshot time, assumed-date flag, opening qty. Policy: material/scope, imported/active min/max, approved strategic floor, version | One provisional warehouse; historical snapshot and approved policy remain distinct |
| `material_movements` | `movement_id` PK, material, stock scope, posting time, type, positive qty, UoM, nullable source order, source/issue/receipt/reversal reference | Imported history plus new operational ledger; historical rows do not reapply to opening stock |
| `notifications`, `maintenance_orders` | Notification PK, location, nullable order, type/priority/text, event/required/completion dates/status; order PK as a shared reference | Multiple notifications/locations can share order; ambiguous asset attribution flagged |
| `maintenance_plans`, `maintenance_items` | Plan ID; item PK, plan/location FKs, task, priority, cycle value/unit, start date, nominal due basis | Mitem/Mplan; duplicated description/criticality read from location master |
| `task_material_requirements` | Requirement ID, maintenance item/task, location, material, qty/UoM, mapping status, evidence, confirmed by/time | Added mapping; historical candidate versus technician-confirmed requirement |
| `suppliers` | Supplier code PK, name | PR/PO; code/name conflicts staged |
| `purchase_requisitions`, `pr_items` | Header PR ID/type/date/plant/group; line composite PR ID/item, material, requested qty/UoM, need-by, state | Imported historical state unknown; new demo state explicit |
| `purchase_orders`, `po_items`, `pr_po_links` | PO header supplier/currency/state; line PO ID/item, material, nullable ordered qty, item amount, planned delivery; PR/PO link keys | Imported PO quantity remains unknown; new demo PO requires confirmed quantity/price basis |
| `goods_receipts` | Receipt ID, PO item, qty/UoM, receipt time, linked movement, actor | New demo/validated receipt evidence only |
| `condition_observations`, `metric_definitions` | Observation ID, asset, metric, value/unit, event time, source/mode/quality; metric unit/type/bounds/limit source | Added; synthetic inputs distinguishable from measured records |
| `maintenance_logs`, `verification_records` | Log ID, asset/task/notification, times, category, observations, failure mode/status, action, actor; verification readings and outcome | Added technician workflow; issued parts referenced, not reposted |
| `scenarios`, `scenario_results` | ID/revision, asset/system scope, snapshot/workspace/model version, inputs, seed, horizon, output, evidence/assumptions, stale flag | Isolated calculations until explicitly promoted |
| `spare_part_requests`, `request_items` | Request ID/revision/technician, origin, asset, rationale, state; line material/qty/need-by/approved qty, review reason | Stable origin and idempotency; line-level partial review |
| `reservations`, `request_fulfillment_links` | Reservation ID, request item, material/scope, qty, active/released/consumed state; links to issues and procurement | Availability calculated from active reservations; commitment counted once |
| `demo_users`, `audit_events`, `command_keys` | Two role identities; action/actor/entity/version/time/reason; unique idempotency key and result | Shared role workflow and command integrity |
| `import_batches`, `source_rows`, `data_quality_issues` | File hash/version, raw row provenance, acceptance state, issue severity/field/reason/resolution | Re-import prevention and reversible quality decisions |

**Column discipline:** source-only details such as Created On, purchasing group, and original task description remain available in the source/detail layer when relevant; they need not clutter dashboard tables. Keep all original values in raw lineage. Derived forecasts, risk labels, and available quantities are computed/versioned results rather than manually editable competing copies.

**Database integrity:** foreign keys enabled; unique business keys; positive transaction quantities; policy `max >= min >= 0`; reservation/fulfillment balance checks; immutable posted ledger; atomic command transactions; schema version and indexed material/location/order/date keys. Unknown source order references remain in raw/history with explicit unresolved linkage instead of dropping consumption.

### 7.4 Unit/integration test priorities

1. Stock grain: joining a material to many locations leaves its stock and consumption unchanged.
2. Import idempotency/conflict: identical file re-import adds nothing; changed rows under an existing business key require review.
3. Duplicate ambiguity: movement candidates remain traceable and are not silently removed; ambiguous order mapping does not multiply demand.
4. Missing versus zero: open completion dates valid; unknown demand/cost/probability remains unavailable, not zero/Normal.
5. Policy edges: SS/ROP/Min/Max consistency, strategic floor, UoM rounding, zero-demand handling, trigger above/below Min.
6. Time-phased supply: late inbound cannot cover earlier need; partial receipts reduce only the remaining inbound.
7. Demand uniqueness: a scenario-promoted request and reserved quantity are not counted twice in demand or inventory position.
8. Workflow: partial approval/reservation/receipt/issue works; double-clicking submit/reorder/receipt is idempotent; over-issue rejected.
9. Permission: Technician cannot mutate stock/policy/procurement through a direct command invocation.
10. Transaction integrity: request, reservation, ledger, and audit updates commit together or roll back together.
11. Scenario semantics: same inputs/seed/version reproduce output; changed inputs invalidate old results; material receipt does not change condition status.
12. Maintenance integrity: no-part task valid; completion referencing an existing issue does not issue again; verification separate from completion.
13. Cost accounting: price basis/currency/horizon consistent; shared-event downtime counted once; unavailable cost not treated as a free option.
14. Session/deploy smoke: role switch, reload, single-writer lock, export, reset, and the public Vercel golden path.

Use focused deterministic fixtures for these material business risks. Do not spend the sprint on redundant component snapshot tests or artificial model-accuracy targets.

---

## 8. 24-Hour Execution Timeline

### 8.1 Roles (parallelize if the team has 3–4 people)

- **A — Data/AI:** CSV ETL, key/duplicate review, normalized SQLite, historical demand features, metric definitions, uncertainty, and source labels.
- **B — Domain/Optimization:** shared command service, role checks, stock/request/procurement consistency, time-phased readiness, policy and cost calculations.
- **C — Frontend/UX:** separate role dashboards, monitoring/equipment views, scenario controls, request/reorder forms, and state integration.
- **D — Product/Integration, if available:** curated cases, evidence/assumption review, acceptance walkthrough, English deck, deployment, and submission. With three people, split these tasks explicitly.

### 8.2 Clock plan

| Elapsed time | Workstream | Specific deliverable | Exit gate |
|---|---|---|---|
| 00:00–01:30 | Scope/contracts | Freeze two-role routes, core states, one warehouse assumption, two assets/three material stories | Shared entity/command/scenario contract agreed |
| 01:30–04:30 | Data/state | Six CSVs into SQLite; data-quality report; browser load/save/export; demo role identities | Material stock reconciles; reload and role switch preserve a test record |
| 04:30–07:30 | Role dashboards | Inventory action table, Technician queue/detail, material coverage, shared navigation | Both workspaces render real case data and labeled demo observations |
| 07:30–10:30 | Transaction loop | Request/review/reserve/issue and PR/PO/receipt commands, audit and idempotency | A shortage request can be partly reserved and fulfilled after receipt |
| 10:30–13:30 | Prediction/readiness | Intermittent demand, uncertainty, four parameters, due-dated coverage | Coherent recommendation and late-inbound example |
| 13:30–16:30 | Monitoring/scenarios | Asset-specific controls, condition projection, maintenance logs, scenario request promotion | A scenario changes readiness; request origin retained across roles |
| 16:30–18:30 | Cost–risk | Baseline/changed/mitigation comparison and explanation | Costs, unknowns, and equipment-versus-stock effects clear |
| 18:30–20:30 | Deploy/QA | Vercel assets, role/stock/duplicate tests, refresh/reset/export, desktop/mobile smoke | Public golden path succeeds |
| 20:30–22:30 | Submission | README, schema/data dictionary, SQLite/source ZIP, deployed timestamp screenshot, English deck | Mandatory deliverables present |
| 22:30–24:00 | Buffer/rehearsal | Fix blockers, freeze, run timed two-role demo | Repeatable 3–4 minute story |

Total: 24 hours. These are integration milestone windows; A/B/C work concurrently with fixtures/contracts where dependencies are unfinished.

**Submission deadline:** the supplied brief states Thursday, 5 November 2026 at 06:00 AM. The PDF does not explicitly establish the timezone in that line; confirm the organizer's timezone rather than silently converting it. For planning in the user's Asia/Jakarta context, use 06:00 WIB provisionally. This schedule is a full-sprint template, not a claim that 24 hours remain; compress work against actual remaining time and build the deck/ZIP in parallel.

### 8.3 Decision checkpoints and scope cuts

- Hour 4.5: retain full imported history; select a reviewed demo subset for equipment-linked inference if joins remain ambiguous. Keep uncertainty visible.
- Hour 7.5: if visual work is behind, use searchable equipment/material lists and charts. Preserve separate roles and shared state.
- Hour 10.5: the request/reservation/receipt loop is a release gate. Cut extra charting before cutting transactional consistency.
- Hour 13.5: if advanced fitting fails, use the documented intermittent baseline and explicitly assumed condition progression. Preserve genuine input-driven calculations.
- Hour 16.5: cut 3D, multi-asset scenarios, model comparison, and optional exports. Preserve monitoring evidence, time-phased coverage, four parameters, and request-to-reorder handoff.
- Hour 20.5: freeze features; resolve deployment, state persistence, blocking arithmetic/workflow issues, and packaging only.

### 8.4 Critical delivery risks

| Risk | Mitigation |
|---|---|
| Telemetry absent from source | Deterministic labeled synthetic observations; future adapter clearly separated |
| Monitoring mistaken for exact failure prediction | Distinguish observation, threshold alert, intervention estimate, and calibrated failure output |
| Universal production multiplier is physically misleading | Asset-specific operating/maintenance drivers, configured bounds, and mechanism context |
| Source duplicates or repeated BoM stock inflate outputs | Material-grain snapshot, provenance, key checks, and reviewed duplicate policy |
| Order joins misattribute maintenance consumption | Unique mapping gate; unresolved links retained outside equipment attribution |
| Maintenance plan lacks task material quantities | Candidate mapping plus technician confirmation; no installed-quantity replacement default |
| Source stock date/current inbound unknown | Assumed snapshot label; no historical replay against stock; only confirmed inbound counted |
| Role workflow requires writes but Vercel local files are not durable | Writable browser SQLite persisted in IndexedDB; same-workspace handoff; production backend later |
| Local role controls confused with production security | Demo identities disclosed; server-side authorization required before production |
| Partial approvals or repeated clicks duplicate demand/orders | Stable origins, version checks, idempotent commands, atomic balances |
| Sparse/biased issue history understates need | Coverage/uncertainty, criticality floor, confirmed maintenance overlay; no false zero-risk label |
| Cost exposure overstates benefit | Explicit price/FX/incident assumptions, joint shortage path, no claim that stock prevents failure |
| Scope exceeds remaining hackathon time | One strong end-to-end loop, compact equipment subset, 2D/list visuals, parallel packaging |

---

## 9. Post-Hackathon Roadmap

| Phase | Timeframe, indicative | Capability expansion | Evidence / exit criteria |
|---|---|---|---|
| Phase 1 — Data validation | Weeks 1–2 | Confirm stock scope/date, source transaction IDs, criticality taxonomy, notification meanings, task–material mappings, receipt/open-order semantics, and cost/FX basis | Reviewed dictionary, reconciled stock and reliable joins |
| Phase 2 — Forecast validation | Weeks 3–5 | Time-based backtests, intermittent/probabilistic alternatives, interval calibration, policy simulation and censored-demand review | Fit-for-purpose performance and service/cost comparison versus static baseline |
| Phase 3 — Operational integration | Weeks 6–9 | Historian/manual/CMMS feeds, validated equipment topology, condition units/limits, maintenance outcomes, ERP inventory/receipts | Reliable timestamps, quality/freshness checks, incident and component labels |
| Phase 4 — Prescriptive pilot | Weeks 10–13 | Calibrated condition-to-intervention models, justified failure/RUL estimates where possible, constrained cost–risk choices, planner approvals | Prospective evidence of useful warning/readiness and accepted decisions |
| Phase 5 — Controlled production rollout | Beyond pilot | Production authentication and server authorization, durable multi-user database, concurrency, immutable audit, backup/restore, ERP procurement integration and drift monitoring | Operational/security review, transaction reconciliation, rollback and support process |

Two role workspaces, command permissions, audit entries, and request approval exist in the MVP. Phase 5 hardens them for real organizational use; it does not introduce the role concept for the first time.

### Suggested business KPIs (pilot, not promised results)

- Critical-part availability, stockout incidence, and shortage duration against required-by dates.
- Emergency purchase frequency/premium and percentage of recommendations acted on before order-by date.
- Excess inventory value, total inventory investment, valuation coverage, and holding cost under the selected service target.
- Forecast error appropriate to intermittent series, interval coverage, and evaluated material coverage; avoid MAPE on zero-demand periods.
- Technician request review time, partial/full fulfillment time, overdue requirements, and reservation accuracy.
- Duplicate import prevention, unresolved source conflicts, missing required fields, and equipment/material mapping coverage.
- Condition-observation freshness, validated alert usefulness, intervention lead time, and post-maintenance verification outcomes.
- Actual downtime attributable to spare unavailability and measured cost–risk trade-offs, where identifiable.

Every metric specifies date window, denominator, source, and evidence mode. Do not quote a percentage improvement or monetary benefit as achieved without a validated comparison.

---

## Appendix A — Demo Data, Assumptions, and Model Transparency

### A.1 Separate three kinds of information in the UI

1. **Case historical data:** supplied synthetic CALIBER consumption, locations, notifications, maintenance items, BoM inventory/policy, and procurement.
2. **Operational/demo observations and projections:** simulated condition readings, user-recorded inspections/work, new demo stock/procurement transactions, and modeled future trajectories. Keep measured, simulated, and entered origins distinct.
3. **Business/model assumptions:** stock snapshot date/scope, criticality ranking, strategic floors, service targets, review intervals, engineering bounds, condition sensitivity, lead-time proxies, prices/FX, intervention cost, and downtime economics.

Use concise labels Case Data / Recorded in Demo / Simulated / Estimated / User Assumption. Badge placement should clarify what the user is seeing without repeating long caveats throughout the workflow. Evidence details retain source row, event time, version, and calculation basis.

### A.2 Definitions for the product team

- **Observed condition:** timestamped metric or inspection recorded with source/unit; it can be measured, manually entered, or simulated.
- **Confirmed failure:** reviewed event evidence indicating loss/degradation of required function; not every notification or threshold crossing.
- **Intervention window:** estimated period for inspection/service consideration under declared conditions; distinct from guaranteed failure time.
- **Demand forecast:** distribution of future material issues; historical issue records may not include unmet demand.
- **Scenario requirement:** conditional candidate need belonging to one scenario revision; not active commitment until promoted/reviewed.
- **Approved requirement:** due-dated accepted material need counted once in planning and fulfillment.
- **On-hand:** physical/book quantity from the opening snapshot plus posted subsequent movements.
- **Available:** on-hand minus active reservations; no future inbound included in available-now.
- **Adjusted inventory position:** on-hand plus eligible confirmed inbound minus outstanding approved commitments, each counted once.
- **Readiness:** coverage of a defined requirement by usable dated supply and eligible reservations; distinct from equipment condition.
- **Stockout risk:** estimated/categorical exposure to uncovered demand before usable replenishment; Unknown when evidence is insufficient.
- **Overstock:** stock/supply above an approved risk-adjusted target after maintenance/strategic needs are considered.
- **Slow-moving / non-moving:** low activity or no recorded issue within the declared observation window; independent of excess.
- **Strategic spare:** approved reserve justified by consequence, compatibility, or supply constraints despite low movement.
- **Safety Stock / ROP / Min–Max / Reorder Quantity:** linked policy outputs as defined in Section 4.5; recommendation and active policy are separate.
- **Conditional cost exposure:** economic consequence under an assumed event; not calibrated expected loss when probability is unknown.
- **Proceed Reorder:** create/amend an internal reviewed draft PR; no external purchase and no immediate stock increase.

### A.3 Product honesty checklist

- Show monitoring mode, event time, metric units, observation freshness, and source of engineering limits.
- Do not reuse RootSync asset IDs/readings/costs as supplied CALIBER facts.
- Identify learned historical forecasts separately from assumed scenario relationships and user-confirmed requirements.
- Return unavailable component/failure time/probability as unavailable; retain useful inspection/readiness advice.
- Keep case stock separate from curated demo overrides and preserve snapshot-date assumptions.
- Treat future delivery dates as planned until supply state and quantity are confirmed; receipt requires a recorded event.
- Show slow-moving and strategic-spare labels together when applicable.
- Keep scenario results isolated, versioned, and stale-aware; request promotion is explicit and idempotent.
- Separate equipment-condition improvement, maintenance completion, and spare readiness.
- Disclose same-browser demo persistence and role controls; do not imply concurrent secure enterprise operation.
- Show alternative cost bases, assumptions, uncertainty, and unavailable values; no fabricated model or business performance.

### A.4 Provisional scenario and policy defaults

| Default | MVP setting / treatment | Validation needed |
|---|---|---|
| Stock scope | One shared demo warehouse | Company plant/warehouse/bin semantics |
| Analytical date | 30 September 2026 | Whether snapshot and histories share that cutoff |
| Stock timestamp | Assumed reference date, visibly tagged | Actual inventory snapshot date |
| Horizon | 90 days; adjustable supported windows | Maintenance and procurement planning cadence |
| Criticality | Preserve S/A/B/C/Unknown without invented business meanings | Priority ranking, service target, strategic floor |
| Lead time | Valid PR-to-delivery date differences as a labeled fulfillment proxy; reviewed fallback | Actual order and goods-receipt dates, supplier variability |
| Telemetry | Deterministic synthetic samples for selected equipment | Real time series, limits, calibration and incident mapping |
| Failure timing | Conditional intervention/threshold window only when evidence permits | Labeled degradation-to-failure histories and prospective validation |
| Maintenance material mapping | BoM/history candidates; technician confirmation | Task BOM and actual replacement quantities |
| Cost | Configurable assumptions with currency and source | Unit costs, carrying rate, FX, intervention and downtime economics |
| Persistence and roles | Same-browser SQLite state and two demo identities | Durable shared backend and real identity/access policy |

These are implementation defaults, not claims of approved company policy.

---

## Appendix B — Source and Technical References

### CALIBER documents (provided)

1. **CALIBER 2026 — Final Case Brief:** business problems pp. 2–3; expected AI solution p. 4; demand/optimization questions pp. 5–6; baseline data p. 7; delivery requirements pp. 8–9.
2. **Data Context & Relationship Diagram:** relationships p. 1; grains and join keys p. 2; explicit synthetic-data designation and indirect maintenance-plan-to-BoM link.
3. **Six supplied CSV exports:** BoM; FuncLoc list; Mitem & Mplan; Movement Material; Notif History; PR PO. Counts in Section 4.4 are raw-file observations before cleaning, not a validated production data audit.
4. **Attached PRD v1.0:** structural baseline for this revision. New requirements replace its single plant-first landing, optional role control, universal production-load story, and read-only-only workflow scope.

### Monitoring interaction reference

- [RootSync landing](https://owfarisz.github.io/rootsync/)
- [RootSync portfolio](https://owfarisz.github.io/rootsync/dashboard/)
- [RootSync compressor detail](https://owfarisz.github.io/rootsync/assets/ko-3201/)

RootSync was reviewed for portfolio prioritization, equipment condition/evidence, trend replay, and action structure. It uses a separate historical source set. No reference-site asset readings, incident counts, or financial exposure become facts in this product's six-file baseline.

### Condition-monitoring references

- [Emerson — condition and process monitoring](https://www.emerson.com/is/content/emerson/en/corporate/services/consulting/documents/instrumentation-it-27s-not-just-for-process-control-anymore.pdf): equipment-specific measurement context, including rotating machinery, pumps, and heat exchangers.
- [Emerson — AMS Wireless Vibration Monitor](https://www.emerson.com/en/automation-systems/asset-performance-management/machinery-health-management/ams-wireless-vibration-monitor): vibration, temperature, speed, and diagnostic measurement context.

These sources inform metric selection, not universal thresholds or validated model coefficients.

### Deployment / implementation references

- [Vercel — Is SQLite supported in Vercel?](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel): a local SQLite file is not shared persistent storage for serverless instances.
- [sql.js repository](https://github.com/sql-js/sql.js/): SQLite in JavaScript/WebAssembly, loading and exporting database bytes. Browser persistence is an application responsibility.

**Final build principle:** prove both role-specific workspaces and one consistent loop from equipment evidence to material readiness, reviewed replenishment, and posted inventory transactions. Keep predictions, observations, assumptions, and completed actions distinguishable.
