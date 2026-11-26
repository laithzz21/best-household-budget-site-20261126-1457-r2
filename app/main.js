// HomeLedger's entry point: hash routing plus the wiring that makes every
// control do what it says. The pages:
//
//   #/                dashboard — the month at a glance
//   #/budget          the monthly plan, with editable amounts
//   #/transactions    the spending record, add + filter
//   #/goals           savings goals, add money + new goals
//   #/tools           calculators and the subscription audit
//   #/guide           plain-English budgeting guide
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { dashboardView } from "./views-dashboard.js";
import { budgetView } from "./views-budget.js";
import {
  transactionsView,
  goalsView,
  setTxFilter,
} from "./views-lists.js";
import {
  toolsView,
  guideView,
} from "./views-tools.js";
import { money } from "./format.js";
import {
  addTransaction,
  setPlanned,
  addToGoal,
  addGoal,
  cancelSubscription,
  restoreSubscription,
} from "./store.js";

const app = document.getElementById("app");

function makeRoute(title, view, nav) {
  return { title, view, nav };
}

const ROUTE_TABLE = [
  ["", "HomeLedger — the Ellis household budget", dashboardView, "dashboard"],
  ["budget", "The November budget | HomeLedger", budgetView, "budget"],
  ["transactions", "Transactions | HomeLedger", transactionsView, "transactions"],
  ["goals", "Savings goals | HomeLedger", goalsView, "goals"],
  ["tools", "Budget tools | HomeLedger", toolsView, "tools"],
  ["guide", "The budgeting guide | HomeLedger", guideView, "guide"],
];

const ROUTES = {};
for (const [key, title, view, nav] of ROUTE_TABLE) {
  ROUTES[key] = makeRoute(title, view, nav);
}

function missingPageView() {
  return (
    '<div class="page-head"><h1>That page is not in the house</h1>\n  <p>HomeLedger has a dashboard, a budget, transactions, goals, tools and a guide — all linked in the bar above. <a href="#/">Back to the dashboard →</a></p></div>'
  );
}

function routeForHash(hash) {
  const match = hash.match(/^#\/([a-z-]*)/);
  const key = match ? match[1] : "";
  const found = ROUTES[key];
  if (found) return found;
  return makeRoute("Page not found | HomeLedger", missingPageView, "");
}

function markActiveNav(active) {
  const links = document.querySelectorAll("[data-nav]");
  for (const link of links) {
    link.classList.toggle("active", link.dataset.nav === active);
  }
}

function render() {
  window.__shotReady = false;
  const route = routeForHash(window.location.hash);
  document.title = route.title;
  app.innerHTML = route.view();
  markActiveNav(route.nav);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function numberField(form, name, fallback = 0) {
  return Number(new FormData(form).get(name)) || fallback;
}

function readInputNumber(id) {
  return Number(document.getElementById(id).value) || 0;
}

// --- What each form does ------------------------------------------------

function onTransactionSubmit(form) {
  const data = new FormData(form);
  const direction = data.get("kind") === "income" ? 1 : -1;
  addTransaction({
    date: data.get("date"),
    desc: String(data.get("desc")).trim(),
    category: String(data.get("category")),
    amount: direction * Math.abs(Number(data.get("amount"))),
  });
  setText("tx-message", "Added — the totals on the Budget page moved with it.");
  render();
}

function onNewGoalSubmit(form) {
  const data = new FormData(form);
  addGoal({
    name: String(data.get("name")).trim(),
    target: Number(data.get("target")),
    saved: Number(data.get("saved")) || 0,
  });
  setText("goal-message", "Goal created.");
  render();
}

function onAddToGoalSubmit(form) {
  addToGoal(form.dataset.goal, numberField(form, "amount"));
  render();
}

function onSplitSubmit() {
  const pay = readInputNumber("split-pay");
  const needs = Math.round(pay * 0.5);
  const wants = Math.round(pay * 0.3);
  const savings = Math.round(pay * 0.2);
  setText("split-needs", money(needs));
  setText("split-wants", money(wants));
  setText("split-savings", money(savings));
  setText(
    "split-note",
    "On a pay of " +
      money(pay) +
      " that is " +
      money(needs) +
      " for needs, " +
      money(wants) +
      " for wants and " +
      money(savings) +
      " for savings and debt. Adjust the shares if your rent is unusually high or low."
  );
}

function onFundSubmit() {
  const essentials = readInputNumber("fund-essentials");
  const months = Number(document.getElementById("fund-months").value) || 3;
  const plural = months > 1 ? "s" : "";
  setText(
    "fund-result",
    "Target: " +
      money(essentials * months) +
      " — " +
      months +
      " month" +
      plural +
      " of essentials."
  );
}

function onAffordSubmit() {
  const price = readInputNumber("afford-price");
  const months = Number(document.getElementById("afford-months").value) || 1;
  const spare = readInputNumber("afford-spare");
  const monthly = price / months;
  const fits = monthly <= spare;
  let verdict;
  let note;
  if (fits) {
    verdict = "fits in " + money(spare) + " of spare cash.";
    note =
      "That leaves " +
      money(spare - monthly, true) +
      " of spare cash a month. Saving first still costs nothing extra.";
  } else {
    verdict = "more than the " + money(spare) + " of spare cash. Not yet.";
    note =
      "Short by " +
      money(monthly - spare, true) +
      " a month. Stretch it over more months, or save for it first.";
  }
  setText("afford-result", "Monthly payment: " + money(monthly, true) + " — " + verdict);
  setText("afford-note", note);
}

const SUBMIT_HANDLERS = {
  "tx-form": onTransactionSubmit,
  "goal-form": onNewGoalSubmit,
  "split-form": onSplitSubmit,
  "fund-form": onFundSubmit,
  "afford-form": onAffordSubmit,
};

// --- Wiring, attached once to the app element ---------------------------

app.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.classList.contains("goal-add")) {
    onAddToGoalSubmit(form);
    return;
  }
  const handler = SUBMIT_HANDLERS[form.id];
  if (handler) handler(form);
});

app.addEventListener("change", (event) => {
  const target = event.target;
  if (target.matches("[data-plan]")) {
    setPlanned(target.dataset.plan, Number(target.value));
    render();
    return;
  }
  if (target.id === "tx-filter-category") {
    setTxFilter({ category: target.value });
    render();
  }
});

function trySubscriptionAction(button) {
  if (button.dataset.cancelSub) {
    cancelSubscription(button.dataset.cancelSub);
    render();
    return true;
  }
  if (button.dataset.restoreSub) {
    restoreSubscription(button.dataset.restoreSub);
    render();
    return true;
  }
  return false;
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.kind) {
    setTxFilter({ kind: button.dataset.kind });
    render();
    return;
  }
  trySubscriptionAction(button);
});

window.addEventListener("hashchange", render);
render();
