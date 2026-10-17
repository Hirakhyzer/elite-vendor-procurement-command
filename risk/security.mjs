export function securityPosture(vendor) {
  const checks = [vendor.mfa, vendor.encryption, vendor.backups, vendor.incidentPlan, vendor.securityReview].map(Boolean);
  const score = Math.round(checks.filter(Boolean).length / checks.length * 100);
  return { score, missingControls: ["mfa", "encryption", "backups", "incidentPlan", "securityReview"].filter((key) => !vendor[key]), band: score >= 80 ? "Strong" : score >= 60 ? "Watch" : "High risk" };
}
