// HomeLedger's entry point: hash routing plus the wiring that makes every
// control do what it says. Pages:
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

import { dashboardView } from './views-dashboard.js';
import { budgetView } from './views-budget.js';
import { transactionsView, goalsView, setTxFilter } from './views-lists.js';
import { toolsView, guideView } from './views-tools.js';
import { money } from './format.js';
import {
  addTransaction,
  setPlanned,
  addToGoal,
  addGoal,
  cancelSubscription,
  restoreSubscription,
} from './store.js';

const app = document.getElementById('app');

function defineRoute(title, view, nav) {
  return { title, view, nav };
}

const ROUTES = {
  '': defineRoute('HomeLedger — the Ellis household budget', dashboardView, 'dashboard'),
  budget: defineRoute('The November budget | HomeLedger', budgetView, 'budget'),
  transactions: defineRoute('Transactions | HomeLedger', transactionsView, 'transactions'),
  goals: defineRoute('Savings goals | HomeLedger', goalsView, 'goals'),
  tools: defineRoute('Budget tools | HomeLedger', toolsView, 'tools'),
  guide: defineRoute('The budgeting guide | HomeLedger', guideView, 'guide'),
};

function notFoundView() {
  return `<div class="page-head"><h1>That page is not in the house</h1>
  <p>HomeLedger has a dashboard, a budget, transactions, goals, tools and a guide — all linked in the bar above. <a href="#/">Back to the dashboard →</a></p></div>`;
}

function routeFor(hash) {
  const match = hash.match(/^#\/([a-z-]*)/);
  const key = match ? match[1] : '';
  const found = ROUTES[key];
  return found ?? defineRoute('Page not found | HomeLedger', notFoundView, '');
}

function highlightNav(active) {
  for (const link of document.querySelectorAll('[data-nav]')) {
    link.classList.toggle('active', link.dataset.nav === active);
  }
}

function render() {
  window.__shotReady = false;
  const route = routeFor(window.location.hash);
  document.title = route.title;
  app.innerHTML = route.view();
  highlightNav(route.nav);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function fieldNumber(form, name, fallback = 0) {
  return Number(new FormData(form).get(name)) || fallback;
}

// --- Form handlers ------------------------------------------------------

function handleTxForm(form) {
  const data = new FormData(form);
  const direction = data.get('kind') === 'income' ? 1 : -1;
  addTransaction({
    date: data.get('date'),
    desc: String(data.get('desc')).trim(),
    category: String(data.get('category')),
    amount: direction * Math.abs(Number(data.get('amount'))),
  });
  setText('tx-message', 'Added — the totals on the Budget page moved with it.');
  render();
}

function handleGoalForm(form) {
  const data = new FormData(form);
  addGoal({
    name: String(data.get('name')).trim(),
    target: Number(data.get('target')),
    saved: Number(data.get('saved')) || 0,
  });
  setText('goal-message', 'Goal created.');
  render();
}

function handleGoalAddForm(form) {
  addToGoal(form.dataset.goal, fieldNumber(form, 'amount'));
  render();
}

function handleSplitForm() {
  const pay = Number(document.getElementById('split-pay').value) || 0;
  const needs = Math.round(pay * 0.5);
  const wants = Math.round(pay * 0.3);
  const savings = Math.round(pay * 0.2);
  setText('split-needs', money(needs));
  setText('split-wants', money(wants));
  setText('split-savings', money(savings));
  setText('split-note', `On a pay of ${money(pay)} that is ${money(needs)} for needs, ${money(wants)} for wants and ${money(savings)} for savings and debt. Adjust the shares if your rent is unusually high or low.`);
}

function handleFundForm() {
  const essentials = Number(document.getElementById('fund-essentials').value) || 0;
  const months = Number(document.getElementById('fund-months').value) || 3;
  const word = months > 1 ? 's' : '';
  setText('fund-result', `Target: ${money(essentials * months)} — ${months} month${word} of essentials.`);
}

function handleAffordForm() {
  const price = Number(document.getElementById('afford-price').value) || 0;
  const months = Number(document.getElementById('afford-months').value) || 1;
  const spare = Number(document.getElementById('afford-spare').value) || 0;
  const monthly = price / months;
  const fits = monthly <= spare;
  const verdict = fits
    ? `fits in ${money(spare)} of spare cash.`
    : `more than the ${money(spare)} of spare cash. Not yet.`;
  setText('afford-result', `Monthly payment: ${money(monthly, true)} — ${verdict}`);
  setText('afford-note', fits
    ? `That leaves ${money(spare - monthly, true)} of spare cash a month. Saving first still costs nothing extra.`
    : `Short by ${money(monthly - spare, true)} a month. Stretch it over more months, or save for it first.`);
}

const FORM_HANDLERS = {
  'tx-form': handleTxForm,
  'goal-form': handleGoalForm,
  'split-form': handleSplitForm,
  'fund-form': handleFundForm,
  'afford-form': handleAffordForm,
};

// --- Wiring, attached once to the app element ---------------------------

app.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.classList.contains('goal-add')) {
    handleGoalAddForm(form);
    return;
  }
  const handler = FORM_HANDLERS[form.id];
  if (handler) handler(form);
});

app.addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('[data-plan]')) {
    setPlanned(target.dataset.plan, Number(target.value));
    render();
    return;
  }
  if (target.id === 'tx-filter-category') {
    setTxFilter({ category: target.value });
    render();
  }
});

function handleSubscriptionButton(button) {
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

app.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.kind) {
    setTxFilter({ kind: button.dataset.kind });
    render();
    return;
  }
  handleSubscriptionButton(button);
});

window.addEventListener('hashchange', render);
render();
