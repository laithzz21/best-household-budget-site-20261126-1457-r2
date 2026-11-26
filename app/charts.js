// Charts, drawn as plain inline SVG — no library, no images, no network.
// Each builder takes plain data and returns an SVG string the views drop
// into the page.

import { money } from './format.js';

const INK = '#1e2b23';
const MUTED = '#5d6b60';
const SLICE_EDGE = '#faf6ee';
const PLANNED_FILL = '#c9d8cb';
const ACTUAL_FILL = '#1d5c43';
const OVER_FILL = '#a63a2a';

// A point on a circle of `radius` around (`cx`, `cy`) at `angle` radians.
function circlePoint(cx, cy, radius, angle) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

// Donut: one slice per category, sized by what the household actually spent.
// The centre shows the total. Slices are drawn as pie wedges from the centre.
export function donutChart(slices, size = 190) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 80;
  const centre = size / 2;
  const holeRadius = 46;
  const startAngle = -Math.PI / 2;

  let cursor = startAngle;
  const wedgePaths = slices.map((slice) => {
    const share = total ? slice.value / total : 0;
    const sweep = share * Math.PI * 2;
    const [x1, y1] = circlePoint(centre, centre, radius, cursor);
    cursor += sweep;
    const [x2, y2] = circlePoint(centre, centre, radius, cursor);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const path = `M ${centre} ${centre} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
    return `<path d="${path}" fill="${slice.color}" stroke="${SLICE_EDGE}" stroke-width="1.5"><title>${slice.label}: ${money(slice.value)}</title></path>`;
  });

  const hole = `<circle cx="${centre}" cy="${centre}" r="${holeRadius}" fill="#ffffff"/>`;
  const centreLabel = `<text x="${centre}" y="${centre - 2}" text-anchor="middle" font-size="15" font-weight="bold" fill="${INK}">${money(total)}</text>`
    + `<text x="${centre}" y="${centre + 15}" text-anchor="middle" font-size="10" fill="${MUTED}">budgeted in Nov</text>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Donut chart of November spending by category">${wedgePaths.join('')}${hole}${centreLabel}</svg>`;
}

// Grouped bars: planned vs actual for each category, as horizontal bars.
export function plannedVsActualBars(rows, width = 640) {
  const tallest = Math.max(1, ...rows.map((row) => Math.max(row.planned, row.actual)));
  const barHeight = 9;
  const rowHeight = 34;
  const labelWidth = 150;
  const rightMargin = 90;
  const height = rows.length * rowHeight + 8;
  const toWidth = (value) => (value / tallest) * (width - labelWidth - rightMargin);

  const body = rows.map((row, index) => {
    const y = 8 + index * rowHeight;
    const plannedWidth = Math.max(toWidth(row.planned), 2).toFixed(1);
    const actualWidth = Math.max(toWidth(row.actual), 2).toFixed(1);
    const actualFill = row.over ? OVER_FILL : ACTUAL_FILL;
    return `<text x="0" y="${y + 12}" font-size="12" fill="${INK}">${row.label}</text>`
      + `<rect x="${labelWidth}" y="${y}" width="${plannedWidth}" height="${barHeight}" rx="4" fill="${PLANNED_FILL}"><title>Planned ${money(row.planned)}</title></rect>`
      + `<rect x="${labelWidth}" y="${y + 12}" width="${actualWidth}" height="${barHeight}" rx="4" fill="${actualFill}"><title>Actual ${money(row.actual)}</title></rect>`
      + `<text x="${width - 82}" y="${y + 12}" font-size="11" fill="${MUTED}" text-anchor="end">${money(row.actual)} / ${money(row.planned)}</text>`;
  }).join('');

  const legend = `<text x="${labelWidth}" y="${height - 2}" font-size="11" fill="${MUTED}">${BARS_LEGEND}</text>`;
  return `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Planned versus actual spending per category">${body}${legend}</svg>`;
}

const TREND_LEGEND = 'light = money in, dark = money out';
const BARS_LEGEND = 'light bar = planned, dark bar = actual (red = over budget)';

// Six-month trend: income as a light bar, spending as a dark bar, per month.
export function monthlyTrendBars(months, width = 640) {
  const tallest = Math.max(1, ...months.map((month) => Math.max(month.income, month.spent)));
  const height = 210;
  const baseline = 180;
  const chartTop = 30;
  const slot = width / months.length;
  const barWidth = 26;
  const toHeight = (value) => (value / tallest) * (baseline - chartTop);

  const body = months.map((month, index) => {
    const centreX = index * slot + slot / 2;
    const incomeHeight = toHeight(month.income);
    const spentHeight = toHeight(month.spent);
    return `<rect x="${(centreX - barWidth - 3).toFixed(1)}" y="${(baseline - incomeHeight).toFixed(1)}" width="${barWidth}" height="${incomeHeight.toFixed(1)}" rx="3" fill="${PLANNED_FILL}"><title>${month.month}: income ${money(month.income)}</title></rect>`
      + `<rect x="${(centreX + 3).toFixed(1)}" y="${(baseline - spentHeight).toFixed(1)}" width="${barWidth}" height="${spentHeight.toFixed(1)}" rx="3" fill="${ACTUAL_FILL}"><title>${month.month}: spent ${money(month.spent)}</title></rect>`
      + `<text x="${centreX.toFixed(1)}" y="${baseline + 18}" font-size="12" text-anchor="middle" fill="${INK}">${month.month}</text>`
      + `<text x="${centreX.toFixed(1)}" y="${(baseline - spentHeight - 6).toFixed(1)}" font-size="11" text-anchor="middle" fill="${MUTED}">${money(month.spent)}</text>`;
  }).join('');

  const legend = `<text x="0" y="14" font-size="11" fill="${MUTED}">${TREND_LEGEND}</text>`;
  return `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Income and spending for the last six months">${legend}${body}</svg>`;
}
