// The tools and guide pages: three calculators that answer real household
// questions, the subscription audit with working cancel and restore
// buttons, and the plain-English budgeting guide.

import { GUIDE } from "./data.js";
import {
  money,
  escapeHtml,
} from "./format.js";
import { subscriptionsSummary } from "./views-lists.js";
import { state } from "./store.js";

function subscriptionEntry(sub) {
  const off = state.cancelledSubscriptions.includes(sub.name);
  let action;
  if (off) {
    action =
      '<span><span class="chip red">Cancelled</span> <button type="button" class="small secondary" data-restore-sub="' +
      escapeHtml(sub.name) +
      '">Restore</button></span>';
  } else {
    action =
      '<button type="button" class="small danger" data-cancel-sub="' +
      escapeHtml(sub.name) +
      '">Cancel</button>';
  }
  return (
    "<li><span><strong>" +
    escapeHtml(sub.name) +
    '</strong> — <span class="money">' +
    money(sub.amount, true) +
    "</span>/month<br><span class=\"sub\">" +
    escapeHtml(sub.used) +
    "</span></span>\n          " +
    action +
    "</li>"
  );
}

function guideEntry(article) {
  return (
    '<article class="card guide-block" id="' +
    article.id +
    '">\n      <h3>' +
    escapeHtml(article.title) +
    "</h3>\n      <p>" +
    escapeHtml(article.body) +
    "</p>\n    </article>"
  );
}

function splitCellHtml(label, id, amount) {
  return (
    '<div class="cell"><div class="label">' +
    label +
    '</div><div class="amount money" id="' +
    id +
    '">' +
    amount +
    "</div></div>"
  );
}

export function toolsView() {
  const audit = subscriptionsSummary();
  const yearly = audit.monthly * 12;
  const savedYearly = audit.savedMonthly * 12;
  let savingsLine;
  if (audit.savedMonthly > 0) {
    savingsLine =
      '<p class="pos">Cancelled so far saves <strong class="money">' +
      money(audit.savedMonthly, true) +
      '</strong>/month — <strong class="money">' +
      money(savedYearly, true) +
      "</strong> a year.</p>";
  } else {
    savingsLine =
      '<p class="hint">Nothing cancelled yet. The fitness app ($8.99) has not been opened since September.</p>';
  }

  const head =
    '<div class="page-head">\n    <h1>Tools</h1>\n    <p>Three calculators and one audit that answer the questions a household actually asks: how should the pay be split, how big a safety net do we need, can we afford this, and what are the subscriptions really costing?</p>\n  </div>';

  const splitCard =
    '<section class="card">\n    <h2>50 / 30 / 20 split</h2>\n    <p class="hint">Type your monthly take-home pay. The rule says: 50% needs, 30% wants, 20% savings and debt.</p>\n    <form id="split-form">\n      <div class="field"><label for="split-pay">Monthly take-home pay ($)</label><input id="split-pay" type="number" min="0" step="1" value="4850" required></div>\n      <button type="submit">Split it</button>\n    </form>\n    <div id="split-result" class="tool-grid" style="margin-top:14px">\n      ' +
    splitCellHtml("Needs · 50%", "split-needs", "$2,425") +
    "\n      " +
    splitCellHtml("Wants · 30%", "split-wants", "$1,455") +
    "\n      " +
    splitCellHtml("Savings · 20%", "split-savings", "$970") +
    '\n    </div>\n    <p class="hint" id="split-note">On the Ellis pay of $4,850 that is $2,425 / $1,455 / $970. Their real split is about 58% needs, 19% wants, 23% savings — rent is high where they live, so wants run smaller.</p>\n  </section>';

  const fundCard =
    '<section class="card">\n    <h2>Emergency fund target</h2>\n    <p class="hint">Add up one month of essentials — rent, food, bills, transport — and pick how many months of cover you want.</p>\n    <form id="fund-form">\n      <div class="row">\n        <div class="field"><label for="fund-essentials">Monthly essentials ($)</label><input id="fund-essentials" type="number" min="0" step="1" value="2680" required></div>\n        <div class="field"><label for="fund-months">Months of cover</label><select id="fund-months"><option value="1">1 month — starter</option><option value="3" selected>3 months — solid</option><option value="6">6 months — very safe</option></select></div>\n      </div>\n      <button type="submit">Work out my target</button>\n    </form>\n    <p class="tool-result" id="fund-result">Target: $8,040 — three months of essentials.</p>\n    <p class="hint">The Ellis essentials are about $2,680 a month, so their three-month target is $8,040. Their fund holds $4,350 so far — the goal on the <a href="#/goals">Goals</a> page is the $6,000 milestone on the way there.</p>\n  </section>';

  const affordCard =
    '<section class="card">\n    <h2>Can we afford it?</h2>\n    <p class="hint">A big purchase, spread over monthly payments. Type the price, how many months to pay it off, and what spare cash the month has.</p>\n    <form id="afford-form">\n      <div class="row">\n        <div class="field"><label for="afford-price">Price ($)</label><input id="afford-price" type="number" min="0" step="1" value="650" required></div>\n        <div class="field"><label for="afford-months">Pay it off over (months)</label><input id="afford-months" type="number" min="1" step="1" value="6" required></div>\n        <div class="field"><label for="afford-spare">Spare cash each month ($)</label><input id="afford-spare" type="number" min="0" step="1" value="196" required></div>\n      </div>\n      <button type="submit">Check it</button>\n    </form>\n    <p class="tool-result" id="afford-result">Monthly payment: $108.33 — fits in $196 of spare cash.</p>\n    <p class="hint" id="afford-note">That leaves $87.67 of spare cash a month. The example is the washing machine the family is saving for: paying over 6 months would cost $108.33 a month, which fits — but saving first costs nothing extra.</p>\n  </section>';

  const auditCard =
    '<section class="card">\n    <h2>Subscription audit</h2>\n    <p class="hint">Every subscription, what it costs, and whether it is used. Cancel one and watch the yearly total fall.</p>\n    <ul class="clean-list" id="sub-list">\n      ' +
    state.subscriptions.map(subscriptionEntry).join("") +
    '\n    </ul>\n    <p style="margin-top:12px">Paying now: <strong class="money">' +
    money(audit.monthly, true) +
    '</strong>/month — <strong class="money">' +
    money(yearly, true) +
    "</strong> a year.</p>\n    " +
    savingsLine +
    "\n  </section>";

  return (
    "\n  " +
    head +
    '\n\n  <div class="grid grid-2">\n    ' +
    splitCard +
    "\n\n    " +
    fundCard +
    '\n  </div>\n\n  <div class="grid grid-2">\n    ' +
    affordCard +
    "\n\n    " +
    auditCard +
    "\n  </div>"
  );
}

export function guideView() {
  const head =
    '<div class="page-head">\n    <h1>The guide</h1>\n    <p>Short, plain-English answers to the budgeting questions that come up in a real household — written around how the Ellis family actually runs its money, so you can copy what fits yours.</p>\n  </div>';

  const startHere =
    '<div class="callout"><strong>Start here, in one evening:</strong> 1) write down the pay that lands each month, 2) list the fixed bills, 3) give every remaining dollar a category on the <a href="#/budget">Budget</a> page, 4) set one savings goal on the <a href="#/goals">Goals</a> page. That is the whole system.</div>';

  const checklist =
    '<section class="card">\n    <h2>A weekly checklist</h2>\n    <ol class="rule-list">\n      <li><strong>Sunday, 15 minutes:</strong> open the <a href="#/transactions">Transactions</a> page and check the week’s spending against the plan.</li>\n      <li><strong>Payday:</strong> move savings first, before anything else — the <a href="#/goals">Goals</a> page shows where it goes.</li>\n      <li><strong>End of month:</strong> move money between categories that went over and under, then reset the plan for next month.</li>\n      <li><strong>Every three months:</strong> run the <a href="#/tools">subscription audit</a> and cancel anything unused.</li>\n    </ol>\n  </section>';

  return (
    "\n  " +
    head +
    "\n\n  " +
    startHere +
    "\n\n  " +
    GUIDE.map(guideEntry).join("\n\n  ") +
    "\n\n  " +
    checklist
  );
}
