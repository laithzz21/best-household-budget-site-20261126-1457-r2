// The budget page: the monthly plan, category by category. Planned
// amounts are editable in place — change one and the dashboard, the chart
// and the "every dollar has a job" check all move straight away.

import {
  money,
  percent,
} from "./format.js";
import { plannedVsActualBars } from "./charts.js";
import {
  state,
  totalPlanned,
  totalActual,
} from "./store.js";

const PAY = 4850;

function chipFor(category, usedPct) {
  if (category.actual > category.planned) {
    return (
      '<span class="chip red">Over by ' +
      money(category.actual - category.planned) +
      "</span>"
    );
  }
  if (usedPct >= 90) {
    return '<span class="chip amber">Almost spent</span>';
  }
  return '<span class="chip">On track</span>';
}

function planRow(category) {
  const remaining = category.planned - category.actual;
  const used = Math.min(
    100,
    Math.round((category.actual / category.planned) * 100)
  );
  let barTone = "";
  if (category.actual > category.planned) barTone = "over";
  else if (used >= 90) barTone = "warn";
  const remainingTone = remaining < 0 ? "neg" : "pos";
  const remainingMark = remaining < 0 ? "−" : "";
  const inputId = "plan-" + category.id;
  return (
    "<tr>\n      <td>" +
    '<span class="dot" style="background:' +
    category.color +
    '"></span>' +
    category.name +
    '</td>\n      <td class="num"><label class="visually-hidden" for="' +
    inputId +
    '">Planned amount for ' +
    category.name +
    '</label><input id="' +
    inputId +
    '" type="number" min="0" step="5" value="' +
    category.planned +
    '" data-plan="' +
    category.id +
    '" style="width:92px;text-align:right" aria-label="Planned amount for ' +
    category.name +
    '"></td>\n      <td class="num money">' +
    money(category.actual) +
    '</td>\n      <td class="num money ' +
    remainingTone +
    '">' +
    remainingMark +
    money(Math.abs(remaining)) +
    '</td>\n      <td style="min-width:130px"><div class="bar ' +
    barTone +
    '"><span style="width:' +
    used +
    '%"></span></div><div class="bar-note"><span>' +
    used +
    '% used</span></div></td>\n      <td>' +
    chipFor(category, used) +
    "</td>\n    </tr>"
  );
}

function summaryCell(label, value, tone, hint) {
  const toneClass = tone ? " " + tone : "";
  const hintHtml = hint ? '<div class="hint">' + hint + "</div>" : "";
  return (
    '<div class="stat"><div class="label">' +
    label +
    '</div><div class="value' +
    toneClass +
    '">' +
    value +
    "</div>" +
    hintHtml +
    "</div>"
  );
}

export function budgetView() {
  const planned = totalPlanned();
  const actual = totalActual();
  const unassigned = PAY - planned;
  const leftAfterSpending = PAY - actual;

  let unassignedHint;
  if (unassigned === 0) unassignedHint = "every dollar has a job ✓";
  else if (unassigned > 0) unassignedHint = "give this money a job";
  else unassignedHint = "planned more than the pay — trim a category";

  const chartRows = [];
  for (const category of state.categories) {
    chartRows.push({
      label: category.name.replace(" (rent)", ""),
      planned: category.planned,
      actual: category.actual,
      over: category.actual > category.planned,
    });
  }

  const head =
    '<div class="page-head">\n    <h1>The November budget</h1>\n    <p>Every dollar of the ' +
    money(PAY) +
    " coming in has a job. Edit any planned amount — the totals below, the chart and the dashboard update immediately, and your changes are saved in this browser.</p>\n  </div>";

  const totals =
    '<div class="card">\n    <div class="stat-row">\n      ' +
    summaryCell("Money in", money(PAY), "pos", "") +
    "\n      " +
    summaryCell("Planned out", money(planned), "", "") +
    "\n      " +
    summaryCell("Actually spent", money(actual), "", "") +
    "\n      " +
    summaryCell(
      "Unassigned",
      money(unassigned),
      unassigned === 0 ? "pos" : "neg",
      unassignedHint
    ) +
    "\n    </div>\n  </div>";

  const leftTone = leftAfterSpending >= 0 ? "pos" : "neg";
  const tableCard =
    '<section class="card">\n    <h2>Planned vs actual, by category</h2>\n    <div class="table-wrap">\n      <table>\n        <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Actual</th><th class="num">Left</th><th>Used</th><th>Status</th></tr></thead>\n        <tbody>' +
    state.categories.map(planRow).join("") +
    '</tbody>\n        <tfoot><tr><td><strong>Total</strong></td><td class="num"><strong class="money">' +
    money(planned) +
    '</strong></td><td class="num"><strong class="money">' +
    money(actual) +
    '</strong></td><td class="num"><strong class="money ' +
    leftTone +
    '">' +
    money(leftAfterSpending) +
    '</strong></td><td colspan="2"><span class="hint">' +
    percent(actual, planned) +
    ' of the plan spent</span></td></tr></tfoot>\n      </table>\n    </div>\n    <p class="hint">Tip: when a category goes over, move money from one that is under — do not just raise the plan. Dining out is $34 over this month; Fun money is $14 under.</p>\n  </section>';

  const chartCard =
    '<section class="card">\n    <h2>Planned vs actual, as a chart</h2>\n    ' +
    plannedVsActualBars(chartRows) +
    "\n  </section>";

  const closing =
    '<div class="callout">\n    <strong>How the Ellises built this plan:</strong> fixed costs first (rent, bills, debt), then savings, then the flexible categories. Groceries get $620 because that is what four people actually eat in a month here — the plan is built from real spending, not from a wish.\n  </div>';

  return "\n  " + head + "\n\n  " + totals + "\n\n  " + tableCard + "\n\n  " + chartCard + "\n\n  " + closing;
}
