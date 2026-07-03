import test from "node:test";
import assert from "node:assert/strict";
import { matchStatus, procurementSummary, quoteDecision, requestAnalysis, vendorRisk } from "./engine.mjs";

const safeVendor = {
  id: "safe", name: "Safe Vendor", onTimeRate: 97, qualityScore: 95, security: "Verified", paymentTerms: 45, contractEnd: "2026-12-20", annualSpend: 4000,
};
const riskyVendor = {
  id: "risky", name: "Risky Vendor", onTimeRate: 68, qualityScore: 70, security: "Expired", paymentTerms: 15, contractEnd: "2026-06-01", annualSpend: 22000,
};

test("vendor risk identifies a verified vendor as lower risk", () => {
  const safe = vendorRisk(safeVendor);
  const risky = vendorRisk(riskyVendor);
  assert.equal(safe.band, "Low");
  assert.equal(risky.band, "High");
  assert.ok(risky.score > safe.score);
});

test("quote comparison considers supplier risk and delivery timing", () => {
  const request = {
    quotes: [
      { vendorId: "safe", price: 10000, leadDays: 5 },
      { vendorId: "risky", price: 9000, leadDays: 18 },
    ],
  };
  const decision = quoteDecision(request, [safeVendor, riskyVendor]);
  assert.equal(decision.recommended.vendorId, "safe");
  assert.equal(decision.savingsPotential, 1000);
});

test("request analysis escalates a security purchase above approval threshold", () => {
  const request = {
    id: "PR-1", title: "Security audit", category: "Security", budgetId: "product", requestedAmount: 12000, selectedVendorId: "safe", approvals: { pm: true, finance: true, founder: false, security: false }, quotes: [{ vendorId: "safe", price: 11200, leadDays: 5 }],
  };
  const analysis = requestAnalysis(request, [safeVendor], [{ id: "product", limit: 20000, committed: 3000 }]);
  assert.ok(analysis.approvalKeys.includes("founder"));
  assert.ok(analysis.approvalKeys.includes("security"));
  assert.equal(analysis.decision, "Escalate");
});

test("three-way matching holds an invoice with a value difference", () => {
  const match = matchStatus({ poAmount: 5000, invoiceAmount: 5500, deliveryReceived: true, invoiceReceived: true });
  assert.equal(match.status, "Invoice hold");
  assert.equal(match.exception, 500);
});

test("portfolio summary surfaces pending approvals and matching work", () => {
  const state = {
    budgets: [{ id: "delivery", limit: 10000, committed: 2000 }],
    vendors: [safeVendor],
    requests: [{ id: "PR-2", title: "Monitor", category: "Infrastructure", budgetId: "delivery", requestedAmount: 3000, selectedVendorId: "safe", status: "PM Review", approvals: { pm: false, finance: false, founder: false, security: false }, quotes: [{ vendorId: "safe", price: 3000, leadDays: 4 }] }],
    orders: [{ id: "PO-1", poAmount: 3000, invoiceAmount: 0, deliveryReceived: true, invoiceReceived: false }],
  };
  const summary = procurementSummary(state);
  assert.equal(summary.pendingApprovals.length, 1);
  assert.equal(summary.unmatchedOrders.length, 1);
  assert.equal(summary.budgetRemaining, 8000);
});
