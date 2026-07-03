import {
  TODAY,
  money,
  percent,
  dateLabel,
  vendorRisk,
  requestAnalysis,
  matchStatus,
  savingsSimulation,
  procurementSummary,
  reportText,
} from "./engine.mjs";

const KEY = "elite-vendor-procurement-command-v1";
const app = document.querySelector("#app");

const initialState = {
  budgets: [
    { id: "delivery", name: "Delivery operations", owner: "Amina Noor", limit: 48000, committed: 21800 },
    { id: "product", name: "Product & platform", owner: "Hira Khyzer", limit: 30000, committed: 14800 },
    { id: "client", name: "Client experience", owner: "Omar Rahman", limit: 18000, committed: 6000 },
  ],
  vendors: [
    { id: "nimbus", name: "Nimbus Cloud Services", category: "Infrastructure", owner: "Musa Khan", annualSpend: 18200, onTimeRate: 97, qualityScore: 91, security: "Verified", paymentTerms: 45, contractEnd: "2026-08-15", notes: "Primary managed cloud and observability vendor." },
    { id: "vector", name: "Vector Secure", category: "Security", owner: "Hira Khyzer", annualSpend: 12600, onTimeRate: 94, qualityScore: 95, security: "Verified", paymentTerms: 30, contractEnd: "2026-07-24", notes: "Endpoint controls and annual audit partner." },
    { id: "flowline", name: "Flowline Automation", category: "Automation", owner: "Amina Noor", annualSpend: 9400, onTimeRate: 82, qualityScore: 78, security: "Review", paymentTerms: 30, contractEnd: "2026-07-18", notes: "Integration and workflow connector supplier." },
    { id: "pixel", name: "Pixel Forge Studio", category: "Design", owner: "Omar Rahman", annualSpend: 6800, onTimeRate: 89, qualityScore: 87, security: "Verified", paymentTerms: 15, contractEnd: "2026-10-10", notes: "Specialist brand and visual production vendor." },
    { id: "dataharbor", name: "Data Harbor Labs", category: "Data", owner: "Hira Khyzer", annualSpend: 4200, onTimeRate: 73, qualityScore: 76, security: "Expired", paymentTerms: 15, contractEnd: "2026-06-28", notes: "Legacy data-processing supplier pending contract decision." },
  ],
  requests: [
    {
      id: "PR-112",
      title: "Managed cloud observability renewal",
      department: "Delivery operations",
      budgetId: "delivery",
      category: "Infrastructure",
      requester: "Amina Noor",
      requestedAmount: 9600,
      status: "Finance Review",
      selectedVendorId: "nimbus",
      created: "2026-07-01",
      description: "Renew monitoring, log retention, and alert-routing services for active client delivery environments.",
      approvals: { pm: true, finance: false, founder: false, security: false },
      quotes: [
        { vendorId: "nimbus", price: 9100, leadDays: 4, warrantyMonths: 12, note: "Existing platform continuity and premium support." },
        { vendorId: "flowline", price: 8400, leadDays: 9, warrantyMonths: 6, note: "Lower price with integration transition effort." },
        { vendorId: "dataharbor", price: 7900, leadDays: 12, warrantyMonths: 6, note: "Lowest commercial offer; expired vendor controls." },
      ],
    },
    {
      id: "PR-113",
      title: "Endpoint security assessment",
      department: "Product & platform",
      budgetId: "product",
      category: "Security",
      requester: "Hira Khyzer",
      requestedAmount: 11800,
      status: "PM Review",
      selectedVendorId: "vector",
      created: "2026-07-02",
      description: "Independent security assessment before the next enterprise client portal release.",
      approvals: { pm: false, finance: false, founder: false, security: false },
      quotes: [
        { vendorId: "vector", price: 11200, leadDays: 7, warrantyMonths: 12, note: "Full penetration test, report, and executive readout." },
        { vendorId: "nimbus", price: 12500, leadDays: 10, warrantyMonths: 12, note: "Cloud security specialist package." },
        { vendorId: "flowline", price: 9800, leadDays: 14, warrantyMonths: 3, note: "Lower-cost partner assessment scope." },
      ],
    },
    {
      id: "PR-111",
      title: "Client research repository subscription",
      department: "Client experience",
      budgetId: "client",
      category: "Research",
      requester: "Omar Rahman",
      requestedAmount: 3600,
      status: "Approved",
      selectedVendorId: "pixel",
      created: "2026-06-26",
      description: "Annual repository subscription for insight synthesis and brand research workflows.",
      approvals: { pm: true, finance: true, founder: false, security: false },
      quotes: [
        { vendorId: "pixel", price: 3400, leadDays: 2, warrantyMonths: 12, note: "Selected research and creative repository bundle." },
        { vendorId: "flowline", price: 3700, leadDays: 4, warrantyMonths: 12, note: "Alternative general operations repository." },
        { vendorId: "nimbus", price: 4100, leadDays: 3, warrantyMonths: 12, note: "Enterprise cloud knowledge repository." },
      ],
    },
  ],
  orders: [
    { id: "PO-408", requestId: "PR-110", vendorId: "nimbus", title: "Client portal delivery environment", poAmount: 8400, invoiceAmount: 8400, deliveryReceived: true, invoiceReceived: true, invoiceDue: "2026-07-12", created: "2026-06-18" },
    { id: "PO-409", requestId: "PR-109", vendorId: "flowline", title: "Workflow connector licenses", poAmount: 5100, invoiceAmount: 5480, deliveryReceived: true, invoiceReceived: true, invoiceDue: "2026-07-09", created: "2026-06-24" },
    { id: "PO-410", requestId: "PR-111", vendorId: "pixel", title: "Client research repository subscription", poAmount: 3400, invoiceAmount: 0, deliveryReceived: true, invoiceReceived: false, invoiceDue: "2026-07-16", created: "2026-06-28" },
  ],
  savingsRate: 8,
  savedReports: [],
};

let state = loadState();
let activeTab = "dashboard";
let selectedRequestId = state.requests[0]?.id || "";
let selectedVendorId = state.vendors[0]?.id || "";
let showNewRequest = false;
let toast = "";

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return clone(initialState);
    return {
      ...clone(initialState),
      ...saved,
      budgets: Array.isArray(saved.budgets) ? saved.budgets : clone(initialState.budgets),
      vendors: Array.isArray(saved.vendors) ? saved.vendors : clone(initialState.vendors),
      requests: Array.isArray(saved.requests) ? saved.requests : clone(initialState.requests),
      orders: Array.isArray(saved.orders) ? saved.orders : clone(initialState.orders),
      savedReports: Array.isArray(saved.savedReports) ? saved.savedReports : [],
    };
  } catch {
    return clone(initialState);
  }
}
function persist() { localStorage.setItem(KEY, JSON.stringify(state)); }
function updateState(updater) { state = updater(clone(state)); persist(); render(); }
function selectedRequest() { return state.requests.find((item) => item.id === selectedRequestId) || state.requests[0]; }
function selectedVendor() { return state.vendors.find((item) => item.id === selectedVendorId) || state.vendors[0]; }
function esc(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function tone(value) { return value === "Low" || value === "Matched" || value === "Approve" || value === "Approved" || value === "Stable" ? "success" : value === "Medium" || value === "Watch" || value === "Escalate" || value === "Finance Review" ? "warning" : value === "High" || value === "Re-scope" || value === "Invoice hold" ? "danger" : "neutral"; }
function statusTone(value) { return value === "Approved" || value === "Ordered" || value === "Closed" ? "success" : value === "Rejected" ? "danger" : value.includes("Review") ? "warning" : "neutral"; }
function notify(message) { toast = message; render(); window.clearTimeout(notify.timer); notify.timer = window.setTimeout(() => { toast = ""; render(); }, 2600); }
function download(name, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }

function badge(label, className = "neutral") { return `<span class="badge ${className}">${esc(label)}</span>`; }
function progress(value, variant = "gold") { return `<div class="progress"><i class="${variant}" style="width:${Math.max(0, Math.min(100, value))}%"></i></div>`; }
function navButton(id, label, icon) { return `<button class="nav-button ${activeTab === id ? "active" : ""}" data-action="nav" data-tab="${id}"><i>${icon}</i>${label}</button>`; }
function metric(label, value, detail, variant, icon) { return `<article class="metric ${variant}"><div><small>${esc(label)}</small><i>${icon}</i></div><b>${value}</b><span>${esc(detail)}</span></article>`; }
function panel(eyebrow, title, body, text = "") { return `<section class="panel"><header class="panel-head"><p>${esc(eyebrow)}</p><h2>${esc(title)}</h2>${text ? `<span>${esc(text)}</span>` : ""}</header>${body}</section>`; }

function renderDashboard(summary) {
  const urgent = summary.actionPlan[0];
  const spend = savingsSimulation(state.vendors, state.savingsRate);
  const request = selectedRequest();
  const analysis = requestAnalysis(request, state.vendors, state.budgets);
  return `
    <section class="page-heading">
      <div><p>Elite Era Development L.L.C</p><h1>Procurement command center</h1><span>Control vendor risk, budget exposure, commercial approvals, purchase order matching, and cost savings before spend becomes locked in.</span></div>
      <button class="button" data-action="go-requests">Open purchase requests</button>
    </section>
    <section class="hero ${tone(analysis.decision)}">
      <div><p>Decision requiring attention</p><h2>${esc(request.title)}</h2><span>${esc(analysis.reason)}</span><div class="hero-actions"><button class="button" data-action="go-requests">Open request →</button><button class="button outline" data-action="choose-recommended">Apply recommended quote</button></div></div>
      <div class="orb"><div><b>${analysis.risk.score}</b><small>vendor risk</small>${badge(analysis.decision, tone(analysis.decision))}</div></div>
    </section>
    <section class="metrics">
      ${metric("Budget remaining", money(summary.budgetRemaining), "Across active procurement budgets", "gold", "◌")}
      ${metric("Pending approvals", summary.pendingApprovals.length, "Requests waiting for a decision", summary.pendingApprovals.length ? "warning" : "success", "✓")}
      ${metric("High-risk vendors", summary.highRiskVendors.length, "Supplier controls need attention", summary.highRiskVendors.length ? "danger" : "success", "!")}
      ${metric("Quote savings", money(summary.potentialSavings), "Spread across active request comparisons", "ink", "↗")}
    </section>
    <section class="two-col">
      ${panel("Finance action plan", "Protect the next procurement decision", `<div class="action-list">${summary.actionPlan.map((item, index) => `<article><i>${index + 1}</i><div><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></div></article>`).join("")}</div>`)}
      ${panel("Savings simulator", "Potential annual cost reduction", `<div class="savings-card"><strong>${money(spend.savings)}</strong><span>Estimated annual savings at ${state.savingsRate}% negotiated reduction.</span><input id="savings-rate" type="range" min="0" max="20" value="${state.savingsRate}"/><div><b>${state.savingsRate}% target</b><small>${money(spend.annualSpend)} vendor spend base</small></div></div>`)}
    </section>
    <section class="two-col">
      ${panel("Vendor renewal radar", "Contract exposure", `<div class="renewal-list">${summary.risks.slice().sort((a,b)=>a.risk.renewalDays-b.risk.renewalDays).map(({vendor,risk}) => `<article><div><strong>${esc(vendor.name)}</strong><small>${esc(vendor.category)} · contract ${risk.renewalDays < 0 ? "expired" : `in ${risk.renewalDays} days`}</small></div>${badge(risk.band, tone(risk.band))}</article>`).join("")}</div>`)}
      ${panel("Selected procurement request", request.id, `<div class="selected-summary"><span>Selected vendor <b>${esc(analysis.vendor?.name || "Not selected")}</b></span><span>Recommended amount <b>${money(analysis.selectedPrice)}</b></span><span>Approval route <b>${analysis.approvedCount}/${analysis.approvalTotal}</b></span>${progress(analysis.approvalTotal ? analysis.approvedCount / analysis.approvalTotal * 100 : 0, analysis.approvedCount === analysis.approvalTotal ? "green" : "gold")}<button class="button outline" data-action="go-requests">Review comparison</button></div>`)}
    </section>`;
}

function renderRequestForm() {
  return `${showNewRequest ? panel("New purchase request", "Capture a procurement need", `<form id="new-request-form" class="request-form">
    <label>Request title<input name="title" required placeholder="e.g. Security monitoring renewal"/></label>
    <label>Department<select name="budgetId">${state.budgets.map((budget) => `<option value="${budget.id}">${esc(budget.name)}</option>`).join("")}</select></label>
    <label>Category<select name="category"><option>Infrastructure</option><option>Security</option><option>Automation</option><option>Design</option><option>Research</option><option>Data</option></select></label>
    <label>Requested amount<input name="amount" type="number" min="1" required placeholder="0"/></label>
    <label>Requester<input name="requester" required value="Hira Khyzer"/></label>
    <label class="wide">Business need<textarea name="description" rows="3" required placeholder="What is being purchased and what delivery or operational outcome does it protect?"></textarea></label>
    <div class="form-actions"><button class="button" type="submit">Create request</button><button class="button outline" type="button" data-action="toggle-new-request">Cancel</button></div>
  </form>`) : ""}`;
}

function renderRequests() {
  const request = selectedRequest();
  const analysis = requestAnalysis(request, state.vendors, state.budgets);
  const quotes = analysis.quote.quotes;
  const approvals = [
    ["pm", "Project Manager", "Amina Noor"],
    ["finance", "Finance", "Finance control"],
    ["founder", "Founder", "Hira Khyzer"],
    ["security", "Security", "Security review"],
  ];
  return `
    <section class="page-heading"><div><p>Purchase request workspace</p><h1>Compare, approve, and release spend</h1><span>Every request shows its budget capacity, best commercial option, vendor risk, required approval route, and purchase-order readiness.</span></div><button class="button" data-action="toggle-new-request">${showNewRequest ? "Close request form" : "New purchase request"}</button></section>
    ${renderRequestForm()}
    <section class="workbench">
      ${panel("Request queue", "Select a purchase request", `<div class="request-list">${state.requests.map((item) => { const itemAnalysis = requestAnalysis(item, state.vendors, state.budgets); return `<button class="${item.id === request.id ? "selected" : ""}" data-action="select-request" data-id="${item.id}"><i class="${tone(itemAnalysis.decision)}">●</i><div><strong>${esc(item.id)} · ${esc(item.title)}</strong><small>${esc(item.department)} · ${money(itemAnalysis.selectedPrice)} · ${itemAnalysis.approvedCount}/${itemAnalysis.approvalTotal} approvals</small></div>${badge(item.status, statusTone(item.status))}</button>`; }).join("")}</div>`)}
      <div class="request-detail">
        ${panel("Commercial review", `${request.id} — ${request.title}`, `<div class="request-top"><div>${badge(request.status, statusTone(request.status))}${badge(analysis.decision, tone(analysis.decision))}</div><span>${esc(request.department)} · requested by ${esc(request.requester)} · ${dateLabel(request.created)}</span></div><p class="description">${esc(request.description)}</p><div class="request-stats"><span>Available budget <b>${money(analysis.available)}</b></span><span>Selected amount <b>${money(analysis.selectedPrice)}</b></span><span>Vendor risk <b>${analysis.risk.score}/100</b></span><span>Quote savings <b>${money(analysis.quoteSavings)}</b></span></div>${progress(analysis.budget ? Math.min(100, analysis.budget.committed / analysis.budget.limit * 100) : 0, analysis.budgetFit ? "green" : "red")}<p class="budget-note">${analysis.budgetFit ? `Budget remains protected after this purchase.` : `Budget would be exceeded by ${money(analysis.selectedPrice - analysis.available)}.`}</p>`)}
        <section class="detail-grid">
          ${panel("Three-vendor comparison", "Choose the best total value", `<div class="quote-grid">${quotes.map((quote) => `<article class="quote ${quote.vendorId === request.selectedVendorId ? "selected" : ""}"><div><span>${quote.vendor?.name ? esc(quote.vendor.name) : "Unknown vendor"}</span>${badge(quote.risk.band, tone(quote.risk.band))}</div><strong>${money(quote.price)}</strong><small>${quote.leadDays} delivery days · ${quote.warrantyMonths} month warranty</small><p>${esc(quote.note)}</p><div class="quote-footer"><b>${quote.vendorId === analysis.quote.recommended?.vendorId ? "Best total value" : `Adjusted value ${money(quote.adjustedValue)}`}</b><button class="button ${quote.vendorId === request.selectedVendorId ? "outline" : ""}" data-action="select-quote" data-vendor="${quote.vendorId}">${quote.vendorId === request.selectedVendorId ? "Selected" : "Select quote"}</button></div></article>`).join("")}</div>`)}
          ${panel("Approval route", "Internal release controls", `<div class="approval-list">${approvals.map(([key,label,owner]) => { const required = analysis.approvalKeys.includes(key); const complete = request.approvals?.[key]; return `<article class="${required ? "" : "not-required"}"><button ${required ? "" : "disabled"} class="${complete ? "done" : ""}" data-action="toggle-approval" data-key="${key}">${complete ? "✓" : required ? "○" : "—"}</button><div><strong>${label}</strong><small>${required ? owner : "Not required for this request"}</small></div>${required ? badge(complete ? "Approved" : "Pending", complete ? "success" : "warning") : badge("Not required", "neutral")}</article>`; }).join("")}</div><div class="approval-footer"><span>${analysis.approvedCount}/${analysis.approvalTotal} required approvals complete</span>${progress(analysis.approvalTotal ? analysis.approvedCount / analysis.approvalTotal * 100 : 0, analysis.approvedCount === analysis.approvalTotal ? "green" : "gold")}</div>`)}
        </section>
        ${panel("Release decision", "Purchase order readiness", `<div class="release-card"><div><strong>${analysis.decision}</strong><p>${esc(analysis.reason)}</p></div><div><button class="button" data-action="release-po" ${analysis.approvedCount < analysis.approvalTotal || !analysis.budgetFit || request.status === "Ordered" ? "disabled" : ""}>${request.status === "Ordered" ? "Purchase order released" : "Release purchase order"}</button><button class="button outline" data-action="mark-rejected">Reject request</button></div></div>`)}
      </div>
    </section>`;
}

function renderVendors(summary) {
  const vendor = selectedVendor();
  const risk = vendorRisk(vendor);
  const spend = savingsSimulation(state.vendors, state.savingsRate);
  return `
    <section class="page-heading"><div><p>Supplier intelligence</p><h1>Vendor performance and renewal control</h1><span>Review delivery reliability, quality, security posture, payment terms, contract timing, spend concentration, and commercial savings opportunities.</span></div><button class="button" data-action="go-requests">Compare quotes</button></section>
    <section class="vendor-layout">
      ${panel("Vendor portfolio", "Supplier scorecards", `<div class="vendor-list">${summary.risks.slice().sort((a,b)=>b.risk.score-a.risk.score).map(({vendor:item,risk:itemRisk}) => `<button class="${item.id === vendor.id ? "selected" : ""}" data-action="select-vendor" data-id="${item.id}"><span class="vendor-mark">${esc(item.name.split(" ").map((word) => word[0]).slice(0,2).join(""))}</span><div><strong>${esc(item.name)}</strong><small>${esc(item.category)} · ${money(item.annualSpend)} annual spend</small></div>${badge(`${itemRisk.score}/100`, tone(itemRisk.band))}</button>`).join("")}</div>`)}
      <div>
        ${panel("Selected vendor", vendor.name, `<div class="vendor-overview"><div class="vendor-score ${tone(risk.band)}"><b>${risk.score}</b><span>risk score</span>${badge(risk.band, tone(risk.band))}</div><div><p>${esc(risk.recommendation)}</p><div class="vendor-stats"><span>On-time <b>${percent(vendor.onTimeRate)}</b></span><span>Quality <b>${percent(vendor.qualityScore)}</b></span><span>Security <b>${esc(vendor.security)}</b></span><span>Terms <b>${vendor.paymentTerms} days</b></span></div></div></div><div class="contract-line"><span>Contract expiry <b>${dateLabel(vendor.contractEnd)}</b></span><span>${risk.renewalDays < 0 ? "Expired" : `${risk.renewalDays} days remaining`}</span></div><p class="vendor-note">${esc(vendor.notes)}</p>`)}
        <section class="two-col">
          ${panel("Savings simulator", "Commercial target", `<div class="savings-card"><strong>${money(spend.savings)}</strong><span>Portfolio savings at ${state.savingsRate}% negotiated reduction.</span><input id="savings-rate" type="range" min="0" max="20" value="${state.savingsRate}"/><div><b>${state.savingsRate}% target</b><small>${money(spend.retainedSpend)} post-savings spend</small></div></div>`)}
          ${panel("Vendor risk actions", "Next commercial moves", `<div class="risk-actions">${summary.actionPlan.filter((item)=>item.type === "risk").length ? summary.actionPlan.filter((item)=>item.type === "risk").map((item) => `<article><i>!</i><div><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></div></article>`).join("") : `<div class="empty"><i>✓</i><strong>No risk escalation</strong><p>Portfolio vendor controls are within the current operating threshold.</p></div>`}</div>`)}
        </section>
      </div>
    </section>`;
}

function renderOrders(summary) {
  return `
    <section class="page-heading"><div><p>Purchase orders and matching</p><h1>Release, delivery, invoice, and finance control</h1><span>Match purchase order values against confirmed delivery and supplier invoice data before payment moves through the finance workflow.</span></div><button class="button" data-action="go-requests">Release an approved request</button></section>
    <section class="metrics">
      ${metric("Purchase orders", summary.orders.length, "Current procurement order records", "gold", "▤")}
      ${metric("Fully matched", summary.orders.filter((item)=>item.match.status === "Matched").length, "PO, delivery, and invoice aligned", "success", "✓")}
      ${metric("Exceptions", summary.unmatchedOrders.length, "Require delivery or finance follow-up", summary.unmatchedOrders.length ? "warning" : "success", "!")}
      ${metric("Renewal watch", summary.expirySoon.length, "Vendor contracts expiring within 60 days", summary.expirySoon.length ? "danger" : "blue", "◷")}
    </section>
    ${panel("Three-way match control", "Purchase orders", `<div class="orders-table"><div class="orders-head"><span>Purchase order</span><span>Vendor</span><span>PO value</span><span>Delivery</span><span>Invoice</span><span>Match status</span><span></span></div>${summary.orders.map(({order,match}) => { const vendor = state.vendors.find((item)=>item.id === order.vendorId); return `<div class="order-row"><div><strong>${esc(order.id)}</strong><small>${esc(order.title)}</small></div><span>${esc(vendor?.name || "Unknown vendor")}</span><span>${money(order.poAmount)}</span><span>${match.delivery ? "Received" : "Pending"}</span><span>${match.invoice ? money(order.invoiceAmount) : "Not received"}</span>${badge(match.status, tone(match.status))}<div class="order-actions"><button class="tiny-button" data-action="toggle-delivery" data-id="${order.id}">${match.delivery ? "Undo delivery" : "Mark delivered"}</button><button class="tiny-button" data-action="record-invoice" data-id="${order.id}" ${match.invoice ? "disabled" : ""}>Record invoice</button></div></div>`; }).join("")}</div>`)}
    <section class="two-col">
      ${panel("Matching exceptions", "Finance follow-up queue", `<div class="exception-list">${summary.unmatchedOrders.length ? summary.unmatchedOrders.map(({order,match}) => `<article><i>${match.status === "Invoice hold" ? "!" : "○"}</i><div><strong>${esc(order.id)} · ${esc(match.status)}</strong><small>${match.exception ? `${money(match.exception)} invoice difference` : "Complete the missing delivery or invoice record."}</small></div></article>`).join("") : `<div class="empty"><i>✓</i><strong>All orders matched</strong><p>Every current purchase order has aligned delivery and invoice information.</p></div>`}</div>`)}
      ${panel("Contract renewal radar", "Supplier contracts to decide", `<div class="renewal-list">${summary.risks.filter((item)=>item.risk.renewalDays <= 90).sort((a,b)=>a.risk.renewalDays-b.risk.renewalDays).map(({vendor,risk}) => `<article><div><strong>${esc(vendor.name)}</strong><small>${risk.renewalDays < 0 ? "Contract expired" : `${risk.renewalDays} days to expiry`} · ${money(vendor.annualSpend)} annual spend</small></div>${badge(risk.band, tone(risk.band))}</article>`).join("")}</div>`)}
    </section>`;
}

function renderReports(summary) {
  const request = selectedRequest();
  const analysis = requestAnalysis(request, state.vendors, state.budgets);
  return `
    <section class="page-heading"><div><p>Procurement governance</p><h1>Reports and decision records</h1><span>Save a snapshot before an approval meeting, vendor negotiation, purchase-order release, invoice exception, or contract-renewal decision.</span></div><button class="button" data-action="save-report">Save procurement snapshot</button></section>
    <section class="metrics">
      ${metric("Selected decision", esc(analysis.decision), `${analysis.approvedCount}/${analysis.approvalTotal} approvals complete`, tone(analysis.decision), "◆")}
      ${metric("Vendor risk", `${analysis.risk.score}/100`, `${analysis.vendor?.name || "No vendor selected"}`, tone(analysis.risk.band), "!")}
      ${metric("Budget capacity", money(analysis.available), `Before selected amount of ${money(analysis.selectedPrice)}`, analysis.budgetFit ? "success" : "danger", "◌")}
      ${metric("Potential savings", money(summary.potentialSavings), "Best-versus-highest quote spread", "blue", "↗")}
    </section>
    <section class="two-col">
      ${panel("Export package", "Share a finance-ready record", `<div class="export-actions"><button class="button" data-action="export-txt">Download TXT report</button><button class="button outline" data-action="export-json">Download JSON</button><button class="button outline" data-action="print">Print / Save as PDF</button></div><div class="report-preview"><strong>${esc(request.id)} · ${esc(request.title)}</strong><span>Selected vendor: ${esc(analysis.vendor?.name || "Not selected")}</span><span>Commercial decision: ${esc(analysis.decision)}</span><span>Recommendation: ${money(analysis.selectedPrice)}</span><span>Budget remaining: ${money(summary.budgetRemaining)}</span></div>`)}
      ${panel("Workspace control", "Browser prototype data", `<p class="report-copy">Procurement data stays in this browser until a production database is connected. Use a report export for a finance handoff or external record.</p><button class="button outline" data-action="reset">Reset demo workspace</button><div class="brand-rows"><span>Made by</span><b>Hira Khyzer</b><span>Company</span><b>Elite Era Development L.L.C</b><span>Brand color</span><b>#f4af00</b></div>`)}
    </section>
    ${panel("Saved procurement snapshots", "Decision record library", state.savedReports.length ? `<div class="report-list"><div class="report-head"><span>Request</span><span>Decision</span><span>Vendor</span><span>Amount</span><span>Saved</span><span></span></div>${state.savedReports.map((report)=>`<div class="report-row"><div><strong>${esc(report.requestId)}</strong><small>${esc(report.title)}</small></div>${badge(report.decision, tone(report.decision))}<span>${esc(report.vendor)}</span><span>${money(report.amount)}</span><span>${esc(report.createdAt)}</span><button data-action="remove-report" data-id="${report.id}">Remove</button></div>`).join("")}</div>` : `<div class="empty"><i>▤</i><strong>No saved procurement snapshots</strong><p>Save the active request position before you change its selected vendor or approval state.</p></div>`)}
    ${panel("Portfolio memo", "Leadership view", `<div class="memo"><article><span>Budget posture</span><p>${money(summary.budgetRemaining)} remains across active procurement budgets after ${money(summary.budgetCommitted)} committed spend.</p></article><article><span>Control posture</span><p>${summary.pendingApprovals.length} request${summary.pendingApprovals.length === 1 ? "" : "s"} still need internal approval and ${summary.unmatchedOrders.length} purchase order${summary.unmatchedOrders.length === 1 ? "" : "s"} need matching follow-up.</p></article><article><span>Vendor posture</span><p>${summary.highRiskVendors.length ? `${summary.highRiskVendors.length} vendor risk review${summary.highRiskVendors.length === 1 ? " is" : "s are"} urgent before awarding additional work.` : "No high-risk vendor currently requires escalation."}</p></article></div>`)}
  `;
}

function render() {
  const summary = procurementSummary(state);
  const pages = {
    dashboard: renderDashboard(summary),
    requests: renderRequests(summary),
    vendors: renderVendors(summary),
    orders: renderOrders(summary),
    reports: renderReports(summary),
  };
  const request = selectedRequest();
  const currentAnalysis = requestAnalysis(request, state.vendors, state.budgets);
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">E</div><div><span>Elite Era Development L.L.C</span><strong>Procurement Command</strong></div></div>
        <nav>${navButton("dashboard", "Command center", "◆")}${navButton("requests", "Purchase requests", "◫")}${navButton("vendors", "Vendor intelligence", "◉")}${navButton("orders", "Orders & matching", "▤")}${navButton("reports", "Reports", "▧")}</nav>
        <div class="side-card"><span>Selected request</span><strong>${esc(request.id)}</strong><small>${currentAnalysis.risk.score}/100 vendor risk · ${currentAnalysis.approvedCount}/${currentAnalysis.approvalTotal} approvals</small><div><i class="${tone(currentAnalysis.risk.band)}"></i><b>${esc(request.status)}</b><em>${money(currentAnalysis.selectedPrice)}</em></div></div>
        <div class="profile"><span>HK</span><div><strong>Hira Khyzer</strong><small>Founder · Elite Era</small></div></div>
      </aside>
      <main class="workspace">
        <header class="topbar"><div><p>Vendor, budget, and purchasing control system</p><h2>${esc(request.title)}</h2></div><div><span class="saved">● Saved locally</span><button class="button outline" data-action="export-txt">Export report</button><button class="button" data-action="go-requests">Review request</button></div></header>
        <div class="mobile-tabs">${[ ["dashboard","Command center"], ["requests","Requests"], ["vendors","Vendors"], ["orders","Orders"], ["reports","Reports"] ].map(([id,label])=>`<button class="${activeTab===id?"active":""}" data-action="nav" data-tab="${id}">${label}</button>`).join("")}</div>
        <section class="content">${pages[activeTab]}</section>
        <footer class="footer"><strong>Made by Hira Khyzer</strong><span>Elite Era Development L.L.C</span><b>#f4af00</b></footer>
      </main>
      ${toast ? `<div class="toast">${esc(toast)}</div>` : ""}
    </div>`;
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "nav") { activeTab = target.dataset.tab; render(); return; }
  if (action === "go-requests") { activeTab = "requests"; render(); return; }
  if (action === "toggle-new-request") { showNewRequest = !showNewRequest; render(); return; }
  if (action === "select-request") { selectedRequestId = target.dataset.id; activeTab = "requests"; render(); return; }
  if (action === "select-vendor") { selectedVendorId = target.dataset.id; activeTab = "vendors"; render(); return; }
  if (action === "choose-recommended") {
    const request = selectedRequest(); const analysis = requestAnalysis(request, state.vendors, state.budgets);
    if (!analysis.quote.recommended) return;
    updateState((next) => { const item = next.requests.find((entry) => entry.id === request.id); item.selectedVendorId = analysis.quote.recommended.vendorId; return next; });
    notify("Recommended best-value quote selected"); return;
  }
  if (action === "select-quote") {
    const request = selectedRequest(); const vendorId = target.dataset.vendor;
    updateState((next) => { const item = next.requests.find((entry) => entry.id === request.id); item.selectedVendorId = vendorId; return next; });
    notify("Vendor quote selected for review"); return;
  }
  if (action === "toggle-approval") {
    const request = selectedRequest(); const key = target.dataset.key;
    updateState((next) => {
      const item = next.requests.find((entry) => entry.id === request.id);
      item.approvals[key] = !item.approvals[key];
      const analysis = requestAnalysis(item, next.vendors, next.budgets);
      if (analysis.approvedCount === analysis.approvalTotal && analysis.budgetFit) item.status = "Approved";
      else if (item.status === "Approved") item.status = "Finance Review";
      return next;
    });
    notify("Approval route updated"); return;
  }
  if (action === "release-po") {
    const request = selectedRequest(); const analysis = requestAnalysis(request, state.vendors, state.budgets);
    if (analysis.approvedCount < analysis.approvalTotal || !analysis.budgetFit) { notify("Complete approvals and resolve budget fit before release"); return; }
    updateState((next) => {
      const item = next.requests.find((entry) => entry.id === request.id);
      if (item.status === "Ordered") return next;
      const orderNumber = `PO-${Math.max(410, ...next.orders.map((order) => Number(order.id.replace("PO-", "")) + 1))}`;
      next.orders.unshift({ id: orderNumber, requestId: item.id, vendorId: item.selectedVendorId, title: item.title, poAmount: analysis.selectedPrice, invoiceAmount: 0, deliveryReceived: false, invoiceReceived: false, invoiceDue: "2026-07-31", created: TODAY });
      const budget = next.budgets.find((entry) => entry.id === item.budgetId); if (budget) budget.committed += analysis.selectedPrice;
      item.status = "Ordered";
      return next;
    });
    notify("Purchase order released and budget committed"); return;
  }
  if (action === "mark-rejected") {
    const request = selectedRequest(); updateState((next) => { next.requests.find((entry) => entry.id === request.id).status = "Rejected"; return next; }); notify("Purchase request marked rejected"); return;
  }
  if (action === "toggle-delivery") {
    const id = target.dataset.id; updateState((next) => { const order = next.orders.find((entry) => entry.id === id); order.deliveryReceived = !order.deliveryReceived; return next; }); notify("Delivery record updated"); return;
  }
  if (action === "record-invoice") {
    const id = target.dataset.id; updateState((next) => { const order = next.orders.find((entry) => entry.id === id); order.invoiceReceived = true; order.invoiceAmount = order.poAmount; return next; }); notify("Invoice recorded at purchase-order value"); return;
  }
  if (action === "save-report") {
    const request = selectedRequest(); const analysis = requestAnalysis(request, state.vendors, state.budgets);
    updateState((next) => { next.savedReports.unshift({ id: `report-${Date.now()}`, requestId: request.id, title: request.title, decision: analysis.decision, vendor: analysis.vendor?.name || "Not selected", amount: analysis.selectedPrice, createdAt: new Date().toLocaleString() }); next.savedReports = next.savedReports.slice(0, 20); return next; }); notify("Procurement snapshot saved"); return;
  }
  if (action === "remove-report") { const id = target.dataset.id; updateState((next) => { next.savedReports = next.savedReports.filter((item) => item.id !== id); return next; }); notify("Saved snapshot removed"); return; }
  if (action === "export-txt") { const request = selectedRequest(); const summary = procurementSummary(state); const analysis = requestAnalysis(request, state.vendors, state.budgets); download("elite-vendor-procurement-report.txt", reportText(state, summary, request, analysis), "text/plain"); notify("TXT report downloaded"); return; }
  if (action === "export-json") { const request = selectedRequest(); const analysis = requestAnalysis(request, state.vendors, state.budgets); download("elite-vendor-procurement-analysis.json", JSON.stringify({ generatedAt: new Date().toLocaleString(), company: "Elite Era Development L.L.C", request, analysis, summary: procurementSummary(state) }, null, 2), "application/json"); notify("JSON analysis downloaded"); return; }
  if (action === "print") { window.print(); return; }
  if (action === "reset") { if (window.confirm("Reset all procurement demo data in this browser?")) { state = clone(initialState); persist(); selectedRequestId = state.requests[0].id; selectedVendorId = state.vendors[0].id; activeTab = "dashboard"; notify("Demo workspace reset"); } return; }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "savings-rate") { updateState((next) => { next.savingsRate = Number(event.target.value); return next; }); }
});

app.addEventListener("submit", (event) => {
  if (event.target.id !== "new-request-form") return;
  event.preventDefault();
  const form = new FormData(event.target);
  const amount = Math.max(1, Number(form.get("amount")) || 0);
  const budgetId = form.get("budgetId");
  const vendors = state.vendors.slice(0, 3);
  const request = {
    id: `PR-${Math.max(113, ...state.requests.map((item) => Number(item.id.replace("PR-", "")) + 1))}`,
    title: String(form.get("title") || "New procurement request"),
    department: state.budgets.find((item) => item.id === budgetId)?.name || "Procurement",
    budgetId,
    category: String(form.get("category") || "General"),
    requester: String(form.get("requester") || "Hira Khyzer"),
    requestedAmount: amount,
    status: "PM Review",
    selectedVendorId: vendors[0]?.id || "",
    created: TODAY,
    description: String(form.get("description") || ""),
    approvals: { pm: false, finance: false, founder: false, security: false },
    quotes: vendors.map((vendor, index) => ({ vendorId: vendor.id, price: Math.round(amount * [0.94, 1, 1.08][index]), leadDays: [5, 8, 11][index], warrantyMonths: [12, 9, 6][index], note: "Generated comparison quote — replace with supplier evidence during sourcing." })),
  };
  updateState((next) => { next.requests.unshift(request); return next; });
  selectedRequestId = request.id; showNewRequest = false; activeTab = "requests"; notify("New purchase request created with a three-vendor comparison");
});

render();
