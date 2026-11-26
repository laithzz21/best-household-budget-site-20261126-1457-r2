// Charts drawn as plain inline SVG — no library, no images, nothing to
// fetch. Each function takes plain data and hands back an SVG string that a
// view drops straight into the page.

import { money } from "./format.js";

const TEXT_DARK = "#1e2b23";
const TEXT_FADED = "#5d6b60";
const WEDGE_EDGE = "#faf6ee";
const LIGHT_BAR = "#c9d8cb";
const DARK_BAR = "#1d5c43";
const OVERSPEND = "#a63a2a";

function polarPoint(cx, cy, radius, angle) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function wedgePath(centre, radius, fromAngle, toAngle) {
  const start = polarPoint(centre, centre, radius, fromAngle);
  const end = polarPoint(centre, centre, radius, toAngle);
  const wide = toAngle - fromAngle > Math.PI ? 1 : 0;
  return (
    "M " +
    centre +
    " " +
    centre +
    " L " +
    start.x.toFixed(1) +
    " " +
    start.y.toFixed(1) +
    " A " +
    radius +
    " " +
    radius +
    " 0 " +
    wide +
    " 1 " +
    end.x.toFixed(1) +
    " " +
    end.y.toFixed(1) +
    " Z"
  );
}

// Donut: a slice per category, sized by what the household actually spent,
// with the total in the middle. Slices start at the top and run clockwise.
export function donutChart(slices, size = 190) {
  let total = 0;
  for (const slice of slices) total += slice.value;
  const radius = 80;
  const centre = size / 2;
  const holeRadius = 46;

  let cursor = -Math.PI / 2;
  const wedges = [];
  for (const slice of slices) {
    const share = total ? slice.value / total : 0;
    const sweep = share * Math.PI * 2;
    const path = wedgePath(centre, radius, cursor, cursor + sweep);
    cursor += sweep;
    wedges.push(
      '<path d="' +
        path +
        '" fill="' +
        slice.color +
        '" stroke="' +
        WEDGE_EDGE +
        '" stroke-width="1.5"><title>' +
        slice.label +
        ": " +
        money(slice.value) +
        "</title></path>"
    );
  }

  const hole =
    '<circle cx="' +
    centre +
    '" cy="' +
    centre +
    '" r="' +
    holeRadius +
    '" fill="#ffffff"/>';
  const centreText =
    '<text x="' +
    centre +
    '" y="' +
    (centre - 2) +
    '" text-anchor="middle" font-size="15" font-weight="bold" fill="' +
    TEXT_DARK +
    '">' +
    money(total) +
    "</text>" +
    '<text x="' +
    centre +
    '" y="' +
    (centre + 15) +
    '" text-anchor="middle" font-size="10" fill="' +
    TEXT_FADED +
    '">budgeted in Nov</text>';

  return (
    '<svg width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 ' +
    size +
    " " +
    size +
    '" role="img" aria-label="Donut chart of November spending by category">' +
    wedges.join("") +
    hole +
    centreText +
    "</svg>"
  );
}

// Horizontal paired bars: the pale bar is the plan, the dark bar is what
// was really spent. A red dark bar means the category went over.
export function plannedVsActualBars(rows, width = 640) {
  let tallest = 1;
  for (const row of rows) {
    tallest = Math.max(tallest, row.planned, row.actual);
  }
  const barHeight = 9;
  const rowHeight = 34;
  const labelWidth = 150;
  const rightMargin = 90;
  const height = rows.length * rowHeight + 8;
  const scale = (value) =>
    (value / tallest) * (width - labelWidth - rightMargin);

  const parts = [];
  rows.forEach((row, index) => {
    const y = 8 + index * rowHeight;
    const plannedWidth = Math.max(scale(row.planned), 2).toFixed(1);
    const actualWidth = Math.max(scale(row.actual), 2).toFixed(1);
    const fill = row.over ? OVERSPEND : DARK_BAR;
    parts.push(
      '<text x="0" y="' +
        (y + 12) +
        '" font-size="12" fill="' +
        TEXT_DARK +
        '">' +
        row.label +
        "</text>" +
        '<rect x="' +
        labelWidth +
        '" y="' +
        y +
        '" width="' +
        plannedWidth +
        '" height="' +
        barHeight +
        '" rx="4" fill="' +
        LIGHT_BAR +
        '"><title>Planned ' +
        money(row.planned) +
        "</title></rect>" +
        '<rect x="' +
        labelWidth +
        '" y="' +
        (y + 12) +
        '" width="' +
        actualWidth +
        '" height="' +
        barHeight +
        '" rx="4" fill="' +
        fill +
        '"><title>Actual ' +
        money(row.actual) +
        "</title></rect>" +
        '<text x="' +
        (width - 82) +
        '" y="' +
        (y + 12) +
        '" font-size="11" fill="' +
        TEXT_FADED +
        '" text-anchor="end">' +
        money(row.actual) +
        " / " +
        money(row.planned) +
        "</text>"
    );
  });

  const key =
    '<text x="' +
    labelWidth +
    '" y="' +
    (height - 2) +
    '" font-size="11" fill="' +
    TEXT_FADED +
    '">light bar = planned, dark bar = actual (red = over budget)</text>';

  return (
    '<svg width="100%" height="' +
    height +
    '" viewBox="0 0 ' +
    width +
    " " +
    height +
    '" role="img" aria-label="Planned versus actual spending per category">' +
    parts.join("") +
    key +
    "</svg>"
  );
}

// Six-month trend: a pale bar for money in and a dark bar for money out,
// one pair per month, with the month's spending written above its bar.
export function monthlyTrendBars(months, width = 640) {
  let tallest = 1;
  for (const month of months) {
    tallest = Math.max(tallest, month.income, month.spent);
  }
  const height = 210;
  const baseline = 180;
  const top = 30;
  const slot = width / months.length;
  const barWidth = 26;
  const toHeight = (value) => (value / tallest) * (baseline - top);

  const parts = [];
  months.forEach((month, index) => {
    const middle = index * slot + slot / 2;
    const inHeight = toHeight(month.income);
    const outHeight = toHeight(month.spent);
    parts.push(
      '<rect x="' +
        (middle - barWidth - 3).toFixed(1) +
        '" y="' +
        (baseline - inHeight).toFixed(1) +
        '" width="' +
        barWidth +
        '" height="' +
        inHeight.toFixed(1) +
        '" rx="3" fill="' +
        LIGHT_BAR +
        '"><title>' +
        month.month +
        ": income " +
        money(month.income) +
        "</title></rect>" +
        '<rect x="' +
        (middle + 3).toFixed(1) +
        '" y="' +
        (baseline - outHeight).toFixed(1) +
        '" width="' +
        barWidth +
        '" height="' +
        outHeight.toFixed(1) +
        '" rx="3" fill="' +
        DARK_BAR +
        '"><title>' +
        month.month +
        ": spent " +
        money(month.spent) +
        "</title></rect>" +
        '<text x="' +
        middle.toFixed(1) +
        '" y="' +
        (baseline + 18) +
        '" font-size="12" text-anchor="middle" fill="' +
        TEXT_DARK +
        '">' +
        month.month +
        "</text>" +
        '<text x="' +
        middle.toFixed(1) +
        '" y="' +
        (baseline - outHeight - 6).toFixed(1) +
        '" font-size="11" text-anchor="middle" fill="' +
        TEXT_FADED +
        '">' +
        money(month.spent) +
        "</text>"
    );
  });

  const key =
    '<text x="0" y="14" font-size="11" fill="' +
    TEXT_FADED +
    '">light = money in, dark = money out</text>';

  return (
    '<svg width="100%" height="' +
    height +
    '" viewBox="0 0 ' +
    width +
    " " +
    height +
    '" role="img" aria-label="Income and spending for the last six months">' +
    key +
    parts.join("") +
    "</svg>"
  );
}
