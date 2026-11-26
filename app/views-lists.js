// The transactions and goals pages: the full spending record with a
// working add-transaction form and filters, and the savings goals with a
// working "add money" control and a new-goal form.

import {
  money,
  prettyDate,
  signedMoney,
  percent,
  escapeHtml,
} from "./format.js";
import {
  state,
  categoryName,
  categoryColor,
  activeSubscriptions,
} from "./store.js";

// The transaction filter lives in this module. main.js changes it through
// setTxFilter whenever one of the filter controls moves.
const txFilter = { category: "all", kind: "all" };

export function setTxFilter(patch) {
  Object.assign(txFilter, patch);
}

function txMatches(tx) {
  if (txFilter.category !== "all" && tx.category !== txFilter.category) {
    return false;
  }
  if (txFilter.kind === "spending" && tx.amount >= 0) return false;
  if (txFilter.kind === "income" && tx.amount < 0) return false;
  return true;
}

function txRowHtml(tx) {
  const tone = tx.amount < 0 ? "neg" : "pos";
  return (
    "<tr>\n            <td>" +
    prettyDate(tx.date) +
    "</td>\n            <td>" +
    escapeHtml(tx.desc) +
    '</td>\n            <td><span class="dot" style="background:' +
    categoryColor(tx.category) +
    '"></span>' +
    categoryName(tx.category) +
    '</td>\n            <td class="num money ' +
    tone +
    '">' +
    signedMoney(tx.amount, true) +
    "</td>\n          </tr>"
  );
}

function kindToggle(kind, label) {
  const pressed = txFilter.kind === kind;
  const extra = pressed ? "" : "secondary";
  return (
    '<button type="button" class="small ' +
    extra +
    '" data-kind="' +
    kind +
    '">' +
    label +
    "</button>"
  );
}

function categoryChoice(category) {
  const picked = txFilter.category === category.id ? "selected" : "";
  return (
    '<option value="' +
    category.id +
    '" ' +
    picked +
    ">" +
    category.name +
    "</option>"
  );
}

function totalsFor(list) {
  let spent = 0;
  let earned = 0;
  for (const tx of list) {
    if (tx.amount < 0) spent += Math.abs(tx.amount);
    else earned += tx.amount;
  }
  return { spent, earned };
}

function categoryOptions() {
  let html = "";
  for (const category of state.categories) {
    html += '<option value="' + category.id + '">' + category.name + "</option>";
  }
  return html;
}

export function transactionsView() {
  const shown = state.transactions.filter(txMatches);
  const { spent, earned } = totalsFor(shown);
  const incomePicked = txFilter.category === "income" ? "selected" : "";

  let rows = "";
  for (const tx of shown) rows += txRowHtml(tx);
  if (rows === "") {
    rows = '<tr><td colspan="4">Nothing matches this filter yet.</td></tr>';
  }

  const head =
    '<div class="page-head">\n    <h1>Transactions</h1>\n    <p>Every dollar in and out, newest first. Add a transaction below and the category totals on the Budget page move with it. Showing ' +
    shown.length +
    " of " +
    state.transactions.length +
    " records.</p>\n  </div>";

  const addForm =
    '<section class="card">\n    <h2>Add a transaction</h2>\n    <form id="tx-form">\n      <div class="row">\n        <div class="field"><label for="tx-date">Date</label><input id="tx-date" name="date" type="date" value="2026-11-25" required></div>\n        <div class="field" style="flex:2 1 220px"><label for="tx-desc">What was it?</label><input id="tx-desc" name="desc" type="text" placeholder="e.g. Corner Market — groceries" maxlength="80" required></div>\n        <div class="field"><label for="tx-category">Category</label><select id="tx-category" name="category">' +
    categoryOptions() +
    '</select></div>\n        <div class="field"><label for="tx-amount">Amount ($)</label><input id="tx-amount" name="amount" type="number" step="0.01" min="0.01" placeholder="25.00" required></div>\n        <div class="field"><label for="tx-kind">Direction</label><select id="tx-kind" name="kind"><option value="spending">Money out</option><option value="income">Money in</option></select></div>\n      </div>\n      <button type="submit">Add transaction</button>\n      <span class="hint" id="tx-message" role="status"></span>\n    </form>\n  </section>';

  const filterCard =
    '<section class="card">\n    <h2>Filter the list</h2>\n    <form id="tx-filter-form">\n      <div class="row">\n        <div class="field"><label for="tx-filter-category">Category</label><select id="tx-filter-category"><option value="all">All categories</option>' +
    state.categories.map(categoryChoice).join("") +
    '<option value="income" ' +
    incomePicked +
    '>Income</option></select></div>\n        <div class="field"><label>Kind</label><div>\n          ' +
    kindToggle("all", "All") +
    "\n          " +
    kindToggle("spending", "Spending") +
    "\n          " +
    kindToggle("income", "Income") +
    '\n        </div></div>\n      </div>\n    </form>\n    <p class="hint">In this view: <strong class="money pos">' +
    signedMoney(earned, true) +
    '</strong> in, <strong class="money neg">−' +
    money(spent, true) +
    "</strong> out.</p>\n" +
    '    <div class="table-wrap">\n      <table>\n        <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>\n        <tbody>\n          ' +
    rows +
    "\n        </tbody>\n      </table>\n    </div>\n  </section>";

  return "\n  " + head + "\n\n  " + addForm + "\n\n  " + filterCard;
}

function goalCardHtml(goal) {
  const done = Math.min(
    100,
    Math.round((goal.saved / goal.target) * 100)
  );
  const left = Math.max(0, goal.target - goal.saved);
  const remainingNote =
    left > 0 ? money(left) + " to go" : "Done — fully funded!";
  return (
    '<section class="card">\n        <h2>' +
    escapeHtml(goal.name) +
    '</h2>\n        <p class="hint">' +
    escapeHtml(goal.note) +
    '</p>\n        <p><span class="big money">' +
    money(goal.saved) +
    "</span> <small>of " +
    money(goal.target) +
    " · " +
    percent(goal.saved, goal.target) +
    '</small></p>\n        <div class="bar"><span style="width:' +
    done +
    '%"></span></div>\n        <div class="bar-note"><span>' +
    done +
    "% there</span><span>" +
    remainingNote +
    '</span></div>\n        <form class="goal-add" data-goal="' +
    goal.id +
    '" style="margin-top:12px">\n          <div class="row">\n            <div class="field"><label for="add-' +
    goal.id +
    '">Add money ($)</label><input id="add-' +
    goal.id +
    '" name="amount" type="number" min="1" step="1" placeholder="50" required></div>\n            <div class="field" style="flex:0 0 auto;justify-content:flex-end"><button type="submit" class="small">Add to goal</button></div>\n          </div>\n        </form>\n      </section>'
  );
}

export function goalsView() {
  let totalSaved = 0;
  let totalTarget = 0;
  for (const goal of state.goals) {
    totalSaved += goal.saved;
    totalTarget += goal.target;
  }

  const head =
    '<div class="page-head">\n    <h1>Savings goals</h1>\n    <p>' +
    money(totalSaved) +
    " saved toward " +
    money(totalTarget) +
    " of goals. Add money to a goal whenever there is cash left over — even $20 moves the bar.</p>\n  </div>";

  const grid =
    '<div class="grid grid-2">\n    ' +
    state.goals.map(goalCardHtml).join("") +
    "\n  </div>";

  const newGoal =
    '<section class="card">\n    <h2>Start a new goal</h2>\n    <form id="goal-form">\n      <div class="row">\n        <div class="field" style="flex:2 1 220px"><label for="goal-name">What are you saving for?</label><input id="goal-name" name="name" type="text" placeholder="e.g. A new bike for Noah" maxlength="60" required></div>\n        <div class="field"><label for="goal-target">Target ($)</label><input id="goal-target" name="target" type="number" min="1" step="1" placeholder="300" required></div>\n        <div class="field"><label for="goal-saved">Already saved ($)</label><input id="goal-saved" name="saved" type="number" min="0" step="1" value="0"></div>\n      </div>\n      <button type="submit">Create goal</button>\n      <span class="hint" id="goal-message" role="status"></span>\n    </form>\n  </section>';

  const advice =
    '<div class="callout">\n    <strong>Which goal first?</strong> The emergency fund comes before the holiday — a broken boiler does not wait for summer. The Ellises put the first $50 of any leftover each month into the emergency fund, then split the rest.\n  </div>';

  return "\n  " + head + "\n\n  " + grid + "\n\n  " + newGoal + "\n\n  " + advice;
}

export function subscriptionsSummary() {
  const live = activeSubscriptions();
  let monthly = 0;
  for (const sub of live) monthly += sub.amount;
  const off = [];
  for (const sub of state.subscriptions) {
    if (state.cancelledSubscriptions.includes(sub.name)) off.push(sub);
  }
  let savedMonthly = 0;
  for (const sub of off) savedMonthly += sub.amount;
  return { active: live, monthly, cancelled: off, savedMonthly };
}
