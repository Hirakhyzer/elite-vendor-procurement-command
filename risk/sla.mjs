export function slaPerformance(records) {
  if (!records.length) return { compliance: 100, breaches: 0, score: 100 };
  const breaches = records.filter((record) => !record.met).length;
  const compliance = (records.length - breaches) / records.length * 100;
  const severityPenalty = records.filter((record) => !record.met).reduce((sum, record) => sum + Number(record.severity || 1) * 3, 0);
  return { compliance, breaches, score: Math.max(0, Math.round(compliance - severityPenalty)) };
}
