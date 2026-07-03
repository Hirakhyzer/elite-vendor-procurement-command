export const TODAY = "2026-07-03";

export const money = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

export const percent = (value) => `${Math.round(Number(value) || 0)}%`;

export const dateLabel = (value) => value
  ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`))
  : "—";

export const daysUntil = (date, today = TODAY) => Math.round((new Date(`${date}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function vendorRisk(vendor, today = TODAY) {
  const deliveryPenalty = Math.max(0, 100 - Number(vendor.onTimeRate || 0)) * 0.34;
  const qualityPenalty = Math.max(0, 100 - Number(vendor.qualityScore || 0)) * 0.23;
  const securityPenalty = vendor.security === "Verified" ? 0 : vendor.security === "Review" ? 14 : 28;
  const termsPenalty = Number(vendor.paymentTerms || 0) >= 45 ? 0 : Number(vendor.paymentTerms || 0) >= 30 ? 5 : 11;
  const renewalDays = daysUntil(vendor.contractEnd, today);
  const contractPenalty = renewalDays < 0 ? 24 : renewalDays <= 30 ? 18 : renewalDays <= 60 ? 8 : 0;
  const concentrationPenalty = Number(vendor.annualSpend || 0) >= 18000 ? 7 : Number(vendor.annualSpend || 0) >= 10000 ? 3 : 0;
  const score = Math.round(clamp(deliveryPenalty + qualityPenalty + securityPenalty + termsPenalty + contractPenalty + concentrationPenalty, 0, 100));
  const band = score >= 60 ? "High" : score >= 30 ? "Medium" : "Low";
  const recommendation = score >= 60
    ? "Escalate vendor review before awarding more business."
    : score >= 30
      ? "Use with an owner-based mitigation or commercial guardrail."
      : "Approved operating profile based on current performance signals.";
  return { score, band, renewalDays, recommendation };
}

export function quoteDecision(request, vendors) {
  const quotes = (request.quotes || []).map((quote) => {
    const vendor = vendors.find((item) => item.id === quote.vendorId);
    const risk = vendor ? vendorRisk(vendor) : { score: 80, band: "High" };
    const leadPenalty = Number(quote.leadDays || 0) * 55;
    const riskAdjustment = Number(quote.price || 0) * (risk.score / 100) * 0.14;
    const adjustedValue = Number(quote.price || 0) + leadPenalty + riskAdjustment;
    return { ...quote, vendor, risk, adjustedValue };
  }).sort((a, b) => a.adjustedValue - b.adjustedValue);
  const lowestPrice = quotes.slice().sort((a, b) => a.price - b.price)[0];
  const recommended = quotes[0];
  const highestPrice = quotes.slice().sort((a, b) => b.price - a.price)[0];
  return {
    quotes,
    recommended,
    lowestPrice,
    savingsPotential: lowestPrice && highestPrice ? Math.max(0, highestPrice.price - lowestPrice.price) : 0,
  };
}

export function requestAnalysis(request, vendors, budgets) {
  const quote = quoteDecision(request, vendors);
  const selected = quote.quotes.find((item) => item.vendorId === request.selectedVendorId) || quote.recommended;
  const budget = budgets.find((item) => item.id === request.budgetId);
  const available = budget ? Math.max(0, budget.limit - budget.committed) : 0;
  const selectedPrice = Number(selected?.price || request.requestedAmount || 0);
  const vendor = selected?.vendor;
  const risk = vendor ? vendorRisk(vendor) : { score: 80, band: "High" };
  const approvalKeys = ["pm", "finance"];
  if (selectedPrice >= 9000 || risk.band === "High") approvalKeys.push("founder");
  if (request.category === "Security" || vendor?.security !== "Verified") approvalKeys.push("security");
  const approvedCount = approvalKeys.filter((key) => request.approvals?.[key]).length;
  const budgetFit = selectedPrice <= available;
  let decision = "Approve";
  let reason = "Selected quote fits the budget and vendor operating profile.";
  if (!budgetFit) {
    decision = "Re-scope";
    reason = `Selected quote exceeds available budget by ${money(selectedPrice - available)}.`;
  } else if (risk.band === "High") {
    decision = "Negotiate";
    reason = "Vendor risk needs mitigation, a stronger SLA, or an alternative supplier before award.";
  } else if (selectedPrice >= 9000 || request.category === "Security") {
    decision = "Escalate";
    reason = "Commercial value or control requirements need additional approval before purchase order release.";
  }
  return { quote, selected, vendor, risk, budget, available, selectedPrice, budgetFit, approvalKeys, approvedCount, approvalTotal: approvalKeys.length, decision, reason, quoteSavings: quote.savingsPotential };
}

export function matchStatus(order) {
  const delivery = Boolean(order.deliveryReceived);
  const invoice = Boolean(order.invoiceReceived);
  const amountMatch = invoice && Math.abs(Number(order.invoiceAmount || 0) - Number(order.poAmount || 0)) <= 1;
  const exception = !amountMatch && invoice ? Math.abs(Number(order.invoiceAmount || 0) - Number(order.poAmount || 0)) : 0;
  const status = delivery && invoice && amountMatch ? "Matched" : invoice && !amountMatch ? "Invoice hold" : delivery && !invoice ? "Awaiting invoice" : "Pending";
  return { delivery, invoice, amountMatch, status, exception };
}

export function savingsSimulation(vendors, rate) {
  const annualSpend = vendors.reduce((sum, vendor) => sum + Number(vendor.annualSpend || 0), 0);
  const savings = annualSpend * (Number(rate || 0) / 100);
  return { annualSpend, savings, retainedSpend: annualSpend - savings };
}

export function procurementSummary(state) {
  const analyses = state.requests.map((request) => ({ request, analysis: requestAnalysis(request, state.vendors, state.budgets) }));
  const risks = state.vendors.map((vendor) => ({ vendor, risk: vendorRisk(vendor) }));
  const orders = state.orders.map((order) => ({ order, match: matchStatus(order) }));
  const budgetLimit = state.budgets.reduce((sum, budget) => sum + Number(budget.limit || 0), 0);
  const budgetCommitted = state.budgets.reduce((sum, budget) => sum + Number(budget.committed || 0), 0);
  const activeRequests = analyses.filter((item) => !["Ordered", "Closed", "Rejected"].includes(item.request.status));
  const pendingApprovals = activeRequests.filter((item) => item.analysis.approvedCount < item.analysis.approvalTotal);
  const highRiskVendors = risks.filter((item) => item.risk.band === "High");
  const expirySoon = risks.filter((item) => item.risk.renewalDays <= 60);
  const unmatchedOrders = orders.filter((item) => item.match.status !== "Matched");
  const potentialSavings = analyses.reduce((sum, item) => sum + item.analysis.quoteSavings, 0);
  const actionPlan = [];
  highRiskVendors.forEach(({ vendor, risk }) => actionPlan.push({ type: "risk", title: `Review ${vendor.name}`, detail: `${risk.score}/100 vendor risk · contract ${risk.renewalDays < 0 ? "expired" : `expires in ${risk.renewalDays} days`}` }));
  pendingApprovals.forEach(({ request, analysis }) => actionPlan.push({ type: "approval", title: `Complete ${request.id} approvals`, detail: `${analysis.approvedCount}/${analysis.approvalTotal} required approvals complete · ${money(analysis.selectedPrice)}` }));
  unmatchedOrders.forEach(({ order, match }) => actionPlan.push({ type: "matching", title: `Resolve ${order.id} matching status`, detail: `${match.status}${match.exception ? ` · ${money(match.exception)} difference` : ""}` }));
  if (!actionPlan.length) actionPlan.push({ type: "success", title: "Procurement controls are stable", detail: "Current vendors, approvals, and matching records have no immediate exception." });
  return { analyses, risks, orders, budgetLimit, budgetCommitted, budgetRemaining: budgetLimit - budgetCommitted, activeRequests, pendingApprovals, highRiskVendors, expirySoon, unmatchedOrders, potentialSavings, actionPlan: actionPlan.slice(0, 8) };
}

export function reportText(state, summary, request, analysis) {
  const lines = [
    "ELITE ERA DEVELOPMENT L.L.C — VENDOR & PROCUREMENT COMMAND",
    "Made by Hira Khyzer",
    "",
    `Selected request: ${request.id} — ${request.title}`,
    `Department: ${request.department}`,
    `Status: ${request.status}`,
    `Decision: ${analysis.decision}`,
    `Selected vendor: ${analysis.vendor?.name || "Not selected"}`,
    `Recommended purchase amount: ${money(analysis.selectedPrice)}`,
    `Budget remaining before purchase: ${money(analysis.available)}`,
    `Vendor risk: ${analysis.risk.score}/100 (${analysis.risk.band})`,
    `Approval progress: ${analysis.approvedCount}/${analysis.approvalTotal}`,
    "",
    "--- PORTFOLIO ---",
    `Budget remaining: ${money(summary.budgetRemaining)}`,
    `Pending approvals: ${summary.pendingApprovals.length}`,
    `High-risk vendors: ${summary.highRiskVendors.length}`,
    `Unmatched purchase orders: ${summary.unmatchedOrders.length}`,
    `Quote savings potential: ${money(summary.potentialSavings)}`,
    "",
    "--- ACTION PLAN ---",
    ...summary.actionPlan.map((item) => `- ${item.title}: ${item.detail}`),
    "",
  ];
  return lines.join("\n");
}
