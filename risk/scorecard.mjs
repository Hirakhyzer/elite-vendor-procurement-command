export function vendorScorecard(metrics, weights = {}) {
  const defaults = { reliability: .3, security: .25, cost: .2, support: .15, compliance: .1 };
  const w = { ...defaults, ...weights };
  const totalWeight = Object.values(w).reduce((sum, value) => sum + Number(value || 0), 0);
  if (totalWeight <= 0) throw new Error("scorecard weights must be positive");
  const score = Object.entries(w).reduce((sum, [key, weight]) => sum + Number(metrics[key] || 0) * weight, 0) / totalWeight;
  return { score: Math.round(score), band: score >= 80 ? "Preferred" : score >= 65 ? "Approved" : score >= 50 ? "Watch" : "Review" };
}
