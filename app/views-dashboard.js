// The dashboard: the month at a glance. Income, spending, what is left,
// where the money went, the six-month trend, bills coming up, the latest
// spending and the savings goals — everything on one page.

import {
  HOUSEHOLD,
  MONTHS,
  BILLS,
} from "./data.js";
import {
  money,
  percent,
} from "./format.js";
import {
  donutChart,
  monthlyTrendBars,
} from "./charts.js";
import {
  state,
  totalActual,
  categoryName,
} from "./store.js";

const PAY = 4850;

function sortBySpentDesc(first, second) {
  return second.actual - first.actual;
}

function legendEntry(category) {
  const dot =
    '<span class="dot" style="background:' + category.color + '"></span>';
  return (
    "<li><span class=\"left\">" +
    dot +
    category.name +
    '</span><strong class="money">' +
    money(category.actual) +
    "</strong></li>"
  );
}

function billEntry(bill) {
  const method = bill.autopay ? " · autopay on" : " · pay by hand";
  return (
    "<li><span>" +
    bill.name +
    '<br><span class="sub">due ' +
    bill.due +
    method +
    '</span></span><strong class="money">' +
    money(bill.amount, true) +
    "</strong></li>"
  );
}

function spendingEntry(tx) {
  const outgoing = tx.amount < 0;
  const mark = outgoing ? "−" : "+";
  const tone = outgoing ? "neg" : "pos";
  const when =
    tx.date.slice(5) + " · " + categoryName(tx.category);
  return (
    "<li><span>" +
    tx.desc +
    '<br><span class="sub">' +
    when +
    '</span></span><strong class="money ' +
    tone +
    '">' +
    mark +
    money(Math.abs(tx.amount), true) +
    "</strong></li>"
  );
}

function statBlock(label, value, tone, hint) {
  const toneClass = tone ? " " + tone : "";
  return (
    '<div class="stat"><div class="label">' +
    label +
    '</div><div class="value' +
    toneClass +
    '">' +
    value +
    '</div><div class="hint">' +
    hint +
    "</div></div>"
  );
}

function goalSnapshot(goal) {
  const done = Math.min(
    100,
    Math.round((goal.saved / goal.target) * 100)
  );
  return (
    "<p><strong>" +
    goal.name +
    "</strong> — " +
    money(goal.saved) +
    " of " +
    money(goal.target) +
    " (" +
    percent(goal.saved, goal.target) +
    ')</p>\n        <div class="bar"><span style="width:' +
    done +
    '%"></span></div>'
  );
}

export function dashboardView() {
  const spent = totalActual();
  const left = PAY - spent;
  const savingsBucket = state.categories.find(
    (category) => category.id === "savings"
  );
  const savedThisMonth = savingsBucket ? savingsBucket.actual : 0;
  const rate = percent(savedThisMonth, PAY);
  const overPlan = state.categories.filter(
    (category) => category.actual > category.planned
  );
  const slices = [];
  for (const category of state.categories) {
    slices.push({
      label: category.name,
      value: category.actual,
      color: category.color,
    });
  }
  const recent = state.transactions.slice(0, 5);
  const ranked = [...state.categories].sort(sortBySpentDesc);
  const topEight = ranked.slice(0, 8);
  let restTotal = 0;
  for (const category of ranked.slice(8)) restTotal += category.actual;
  const topGoals = [...state.goals]
    .sort((a, b) => b.saved / b.target - a.saved / a.target)
    .slice(0, 2);
  let billsTotal = 0;
  for (const bill of BILLS) billsTotal += bill.amount;

  const leftNote =
    left >= 0
      ? money(left) + " still unspent"
      : money(Math.abs(left)) + " over plan";

  let overNote;
  if (overPlan.length) {
    const parts = overPlan.map(
      (category) =>
        category.name +
        " is " +
        money(category.actual - category.planned) +
        " over its " +
        money(category.planned) +
        " plan"
    );
    overNote =
      '<div class="callout amber"><strong>Heads up:</strong> ' +
      parts.join("; ") +
      '. Move money from another category on the <a href="#/budget">Budget</a> page instead of pretending it did not happen.</div>';
  } else {
    overNote =
      '<div class="callout"><strong>On track:</strong> every category is inside its plan so far this month.</div>';
  }

  const head =
    '<div class="page-head">\n    <h1>' +
    HOUSEHOLD.month +
    " — " +
    HOUSEHOLD.name +
    "</h1>\n    <p>" +
    HOUSEHOLD.members +
    ". Take-home pay is " +
    money(PAY) +
    " a month, and every dollar of it has a job. Here is where November stands, with " +
    leftNote +
    ".</p>\n  </div>";

  const stats =
    '<div class="card">\n    <div class="stat-row">\n      ' +
    statBlock("Money in", money(PAY), "pos", "take-home pay, November") +
    "\n      " +
    statBlock("Money out", money(spent), "", "planned spending + savings") +
    "\n      " +
    statBlock(
      "Left to spend",
      money(left),
      left >= 0 ? "pos" : "neg",
      "unspent from November's pay"
    ) +
    "\n      " +
    statBlock(
      "Savings rate",
      rate,
      "",
      money(savedThisMonth) + " saved this month"
    ) +
    "\n    </div>\n    " +
    overNote +
    "\n  </div>";

  const donutLegend = topEight.map(legendEntry).join("") +
    '<li><span class="left"><span class="dot" style="background:#d8d0bd"></span>Everything else</span><strong class="money">' +
    money(restTotal) +
    "</strong></li>";

  const spendingCard =
    '<div class="grid grid-2-1">\n    <section class="card">\n      <h2>Where November\'s money went</h2>\n      <div class="donut-wrap">\n        ' +
    donutChart(slices) +
    '\n        <ul class="legend">\n          ' +
    donutLegend +
    '\n        </ul>\n      </div>\n      <p class="hint">Savings and the debt payment are counted too: they are money going out with a purpose. See the full breakdown on the <a href="#/budget">Budget</a> page.</p>\n    </section>\n\n    <section class="card">\n      <h2>Bills coming up</h2>\n      <ul class="clean-list">\n        ' +
    BILLS.map(billEntry).join("") +
    '\n      </ul>\n      <p class="hint">Total due before 18 December: <strong class="money">' +
    money(billsTotal, true) +
    "</strong>.</p>\n    </section>\n  </div>";

  const trendAndLatest =
    '<div class="grid grid-2">\n    <section class="card">\n      <h2>Six months: money in vs money out</h2>\n      ' +
    monthlyTrendBars(MONTHS) +
    '\n      <p class="hint">November is the fifth month in a row the family spent less than it earned. August was the tight one — a $4,780 month against $4,850 coming in.</p>\n    </section>\n\n    <section class="card">\n      <h2>Latest spending</h2>\n      <ul class="clean-list">\n        ' +
    recent.map(spendingEntry).join("") +
    '\n      </ul>\n      <p><a href="#/transactions">See all ' +
    state.transactions.length +
    " transactions →</a></p>\n" +
    '      <h2 style="margin-top:18px">Savings goals, at a glance</h2>\n      ' +
    topGoals.map(goalSnapshot).join("") +
    '\n      <p><a href="#/goals">All goals and adding money →</a></p>\n    </section>\n  </div>';

  return "\n  " + head + "\n\n  " + stats + "\n\n  " + spendingCard + "\n\n  " + trendAndLatest;
}
