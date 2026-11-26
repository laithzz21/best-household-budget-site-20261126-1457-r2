// HomeLedger figures — the Ellis household, November 2026.
//
// Everything the site displays lives in this one module, written out as
// plain object literals so each figure can be found and checked on its own.
// The dashboard, budget page, transactions, goals and tools all read from
// here, which is what keeps them in agreement with each other.
//
// Money is in US dollars. Category plans hold spending as a positive
// number; transactions hold spending as a negative number and income as a
// positive one. Each view adds the sign back when it prints a figure.

export const HOUSEHOLD = {
  currency: "USD",
  month: "November 2026",
  members: "Maya & Jordan Ellis, with Noah (9) and Lily (6)",
  name: "The Ellis household",
};

export const INCOME = [
  { amount: 3150, source: "Maya — primary-school teacher, take-home pay" },
  { amount: 1700, source: "Jordan — delivery driving, take-home pay" },
];

export const MONTHS = [
  { spent: 4520, income: 4800, month: "Jun" },
  { spent: 4610, income: 4850, month: "Jul" },
  { spent: 4780, income: 4850, month: "Aug" },
  { spent: 4490, income: 4900, month: "Sep" },
  { spent: 4720, income: 4850, month: "Oct" },
  { spent: 4654, income: 4850, month: "Nov" },
];

// The plan for the month. `planned` is the envelope set aside when the
// month began; `actual` is what November has cost so far. Add the planned
// column up and you get the household income: $4,850, every dollar spoken
// for before the month starts.
export const CATEGORIES = [
  { color: "#1d5c43", actual: 1450, planned: 1450, name: "Housing (rent)", id: "housing" },
  { color: "#2f7d5b", actual: 588, planned: 620, name: "Groceries", id: "groceries" },
  { color: "#4a9b7c", actual: 204, planned: 210, name: "Utilities", id: "utilities" },
  { color: "#c77f1a", actual: 312, planned: 340, name: "Transport", id: "transport" },
  { color: "#b4552d", actual: 214, planned: 180, name: "Dining out", id: "dining" },
  { color: "#2f5d8a", actual: 245, planned: 260, name: "Kids & school", id: "kids" },
  { color: "#6b7fa3", actual: 132, planned: 150, name: "Health", id: "health" },
  { color: "#8a6d9e", actual: 96, planned: 120, name: "Entertainment", id: "entertainment" },
  { color: "#a3907a", actual: 74, planned: 90, name: "Clothing", id: "clothing" },
  { color: "#1d5c43", actual: 600, planned: 600, name: "Savings", id: "savings" },
  { color: "#7a8a7d", actual: 118, planned: 130, name: "Household & misc", id: "misc" },
  { color: "#c77f1a", actual: 186, planned: 200, name: "Fun money", id: "fun" },
  { color: "#2f5d8a", actual: 100, planned: 100, name: "Giving", id: "giving" },
  { color: "#8a6d4b", actual: 85, planned: 150, name: "Home maintenance", id: "home" },
  { color: "#a63a2a", actual: 250, planned: 250, name: "Debt payment", id: "debt" },
];

export const TRANSACTIONS = [
  { amount: -86.4, category: "groceries", desc: "Corner Market — weekly groceries", date: "2026-11-24" },
  { amount: 3150, category: "income", desc: "Maya's salary — November pay", date: "2026-11-23" },
  { amount: -42.1, category: "transport", desc: "Shell — petrol", date: "2026-11-23" },
  { amount: -38.75, category: "dining", desc: "Luigi's — pizza night", date: "2026-11-22" },
  { amount: -131.8, category: "utilities", desc: "City Power — electricity bill", date: "2026-11-22" },
  { amount: -45, category: "kids", desc: "Noah's school trip — museum", date: "2026-11-21" },
  { amount: 412.5, category: "income", desc: "Jordan — delivery payout, week 3", date: "2026-11-20" },
  { amount: -27.6, category: "health", desc: "Riverside Pharmacy", date: "2026-11-20" },
  { amount: -34, category: "entertainment", desc: "Cinema — family film, 4 tickets", date: "2026-11-19" },
  { amount: -74.25, category: "groceries", desc: "Corner Market — weekly groceries", date: "2026-11-18" },
  { amount: -56, category: "transport", desc: "Bus passes — Maya & Jordan", date: "2026-11-17" },
  { amount: -58.9, category: "clothing", desc: "New school shoes for Lily", date: "2026-11-16" },
  { amount: -15.49, category: "entertainment", desc: "StreamFlix — monthly plan", date: "2026-11-15" },
  { amount: -85, category: "home", desc: "Plumber — leaking kitchen tap", date: "2026-11-14" },
  { amount: 385, category: "income", desc: "Jordan — delivery payout, week 2", date: "2026-11-13" },
  { amount: -91.3, category: "groceries", desc: "Corner Market — weekly groceries", date: "2026-11-12" },
  { amount: -18.99, category: "fun", desc: "Bookshop — Lily’s birthday book", date: "2026-11-11" },
  { amount: -25, category: "utilities", desc: "Mobile top-up — Jordan", date: "2026-11-10" },
  { amount: -79.6, category: "groceries", desc: "Corner Market — weekly groceries", date: "2026-11-09" },
  { amount: -50, category: "giving", desc: "Charity — food bank donation", date: "2026-11-08" },
];

export const GOALS = [
  { saved: 4350, target: 6000, note: "Three months of essentials, for a broken boiler or a lost job.", name: "Emergency fund", id: "emergency" },
  { saved: 940, target: 1800, note: "A week by the sea in July, train tickets included.", name: "Summer holiday — the seaside", id: "holiday" },
  { saved: 420, target: 650, note: "The old one leaks. Replacing it beats another repair bill.", name: "New washing machine", id: "washer" },
  { saved: 2150, target: 10000, note: "A little each month, started when Noah was born.", name: "Kids’ college fund", id: "college" },
];

export const BILLS = [
  { autopay: true, due: "28 Nov", amount: 132, name: "City Power — electricity" },
  { autopay: true, due: "1 Dec", amount: 65, name: "FastNet — home internet" },
  { autopay: false, due: "3 Dec", amount: 118, name: "SafeDrive — car insurance" },
  { autopay: true, due: "5 Dec", amount: 48, name: "City Water" },
  { autopay: true, due: "15 Dec", amount: 15.49, name: "StreamFlix" },
  { autopay: false, due: "18 Dec", amount: 42, name: "Gym — family membership" },
];

export const SUBSCRIPTIONS = [
  { used: "Every week — family film night", amount: 15.49, name: "StreamFlix" },
  { used: "Daily — Maya’s commute", amount: 9.99, name: "MusicBox" },
  { used: "Backs up every photo automatically", amount: 2.99, name: "Cloud Photos" },
  { used: "Noah plays it twice a month", amount: 12.99, name: "GameBox" },
  { used: "Jordan reads it most mornings", amount: 6.5, name: "News Daily" },
  { used: "Not opened since September", amount: 8.99, name: "Fitness App" },
];

// The guide: six short articles, in the order the Guide page shows them.
// Each body is split across lines only so it stays readable in the source;
// joined, the text is exactly what the page prints.
export const GUIDE = [
  {
    id: "fifty-thirty-twenty",
    title: "The 50/30/20 rule, in plain English",
    body:
      "Split take-home pay three ways: about 50% on needs (rent, food, bills, transport), " +
      "30% on wants (eating out, films, hobbies) and 20% on savings and paying off debt. " +
      "The Ellis household runs at roughly 58% needs, 19% wants and 23% savings — rent is high " +
      "where they live, so the wants share is smaller. Use the rule as a compass, not a law: if " +
      "your rent alone is 40% of pay, aim for 20% wants and keep the savings share. Try the " +
      "calculator on the Tools page with your own pay.",
  },
  {
    id: "pay-yourself-first",
    title: "Pay yourself first",
    body:
      "The most reliable saving trick is also the simplest: move money to savings the day pay " +
      "lands, before anything else gets a chance to spend it. The Ellises move $600 to savings " +
      "on the 23rd, the day Maya is paid. Even $50 a month counts — after a year that is $600, " +
      "and the habit matters more than the amount. Automate it if your bank allows a standing " +
      "order, so willpower never gets a vote.",
  },
  {
    id: "money-date",
    title: "The weekly money date",
    body:
      "Fifteen minutes, once a week, same time: open the budget together, check what was spent, " +
      "and move money between categories if life got in the way. The Ellises do theirs on Sunday " +
      "evenings. Dining out ran $34 over this month, so they moved $34 from Fun money instead of " +
      "pretending it did not happen. A budget that never gets adjusted is a budget that gets abandoned.",
  },
  {
    id: "envelope-method",
    title: "The envelope method, for the leaky categories",
    body:
      "Some categories leak: groceries, dining out, fun money. Give each a fixed amount for the " +
      "month and stop when it is gone. You can do it with cash envelopes or with a separate " +
      "account card. Groceries are the Ellis family’s leakiest category, so their $620 sits in " +
      "its own envelope — when the envelope is empty, meals come from the cupboard. It sounds " +
      "old-fashioned because it works.",
  },
  {
    id: "emergency-fund",
    title: "How big should an emergency fund be?",
    body:
      "Start with $1,000 — enough to cover a broken washing machine or a car repair without a " +
      "credit card. Then build toward three months of essential spending: rent, food, bills and " +
      "transport, nothing else. For the Ellis household that is about $6,000. It took them " +
      "fourteen months to reach $4,350. Keep it in a separate savings account you can reach in " +
      "a day, but not so easily that a sale can tempt you into it.",
  },
  {
    id: "subscriptions",
    title: "The subscription audit",
    body:
      "Add up every subscription once a quarter. The Ellises pay $56.95 a month — $683 a year — " +
      "and one of them, the fitness app at $8.99, has not been opened since September. Cancel " +
      "anything unused for two months; you can always rejoin. The Tools page lists theirs with a " +
      "running total, so you can see what yours would add up to.",
  },
];
