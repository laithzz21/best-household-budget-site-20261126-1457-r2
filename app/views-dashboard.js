// Dashboard: the month at a glance — income, spending, what is left,
// where the money went, the six-month trend, bills due, latest spending
// and the savings goals.

import { HOUSEHOLD, MONTHS, BILLS } from './data.js';
import { money, percent } from './format.js';
import { donutChart, monthlyTrendBars } from './charts.js';
import { state, totalActual, categoryName } from './store.js';

const PAY = 4850;

function byActualDesc(a, b) {
  return b.actual - a.actual;
}

function legendRow(category) {
  return `<li><span class="left"><span class="dot" style="background:${category.color}"></span>${category.name}</span><strong class="money">${money(category.actual)}</strong></li>`;
}

function billRow(bill) {
  const how = bill.autopay ? ' · autopay on' : ' · pay by hand';
  return `<li><span>${bill.name}<br><span class="sub">due ${bill.due}${how}</span></span><strong class="money">${money(bill.amount, true)}</strong></li>`;
}

function recentRow(tx) {
  const sign = tx.amount < 0 ? '−' : '+';
  const tone = tx.amount < 0 ? 'neg' : 'pos';
  return `<li><span>${tx.desc}<br><span class="sub">${tx.date.slice(5)} · ${categoryName(tx.category)}</span></span><strong class="money ${tone}">${sign}${money(Math.abs(tx.amount), true)}</strong></li>`;
}

function statCell(label, value, tone, hint) {
  const toneClass = tone ? ` ${tone}` : '';
  return `<div class="stat"><div class="label">${label}</div><div class="value${toneClass}">${value}</div><div class="hint">${hint}</div></div>`;
}

function goalGlance(goal) {
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  return `<p><strong>${goal.name}</strong> — ${money(goal.saved)} of ${money(goal.target)} (${percent(goal.saved, goal.target)})</p>
        <div class="bar"><span style="width:${pct}%"></span></div>`;
}

export function dashboardView() {
  const spent = totalActual();
  const left = PAY - spent;
  const savings = state.categories.find((category) => category.id === 'savings');
  const savedThisMonth = savings ? savings.actual : 0;
  const savingsRate = percent(savedThisMonth, PAY);
  const over = state.categories.filter((category) => category.actual > category.planned);
  const slices = state.categories.map((category) => ({ label: category.name, value: category.actual, color: category.color }));
  const recent = state.transactions.slice(0, 5);
  const ranked = [...state.categories].sort(byActualDesc);
  const topEight = ranked.slice(0, 8);
  const restTotal = ranked.slice(8).reduce((sum, category) => sum + category.actual, 0);
  const topGoals = [...state.goals]
    .sort((a, b) => b.saved / b.target - a.saved / a.target)
    .slice(0, 2);
  const billsTotal = BILLS.reduce((sum, bill) => sum + bill.amount, 0);

  const leftNote = left >= 0
    ? `${money(left)} still unspent`
    : `${money(Math.abs(left))} over plan`;

  const overNote = over.length
    ? `<div class="callout amber"><strong>Heads up:</strong> ${over.map((category) => `${category.name} is ${money(category.actual - category.planned)} over its ${money(category.planned)} plan`).join('; ')}. Move money from another category on the <a href="#/budget">Budget</a> page instead of pretending it did not happen.</div>`
    : `<div class="callout"><strong>On track:</strong> every category is inside its plan so far this month.</div>`;

  return `
  <div class="page-head">
    <h1>${HOUSEHOLD.month} — ${HOUSEHOLD.name}</h1>
    <p>${HOUSEHOLD.members}. Take-home pay is ${money(PAY)} a month, and every dollar of it has a job. Here is where November stands, with ${leftNote}.</p>
  </div>

  <div class="card">
    <div class="stat-row">
      ${statCell('Money in', money(PAY), 'pos', 'take-home pay, November')}
      ${statCell('Money out', money(spent), '', 'planned spending + savings')}
      ${statCell('Left to spend', money(left), left >= 0 ? 'pos' : 'neg', "unspent from November's pay")}
      ${statCell('Savings rate', savingsRate, '', `${money(savedThisMonth)} saved this month`)}
    </div>
    ${overNote}
  </div>

  <div class="grid grid-2-1">
    <section class="card">
      <h2>Where November's money went</h2>
      <div class="donut-wrap">
        ${donutChart(slices)}
        <ul class="legend">
          ${topEight.map(legendRow).join('')}
          <li><span class="left"><span class="dot" style="background:#d8d0bd"></span>Everything else</span><strong class="money">${money(restTotal)}</strong></li>
        </ul>
      </div>
      <p class="hint">Savings and the debt payment are counted too: they are money going out with a purpose. See the full breakdown on the <a href="#/budget">Budget</a> page.</p>
    </section>

    <section class="card">
      <h2>Bills coming up</h2>
      <ul class="clean-list">
        ${BILLS.map(billRow).join('')}
      </ul>
      <p class="hint">Total due before 18 December: <strong class="money">${money(billsTotal, true)}</strong>.</p>
    </section>
  </div>

  <div class="grid grid-2">
    <section class="card">
      <h2>Six months: money in vs money out</h2>
      ${monthlyTrendBars(MONTHS)}
      <p class="hint">November is the fifth month in a row the family spent less than it earned. August was the tight one — a $4,780 month against $4,850 coming in.</p>
    </section>

    <section class="card">
      <h2>Latest spending</h2>
      <ul class="clean-list">
        ${recent.map(recentRow).join('')}
      </ul>
      <p><a href="#/transactions">See all ${state.transactions.length} transactions →</a></p>
      <h2 style="margin-top:18px">Savings goals, at a glance</h2>
      ${topGoals.map(goalGlance).join('')}
      <p><a href="#/goals">All goals and adding money →</a></p>
    </section>
  </div>`;
}
