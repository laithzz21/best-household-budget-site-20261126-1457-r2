[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/laithzz21/best-household-budget-site-20261126-1457-r2/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/laithzz21/best-household-budget-site-20261126-1457-r2/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

# HomeLedger — a household budget site

A household budget planner that works entirely offline, from its own
static files, on a desktop and on a phone. No build step, no network
request, no account, no cloud: every figure lives in the browser it
runs in.

The sample household is the Ellis family (Maya & Jordan, with Noah, 9,
and Lily, 6) in November 2026: $4,850 of take-home pay a month, $4,654
planned out, $196 still unspent, and a 12% savings rate. The site is
built around that one household on purpose: real names, real bills and
real spending make the tools and the guide concrete instead of abstract.
Every figure on the site comes from a single data file (`app/data.js`),
so the dashboard, the budget page, the transactions and the tools all
agree with each other.

## What it does

- **Dashboard** (`#/`): money in, money out, what is left, the savings
  rate, a donut chart of where the money went, bills coming up, a
  six-month income-vs-spending trend, the latest spending and the savings
  goals.
- **Budget** (`#/budget`): the monthly plan, category by category, with
  planned vs actual, what is left, a used-% bar and an on-track / almost
  spent / over status. Planned amounts are editable in place; the totals,
  the chart and the dashboard update immediately.
- **Transactions** (`#/transactions`): the full spending record, newest
  first, with a working add-transaction form (it moves the category
  totals too) and filters by category and by money in / money out.
- **Goals** (`#/goals`): four savings goals with progress bars, a working
  "add money" control on each, and a form to start a new goal.
- **Tools** (`#/tools`): a 50/30/20 split calculator, an emergency-fund
  target calculator, a "can we afford it?" monthly-payment check, and a
  subscription audit with working cancel / restore buttons and a running
  yearly total.
- **Guide** (`#/guide`): six short, plain-English articles — the 50/30/20
  rule, paying yourself first, the weekly money date, the envelope
  method, how big an emergency fund should be, and the subscription
  audit — plus a weekly checklist.

Edits are saved in the browser's local storage, so they survive a reload
and never leave the device. If storage is unavailable the site still
works for the visit. A reset is available from the browser console via
the stored key `homeledger-state-v1`, or by clearing the site's data.
Nothing is sent anywhere: there is no server to send it to.

## Running it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` through any static file server. The screenshots
in `screenshots/` are real renders of the site in headless Chrome (see
`shots.json` for the views and viewports).

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with
the vendored `vendor/makefun-frontend.ts` library.

## Layout

```
main.ts                  the hand-in program
app/
  index.html             shell: header nav, footer, <main id="app">
  style.css              the whole design, responsive to a phone
  main.js                hash router + the wiring for every control
  data.js                the household's figures (one source of truth)
  store.js               state, localStorage persistence, mutations
  format.js              money / date / percent formatting
  charts.js              donut, planned-vs-actual and trend charts (inline SVG)
  views-dashboard.js     the dashboard page
  views-budget.js        the budget page
  views-lists.js         transactions + goals pages
  views-tools.js         tools + guide pages
screenshots/             4 real renders (3 desktop 1280x800, 1 phone 390x844)
vendor/
  makefun-frontend.ts    the kit's library, unchanged
```

## License

MIT — see `LICENSE`.
