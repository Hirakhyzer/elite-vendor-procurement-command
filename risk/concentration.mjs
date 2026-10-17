export function vendorConcentration(contracts) {
  const spend = contracts.reduce((acc, item) => { acc[item.vendorId] = (acc[item.vendorId] || 0) + Number(item.amount || 0); return acc; }, {});
  const total = Object.values(spend).reduce((sum, value) => sum + value, 0);
  const rows = Object.entries(spend).map(([vendorId, amount]) => ({ vendorId, amount, share: total ? amount / total * 100 : 0 })).sort((a, b) => b.amount - a.amount);
  const hhi = total ? rows.reduce((sum, row) => sum + (row.share / 100) ** 2, 0) : 0;
  return { total, rows, topVendorShare: rows[0]?.share || 0, hhi, concentrated: hhi >= .25 };
}
