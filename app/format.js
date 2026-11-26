// Formatting: every dollar amount and date on the site passes through
// here, so "$1,450" always looks the same wherever it appears.

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const USD_CENTS = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function asNumber(amount) {
  const value = Number(amount);
  return Number.isFinite(value) ? value : 0;
}

export function money(amount, withCents = false) {
  const formatter = withCents ? USD_CENTS : USD;
  return formatter.format(asNumber(amount));
}

export function signedMoney(amount, withCents = false) {
  const value = asNumber(amount);
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${money(Math.abs(value), withCents)}`;
}

export function percent(part, whole) {
  if (!whole) return '0%';
  return `${Math.round((asNumber(part) / asNumber(whole)) * 100)}%`;
}

const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function prettyDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  const monthName = MONTH_ABBREV[(month || 1) - 1];
  return `${monthName} ${day}`;
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (char) => ESCAPES[char]);
}
