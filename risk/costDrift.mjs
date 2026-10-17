export function costDrift(history) {
  if (history.length < 2) return { change: 0, percent: 0, alert: false };
  const first = Number(history[0].cost || 0);
  const last = Number(history.at(-1).cost || 0);
  const change = last - first;
  const percent = first ? change / first * 100 : 0;
  return { change, percent, alert: percent >= 10, direction: percent > 2 ? "Rising" : percent < -2 ? "Falling" : "Stable" };
}
