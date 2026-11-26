// Tools and guide views: three calculators that answer real household
// questions, the subscription audit with working cancel/restore buttons,
// and the plain-English budgeting guide.

import { GUIDE } from './data.js';
import { money, escapeHtml } from './format.js';
import { subscriptionsSummary } from './views-lists.js';
import { state } from './store.js';

function subscriptionRow(sub) {
  const cancelled = state.cancelledSubscriptions.includes(sub.name);
  const action = cancelled
    ? `<span><span class="chip red">Cancelled</span> <button type="button" class="small secondary" data-restore-sub="${escapeHtml(sub.name)}">Restore</button></span>`
    : `<button type="button" class="small danger" data-cancel-sub="${escapeHtml(sub.name)}">Cancel</button>`;
  return `<li><span><strong>${escapeHtml(sub.name)}</strong> — <span class="money">${money(sub.amount, true)}</span>/month<br><span class="sub">${escapeHtml(sub.used)}</span></span>
          ${action}</li>`;
}

function guideArticle(article) {
  return `<article class="card guide-block" id="${article.id}">
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.body)}</p>
    </article>`;
}

function splitCell(label, id, amount) {
  return `<div class="cell"><div class="label">${label}</div><div class="amount money" id="${id}">${amount}</div></div>`;
}

export function toolsView() {
  const audit = subscriptionsSummary();
  const yearly = audit.monthly * 12;
  const savedYearly = audit.savedMonthly * 12;
  const savingsLine = audit.savedMonthly > 0
    ? `<p class="pos">Cancelled so far saves <strong class="money">${money(audit.savedMonthly, true)}</strong>/month — <strong class="money">${money(savedYearly, true)}</strong> a year.</p>`
    : '<p class="hint">Nothing cancelled yet. The fitness app ($8.99) has not been opened since September.</p>';

  return `
  <div class="page-head">
    <h1>Tools</h1>
    <p>Three calculators and one audit that answer the questions a household actually asks: how should the pay be split, how big a safety net do we need, can we afford this, and what are the subscriptions really costing?</p>
  </div>

  <div class="grid grid-2">
    <section class="card">
      <h2>50 / 30 / 20 split</h2>
      <p class="hint">Type your monthly take-home pay. The rule says: 50% needs, 30% wants, 20% savings and debt.</p>
      <form id="split-form">
        <div class="field"><label for="split-pay">Monthly take-home pay ($)</label><input id="split-pay" type="number" min="0" step="1" value="4850" required></div>
        <button type="submit">Split it</button>
      </form>
      <div id="split-result" class="tool-grid" style="margin-top:14px">
        ${splitCell('Needs · 50%', 'split-needs', '$2,425')}
        ${splitCell('Wants · 30%', 'split-wants', '$1,455')}
        ${splitCell('Savings · 20%', 'split-savings', '$970')}
      </div>
      <p class="hint" id="split-note">On the Ellis pay of $4,850 that is $2,425 / $1,455 / $970. Their real split is about 58% needs, 19% wants, 23% savings — rent is high where they live, so wants run smaller.</p>
    </section>

    <section class="card">
      <h2>Emergency fund target</h2>
      <p class="hint">Add up one month of essentials — rent, food, bills, transport — and pick how many months of cover you want.</p>
      <form id="fund-form">
        <div class="row">
          <div class="field"><label for="fund-essentials">Monthly essentials ($)</label><input id="fund-essentials" type="number" min="0" step="1" value="2680" required></div>
          <div class="field"><label for="fund-months">Months of cover</label><select id="fund-months"><option value="1">1 month — starter</option><option value="3" selected>3 months — solid</option><option value="6">6 months — very safe</option></select></div>
        </div>
        <button type="submit">Work out my target</button>
      </form>
      <p class="tool-result" id="fund-result">Target: $8,040 — three months of essentials.</p>
      <p class="hint">The Ellis essentials are about $2,680 a month, so their three-month target is $8,040. Their fund holds $4,350 so far — the goal on the <a href="#/goals">Goals</a> page is the $6,000 milestone on the way there.</p>
    </section>
  </div>

  <div class="grid grid-2">
    <section class="card">
      <h2>Can we afford it?</h2>
      <p class="hint">A big purchase, spread over monthly payments. Type the price, how many months to pay it off, and what spare cash the month has.</p>
      <form id="afford-form">
        <div class="row">
          <div class="field"><label for="afford-price">Price ($)</label><input id="afford-price" type="number" min="0" step="1" value="650" required></div>
          <div class="field"><label for="afford-months">Pay it off over (months)</label><input id="afford-months" type="number" min="1" step="1" value="6" required></div>
          <div class="field"><label for="afford-spare">Spare cash each month ($)</label><input id="afford-spare" type="number" min="0" step="1" value="196" required></div>
        </div>
        <button type="submit">Check it</button>
      </form>
      <p class="tool-result" id="afford-result">Monthly payment: $108.33 — fits in $196 of spare cash.</p>
      <p class="hint" id="afford-note">That leaves $87.67 of spare cash a month. The example is the washing machine the family is saving for: paying over 6 months would cost $108.33 a month, which fits — but saving first costs nothing extra.</p>
    </section>

    <section class="card">
      <h2>Subscription audit</h2>
      <p class="hint">Every subscription, what it costs, and whether it is used. Cancel one and watch the yearly total fall.</p>
      <ul class="clean-list" id="sub-list">
        ${state.subscriptions.map(subscriptionRow).join('')}
      </ul>
      <p style="margin-top:12px">Paying now: <strong class="money">${money(audit.monthly, true)}</strong>/month — <strong class="money">${money(yearly, true)}</strong> a year.</p>
      ${savingsLine}
    </section>
  </div>`;
}

export function guideView() {
  return `
  <div class="page-head">
    <h1>The guide</h1>
    <p>Short, plain-English answers to the budgeting questions that come up in a real household — written around how the Ellis family actually runs its money, so you can copy what fits yours.</p>
  </div>

  <div class="callout"><strong>Start here, in one evening:</strong> 1) write down the pay that lands each month, 2) list the fixed bills, 3) give every remaining dollar a category on the <a href="#/budget">Budget</a> page, 4) set one savings goal on the <a href="#/goals">Goals</a> page. That is the whole system.</div>

  ${GUIDE.map(guideArticle).join('')}

  <section class="card">
    <h2>A weekly checklist</h2>
    <ol class="rule-list">
      <li><strong>Sunday, 15 minutes:</strong> open the <a href="#/transactions">Transactions</a> page and check the week’s spending against the plan.</li>
      <li><strong>Payday:</strong> move savings first, before anything else — the <a href="#/goals">Goals</a> page shows where it goes.</li>
      <li><strong>End of month:</strong> move money between categories that went over and under, then reset the plan for next month.</li>
      <li><strong>Every three months:</strong> run the <a href="#/tools">subscription audit</a> and cancel anything unused.</li>
    </ol>
  </section>`;
}
