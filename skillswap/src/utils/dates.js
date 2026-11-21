// Small date helpers. Dates are stored as ISO "YYYY-MM-DD" strings.

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function todayISO() {
  return toISODate(new Date());
}

export function isoInDays(days) {
  return toISODate(addDays(new Date(), days));
}

export function dayOfWeek(iso) {
  return DOW[fromISODate(iso).getDay()];
}

export function formatShort(iso) {
  const d = fromISODate(iso);
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatLong(iso) {
  const d = fromISODate(iso);
  const longDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${longDays[d.getDay()]}, ${d.getDate()} ${longMonths[d.getMonth()]}`;
}

export function monthDay(iso) {
  const d = fromISODate(iso);
  return { dow: DOW[d.getDay()].toUpperCase(), day: d.getDate(), month: MONTHS[d.getMonth()] };
}

export function monthYear(iso) {
  const d = fromISODate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Converts a Date's weekday to the Monday-first labels used in availability.
export function mondayFirstDow(date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

export function timeToSlot(time) {
  const hour = Number(time.split(':')[0]);
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export function relativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function clockTime(timestamp) {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
