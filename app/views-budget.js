// Budget view: the monthly plan, category by category. Planned amounts
// are editable in place — changing one updates the dashboard, the charts
// and the "every dollar has a job" check straight away.

import { money, percent } from './format.js';
import { plannedVsActualBars } from './charts.js';
import { state, totalPlanned, totalActual } from './store.js';

const PAY = 4850;

function statusChip(category, usedPct) {
  if (category.actual > category.planned) {
    return `<span class="chip red">Over by ${money(category.actual - category.planned)}</span>`;
  }
  if (usedPct >= 90) return `<span class="chip amber">Almost spent</span>`;
  return `<span class="chip">On track</span>`;
}

function categoryRow(category) {
  const remaining = category.planned - category.actual;
  const used = Math.min(100, Math.round((category.actual / category.planned) * 100));
  const barTone = category.actual > category.planned ? 'over' : used >= 90 ? 'warn' : '';
  const remainingTone = remaining < 0 ? 'neg' : 'pos';
  const remainingSign = remaining < 0 ? '−' : '';
  return `<tr>
      <td><span class="dot" style="background:${category.color}"></span>${category.name}</td>
      <td class="num"><label class="visually-hidden" for="plan-${category.id}">Planned amount for ${category.name}</label><input id="plan-${category.id}" type="number" min="0" step="5" value="${category.planned}" data-plan="${category.id}" style="width:92px;text-align:right" aria-label="Planned amount for ${category.name}"></td>
      <td class="num money">${money(category.actual)}</td>
      <td class="num money ${remainingTone}">${remainingSign}${money(Math.abs(remaining))}</td>
      <td style="min-width:130px"><div class="bar ${barTone}"><span style="width:${used}%"></span></div><div class="bar-note"><span>${used}% used</span></div></td>
      <td>${statusChip(category, used)}</td>
    </tr>`;
}

function summaryStat(label, value, tone, hint) {
  const toneClass = tone ? ` ${tone}` : '';
  const hintHtml = hint ? `<div class="hint">${hint}</div>` : '';
  return `<div class="stat"><div class="label">${label}</div><div class="value${toneClass}">${value}</div>${hintHtml}</div>`;
}

export function budgetView() {
  const planned = totalPlanned();
  const actual = totalActual();
  const unassigned = PAY - planned;
  const leftAfterSpending = PAY - actual;

  const unassignedHint = unassigned === 0
    ? 'every dollar has a job ✓'
    : unassigned > 0
      ? 'give this money a job'
      : 'planned more than the pay — trim a category';

  const chartRows = state.categories.map((category) => ({
    label: category.name.replace(' (rent)', ''),
    planned: category.planned,
    actual: category.actual,
    over: category.actual > category.planned,
  }));

  return `
  <div class="page-head">
    <h1>The November budget</h1>
    <p>Every dollar of the ${money(PAY)} coming in has a job. Edit any planned amount — the totals below, the chart and the dashboard update immediately, and your changes are saved in this browser.</p>
  </div>

  <div class="card">
    <div class="stat-row">
      ${summaryStat('Money in', money(PAY), 'pos', '')}
      ${summaryStat('Planned out', money(planned), '', '')}
      ${summaryStat('Actually spent', money(actual), '', '')}
      ${summaryStat('Unassigned', money(unassigned), unassigned === 0 ? 'pos' : 'neg', unassignedHint)}
    </div>
  </div>

  <section class="card">
    <h2>Planned vs actual, by category</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Actual</th><th class="num">Left</th><th>Used</th><th>Status</th></tr></thead>
        <tbody>${state.categories.map(categoryRow).join('')}</tbody>
        <tfoot><tr><td><strong>Total</strong></td><td class="num"><strong class="money">${money(planned)}</strong></td><td class="num"><strong class="money">${money(actual)}</strong></td><td class="num"><strong class="money ${leftAfterSpending >= 0 ? 'pos' : 'neg'}">${money(leftAfterSpending)}</strong></td><td colspan="2"><span class="hint">${percent(actual, planned)} of the plan spent</span></td></tr></tfoot>
      </table>
    </div>
    <p class="hint">Tip: when a category goes over, move money from one that is under — do not just raise the plan. Dining out is $34 over this month; Fun money is $14 under.</p>
  </section>

  <section class="card">
    <h2>Planned vs actual, as a chart</h2>
    ${plannedVsActualBars(chartRows)}
  </section>

  <div class="callout">
    <strong>How the Ellises built this plan:</strong> fixed costs first (rent, bills, debt), then savings, then the flexible categories. Groceries get $620 because that is what four people actually eat in a month here — the plan is built from real spending, not from a wish.
  </div>`;
}
