// Money and date printing for the whole site. Every amount the user sees
// goes through these helpers, which is why "$1,450" never shows up spelled
// two different ways on two different pages.

function buildCurrencyFormatter(fractionDigits) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

const wholeDollars = buildCurrencyFormatter(0);
const withCents = buildCurrencyFormatter(2);

function toSafeNumber(raw) {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickFormatter(showCents) {
  return showCents ? withCents : wholeDollars;
}

export function money(amount, showCents = false) {
  return pickFormatter(showCents).format(toSafeNumber(amount));
}

export function signedMoney(amount, showCents = false) {
  const value = toSafeNumber(amount);
  let mark = "";
  if (value > 0) mark = "+";
  else if (value < 0) mark = "−";
  return mark + pickFormatter(showCents).format(Math.abs(value));
}

export function percent(part, whole) {
  const denominator = toSafeNumber(whole);
  if (denominator === 0) return "0%";
  const share = (toSafeNumber(part) / denominator) * 100;
  return Math.round(share) + "%";
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function prettyDate(iso) {
  const pieces = String(iso).split("-");
  const monthIndex = Number(pieces[1]) || 1;
  const day = Number(pieces[2]);
  const name = MONTH_SHORT[monthIndex - 1];
  return name + " " + day;
}

export function escapeHtml(text) {
  return String(text)
    .split("&")
    .join("&amp;")
    .split("<")
    .join("&lt;")
    .split(">")
    .join("&gt;")
    .split('"')
    .join("&quot;");
}
