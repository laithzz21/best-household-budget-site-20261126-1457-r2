// Live state: the site's figures start in data.js and the household's
// edits are kept in localStorage, so a change survives a reload but never
// leaves this browser. Every read and write of storage is guarded, so the
// site keeps working for the visit if storage is blocked (a hosted copy
// that disallows it, for instance).

import { CATEGORIES, TRANSACTIONS, GOALS, SUBSCRIPTIONS } from './data.js';

const STORAGE_KEY = 'homeledger-state-v1';

// A saved snapshot only ever holds the four lists below; anything else in
// storage is ignored rather than trusted.
const PERSISTED_KEYS = ['categories', 'transactions', 'goals', 'cancelledSubscriptions'];

function readSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSaved(snapshot) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage unavailable: the site keeps working for this visit.
  }
}

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

function freshState() {
  return {
    categories: deepCopy(CATEGORIES),
    transactions: deepCopy(TRANSACTIONS),
    goals: deepCopy(GOALS),
    subscriptions: deepCopy(SUBSCRIPTIONS),
    cancelledSubscriptions: [],
  };
}

// The live state, seeded from the shipped figures and overlaid with the
// household's saved edits where those edits are well-formed lists.
export const state = freshState();

const saved = readSaved();
for (const key of PERSISTED_KEYS) {
  if (Array.isArray(saved[key])) state[key] = saved[key];
}

function persist() {
  const snapshot = {};
  for (const key of PERSISTED_KEYS) snapshot[key] = state[key];
  writeSaved(snapshot);
}

function roundCents(value) {
  return Math.round(Number(value) * 100) / 100;
}

function findCategory(id) {
  return state.categories.find((category) => category.id === id);
}

function findGoal(id) {
  return state.goals.find((goal) => goal.id === id);
}

export function totalIncome() {
  let sum = 0;
  for (const tx of state.transactions) {
    if (tx.amount > 0) sum += tx.amount;
  }
  return sum;
}

export function totalPlanned() {
  return state.categories.reduce((sum, category) => sum + category.planned, 0);
}

export function totalActual() {
  return state.categories.reduce((sum, category) => sum + category.actual, 0);
}

export function categoryName(id) {
  if (id === 'income') return 'Income';
  const found = findCategory(id);
  return found ? found.name : id;
}

export function categoryColor(id) {
  const found = findCategory(id);
  return found ? found.color : '#7a8a7d';
}

export function addTransaction({ date, desc, category, amount }) {
  state.transactions.unshift({ date, desc, category, amount });
  const cat = findCategory(category);
  if (cat && amount < 0) cat.actual = roundCents(cat.actual + Math.abs(amount));
  persist();
}

export function setPlanned(categoryId, planned) {
  const cat = findCategory(categoryId);
  if (!cat) return;
  cat.planned = Math.max(0, roundCents(planned));
  persist();
}

export function addToGoal(goalId, amount) {
  const goal = findGoal(goalId);
  if (!goal) return;
  goal.saved = roundCents(goal.saved + Number(amount));
  persist();
}

export function addGoal({ name, target, saved }) {
  const id = `goal-${Date.now()}`;
  state.goals.push({ id, name, note: 'Added by the household.', target, saved });
  persist();
  return id;
}

function isCancelled(name) {
  return state.cancelledSubscriptions.includes(name);
}

export function cancelSubscription(name) {
  if (!isCancelled(name)) {
    state.cancelledSubscriptions.push(name);
  }
  persist();
}

export function restoreSubscription(name) {
  state.cancelledSubscriptions = state.cancelledSubscriptions.filter((entry) => entry !== name);
  persist();
}

export function activeSubscriptions() {
  return state.subscriptions.filter((sub) => !isCancelled(sub.name));
}

export function resetAll() {
  const fresh = freshState();
  state.categories = fresh.categories;
  state.transactions = fresh.transactions;
  state.goals = fresh.goals;
  state.cancelledSubscriptions = fresh.cancelledSubscriptions;
  persist();
}
