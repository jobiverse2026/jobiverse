const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const IST_OFFSET_MS = 330 * 60 * 1000;

function asIst(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Date(date.getTime() + IST_OFFSET_MS);
}

export function formatIndiaDate(dateInput: string | Date) {
  const date = asIst(dateInput);
  return `${WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatIndiaTime(dateInput: string | Date) {
  const date = asIst(dateInput);
  const hour24 = date.getUTCHours();
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const hour12 = hour24 % 12 || 12;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minute} ${meridiem}`;
}

export function formatIndiaDateTime(dateInput: string | Date) {
  return `${formatIndiaDate(dateInput)}, ${formatIndiaTime(dateInput)}`;
}

export function getTodayIstRange(now = new Date()) {
  const ist = asIst(now);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  const start = new Date(`${y}-${m}-${d}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function getFutureIstRange(days = 30) {
  const { start } = getTodayIstRange();
  return { start, end: new Date(start.getTime() + days * 24 * 60 * 60 * 1000) };
}
