export function complianceExpiry(items, today = new Date().toISOString().slice(0, 10)) {
  return items.map((item) => {
    const days = Math.ceil((new Date(`${item.expires}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000);
    return { ...item, days, status: days < 0 ? "Expired" : days <= 30 ? "Urgent" : days <= 90 ? "Upcoming" : "Current" };
  }).sort((a, b) => a.days - b.days);
}
