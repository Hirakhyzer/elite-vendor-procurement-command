export function procurementRiskSummary(vendors) {
  if (!vendors.length) return { averageRisk: 0, highRisk: 0, critical: [] };
  const risks = vendors.map((vendor) => Number(vendor.riskScore || 0));
  const averageRisk = risks.reduce((sum, value) => sum + value, 0) / risks.length;
  const critical = vendors.filter((vendor) => Number(vendor.riskScore || 0) >= 75).map((vendor) => vendor.id);
  return { averageRisk, highRisk: vendors.filter((vendor) => Number(vendor.riskScore || 0) >= 60).length, critical };
}
