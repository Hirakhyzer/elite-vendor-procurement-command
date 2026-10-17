export function renewalUrgency(contract, today = new Date().toISOString().slice(0, 10)) {
  const days = Math.ceil((new Date(`${contract.endDate}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000);
  const criticality = Number(contract.criticality || 0);
  const score = Math.max(0, Math.min(100, Math.round((90 - days) * .8 + criticality * .35)));
  return { days, score, band: score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Watch" : "Low" };
}
