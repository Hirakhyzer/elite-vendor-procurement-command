export function exitReadiness(vendor) {
  const controls = { dataExport: vendor.dataExport, documentedMigration: vendor.documentedMigration, alternativeVendor: vendor.alternativeVendor, contractExitClause: vendor.contractExitClause, credentialsOwned: vendor.credentialsOwned };
  const ready = Object.values(controls).filter(Boolean).length;
  const score = Math.round(ready / Object.keys(controls).length * 100);
  return { score, ready: score === 100, gaps: Object.entries(controls).filter(([, value]) => !value).map(([key]) => key) };
}
