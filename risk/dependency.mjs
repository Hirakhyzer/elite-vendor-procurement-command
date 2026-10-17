export function dependencyRisk(vendor) {
  const alternatives = Number(vendor.alternatives || 0);
  const switchingDays = Number(vendor.switchingDays || 0);
  const criticality = Number(vendor.criticality || 0);
  const score = Math.max(0, Math.min(100, Math.round(criticality * .55 + Math.min(30, switchingDays / 3) + (alternatives === 0 ? 25 : alternatives === 1 ? 12 : 0))));
  return { score, band: score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Watch" : "Low" };
}
