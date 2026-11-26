// HomeLedger's numbers: the Ellis household, November 2026.
//
// One file holds every figure the site shows, so the dashboard, budget,
// transactions, goals and tools can never disagree. Amounts are US dollars.
// Spending is kept positive in the plan and negative in the transaction
// list; each view decides how to sign a number when it prints it.
//
// The tables below are written as compact rows and mapped into the objects
// the views import, so the shape of the data stays obvious at a glance.

const row = (fields) => (values) =>
  Object.fromEntries(fields.map((field, i) => [field, values[i]]));

export const HOUSEHOLD = {
  name: 'The Ellis household',
  members: 'Maya & Jordan Ellis, with Noah (9) and Lily (6)',
  month: 'November 2026',
  currency: 'USD',
};

export const INCOME = [
  ['Maya — primary-school teacher, take-home pay', 3150],
  ['Jordan — delivery driving, take-home pay', 1700],
].map(row(['source', 'amount']));

export const MONTHS = [
  ['Jun', 4800, 4520],
  ['Jul', 4850, 4610],
  ['Aug', 4850, 4780],
  ['Sep', 4900, 4490],
  ['Oct', 4850, 4720],
  ['Nov', 4850, 4654],
].map(row(['month', 'income', 'spent']));

// The monthly plan. `planned` is the envelope set aside at the start of the
// month; `actual` is what November has cost so far. The planned column adds
// up to the household's income: every dollar has a job.
export const CATEGORIES = [
  ['housing', 'Housing (rent)', 1450, 1450, '#1d5c43'],
  ['groceries', 'Groceries', 620, 588, '#2f7d5b'],
  ['utilities', 'Utilities', 210, 204, '#4a9b7c'],
  ['transport', 'Transport', 340, 312, '#c77f1a'],
  ['dining', 'Dining out', 180, 214, '#b4552d'],
  ['kids', 'Kids & school', 260, 245, '#2f5d8a'],
  ['health', 'Health', 150, 132, '#6b7fa3'],
  ['entertainment', 'Entertainment', 120, 96, '#8a6d9e'],
  ['clothing', 'Clothing', 90, 74, '#a3907a'],
  ['savings', 'Savings', 600, 600, '#1d5c43'],
  ['misc', 'Household & misc', 130, 118, '#7a8a7d'],
  ['fun', 'Fun money', 200, 186, '#c77f1a'],
  ['giving', 'Giving', 100, 100, '#2f5d8a'],
  ['home', 'Home maintenance', 150, 85, '#8a6d4b'],
  ['debt', 'Debt payment', 250, 250, '#a63a2a'],
].map(row(['id', 'name', 'planned', 'actual', 'color']));

export const TRANSACTIONS = [
  ['2026-11-24', 'Corner Market — weekly groceries', 'groceries', -86.4],
  ['2026-11-23', "Maya's salary — November pay", 'income', 3150],
  ['2026-11-23', 'Shell — petrol', 'transport', -42.1],
  ['2026-11-22', "Luigi's — pizza night", 'dining', -38.75],
  ['2026-11-22', 'City Power — electricity bill', 'utilities', -131.8],
  ['2026-11-21', "Noah's school trip — museum", 'kids', -45],
  ['2026-11-20', 'Jordan — delivery payout, week 3', 'income', 412.5],
  ['2026-11-20', 'Riverside Pharmacy', 'health', -27.6],
  ['2026-11-19', 'Cinema — family film, 4 tickets', 'entertainment', -34],
  ['2026-11-18', 'Corner Market — weekly groceries', 'groceries', -74.25],
  ['2026-11-17', 'Bus passes — Maya & Jordan', 'transport', -56],
  ['2026-11-16', 'New school shoes for Lily', 'clothing', -58.9],
  ['2026-11-15', 'StreamFlix — monthly plan', 'entertainment', -15.49],
  ['2026-11-14', 'Plumber — leaking kitchen tap', 'home', -85],
  ['2026-11-13', 'Jordan — delivery payout, week 2', 'income', 385],
  ['2026-11-12', 'Corner Market — weekly groceries', 'groceries', -91.3],
  ['2026-11-11', 'Bookshop — Lily’s birthday book', 'fun', -18.99],
  ['2026-11-10', 'Mobile top-up — Jordan', 'utilities', -25],
  ['2026-11-09', 'Corner Market — weekly groceries', 'groceries', -79.6],
  ['2026-11-08', 'Charity — food bank donation', 'giving', -50],
].map(row(['date', 'desc', 'category', 'amount']));

export const GOALS = [
  ['emergency', 'Emergency fund', 'Three months of essentials, for a broken boiler or a lost job.', 6000, 4350],
  ['holiday', 'Summer holiday — the seaside', 'A week by the sea in July, train tickets included.', 1800, 940],
  ['washer', 'New washing machine', 'The old one leaks. Replacing it beats another repair bill.', 650, 420],
  ['college', 'Kids’ college fund', 'A little each month, started when Noah was born.', 10000, 2150],
].map(row(['id', 'name', 'note', 'target', 'saved']));

export const BILLS = [
  ['City Power — electricity', 132, '28 Nov', true],
  ['FastNet — home internet', 65, '1 Dec', true],
  ['SafeDrive — car insurance', 118, '3 Dec', false],
  ['City Water', 48, '5 Dec', true],
  ['StreamFlix', 15.49, '15 Dec', true],
  ['Gym — family membership', 42, '18 Dec', false],
].map(row(['name', 'amount', 'due', 'autopay']));

export const SUBSCRIPTIONS = [
  ['StreamFlix', 15.49, 'Every week — family film night'],
  ['MusicBox', 9.99, 'Daily — Maya’s commute'],
  ['Cloud Photos', 2.99, 'Backs up every photo automatically'],
  ['GameBox', 12.99, 'Noah plays it twice a month'],
  ['News Daily', 6.5, 'Jordan reads it most mornings'],
  ['Fitness App', 8.99, 'Not opened since September'],
].map(row(['name', 'amount', 'used']));

// The guide: six short articles, shown in this order on the Guide page.
export const GUIDE = [
  {
    id: 'fifty-thirty-twenty',
    title: 'The 50/30/20 rule, in plain English',
    body: 'Split take-home pay three ways: about 50% on needs (rent, food, bills, transport), 30% on wants (eating out, films, hobbies) and 20% on savings and paying off debt. The Ellis household runs at roughly 58% needs, 19% wants and 23% savings — rent is high where they live, so the wants share is smaller. Use the rule as a compass, not a law: if your rent alone is 40% of pay, aim for 20% wants and keep the savings share. Try the calculator on the Tools page with your own pay.',
  },
  {
    id: 'pay-yourself-first',
    title: 'Pay yourself first',
    body: 'The most reliable saving trick is also the simplest: move money to savings the day pay lands, before anything else gets a chance to spend it. The Ellises move $600 to savings on the 23rd, the day Maya is paid. Even $50 a month counts — after a year that is $600, and the habit matters more than the amount. Automate it if your bank allows a standing order, so willpower never gets a vote.',
  },
  {
    id: 'money-date',
    title: 'The weekly money date',
    body: 'Fifteen minutes, once a week, same time: open the budget together, check what was spent, and move money between categories if life got in the way. The Ellises do theirs on Sunday evenings. Dining out ran $34 over this month, so they moved $34 from Fun money instead of pretending it did not happen. A budget that never gets adjusted is a budget that gets abandoned.',
  },
  {
    id: 'envelope-method',
    title: 'The envelope method, for the leaky categories',
    body: 'Some categories leak: groceries, dining out, fun money. Give each a fixed amount for the month and stop when it is gone. You can do it with cash envelopes or with a separate account card. Groceries are the Ellis family’s leakiest category, so their $620 sits in its own envelope — when the envelope is empty, meals come from the cupboard. It sounds old-fashioned because it works.',
  },
  {
    id: 'emergency-fund',
    title: 'How big should an emergency fund be?',
    body: 'Start with $1,000 — enough to cover a broken washing machine or a car repair without a credit card. Then build toward three months of essential spending: rent, food, bills and transport, nothing else. For the Ellis household that is about $6,000. It took them fourteen months to reach $4,350. Keep it in a separate savings account you can reach in a day, but not so easily that a sale can tempt you into it.',
  },
  {
    id: 'subscriptions',
    title: 'The subscription audit',
    body: 'Add up every subscription once a quarter. The Ellises pay $56.95 a month — $683 a year — and one of them, the fitness app at $8.99, has not been opened since September. Cancel anything unused for two months; you can always rejoin. The Tools page lists theirs with a running total, so you can see what yours would add up to.',
  },
];
