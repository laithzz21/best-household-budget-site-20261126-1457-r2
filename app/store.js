// The household's live figures. They start from data.js and the family's
// own edits are kept in localStorage, so a change survives a reload without
// ever leaving this browser. Storage is treated as untrustworthy: every
// read is wrapped, and a blocked or broken store just means the site runs
// on the shipped figures for this visit.

import {
  CATEGORIES,
  TRANSACTIONS,
  GOALS,
  SUBSCRIPTIONS,
} from "./data.js";

const STORAGE_KEY = ["homeledger", "state", "v1"].join("-");

// Only these four lists are ever written to storage, and only these four
// are ever read back. Anything else found under the key is ignored.
const STORED_LISTS = [
  "categories",
  "transactions",
  "goals",
  "cancelledSubscriptions",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function blankState() {
  return {
    categories: clone(CATEGORIES),
    transactions: clone(TRANSACTIONS),
    goals: clone(GOALS),
    subscriptions: clone(SUBSCRIPTIONS),
    cancelledSubscriptions: [],
  };
}

function loadSnapshot() {
  let parsed = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }
  return parsed !== null && typeof parsed === "object" ? parsed : {};
}

function saveSnapshot(snapshot) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // No storage available: the page still works, edits just do not persist.
  }
}

// The working state: shipped figures first, then the household's saved
// edits layered over the top wherever they are well-formed lists.
export const state = blankState();

const savedSnapshot = loadSnapshot();
for (const listName of STORED_LISTS) {
  const savedList = savedSnapshot[listName];
  if (Array.isArray(savedList)) state[listName] = savedList;
}

function persist() {
  const snapshot = {};
  for (const listName of STORED_LISTS) {
    snapshot[listName] = state[listName];
  }
  saveSnapshot(snapshot);
}

function toCents(value) {
  return Math.round(Number(value) * 100) / 100;
}

function lookupCategory(id) {
  for (const category of state.categories) {
    if (category.id === id) return category;
  }
  return undefined;
}

function lookupGoal(id) {
  for (const goal of state.goals) {
    if (goal.id === id) return goal;
  }
  return undefined;
}

function subscriptionIsCancelled(name) {
  return state.cancelledSubscriptions.indexOf(name) !== -1;
}

export function totalIncome() {
  let running = 0;
  for (const entry of state.transactions) {
    if (entry.amount > 0) running += entry.amount;
  }
  return running;
}

export function totalPlanned() {
  let running = 0;
  for (const category of state.categories) running += category.planned;
  return running;
}

export function totalActual() {
  let running = 0;
  for (const category of state.categories) running += category.actual;
  return running;
}

export function categoryName(id) {
  if (id === "income") return "Income";
  const found = lookupCategory(id);
  return found ? found.name : id;
}

export function categoryColor(id) {
  const found = lookupCategory(id);
  return found ? found.color : "#7a8a7d";
}

export function addTransaction({ date, desc, category, amount }) {
  state.transactions.unshift({ date, desc, category, amount });
  const bucket = lookupCategory(category);
  if (bucket && amount < 0) {
    bucket.actual = toCents(bucket.actual + Math.abs(amount));
  }
  persist();
}

export function setPlanned(categoryId, planned) {
  const bucket = lookupCategory(categoryId);
  if (!bucket) return;
  const next = toCents(planned);
  bucket.planned = next < 0 ? 0 : next;
  persist();
}

export function addToGoal(goalId, amount) {
  const goal = lookupGoal(goalId);
  if (!goal) return;
  goal.saved = toCents(goal.saved + Number(amount));
  persist();
}

export function addGoal({ name, target, saved }) {
  const id = "goal-" + Date.now();
  state.goals.push({
    id,
    name,
    note: "Added by the household.",
    target,
    saved,
  });
  persist();
  return id;
}

export function cancelSubscription(name) {
  if (!subscriptionIsCancelled(name)) {
    state.cancelledSubscriptions.push(name);
  }
  persist();
}

export function restoreSubscription(name) {
  state.cancelledSubscriptions = state.cancelledSubscriptions.filter(
    (entry) => entry !== name
  );
  persist();
}

export function activeSubscriptions() {
  const live = [];
  for (const sub of state.subscriptions) {
    if (!subscriptionIsCancelled(sub.name)) live.push(sub);
  }
  return live;
}

export function resetAll() {
  const fresh = blankState();
  state.categories = fresh.categories;
  state.transactions = fresh.transactions;
  state.goals = fresh.goals;
  state.subscriptions = fresh.subscriptions;
  state.cancelledSubscriptions = fresh.cancelledSubscriptions;
  persist();
}
