/** Dates are kept as ISO strings (YYYY-MM-DD or full timestamps) and formatted at the edge. */

export function todayIso(now = new Date()): string {
  return toIsoDate(now)
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

/** Adds working days, skipping Saturdays and Sundays. */
export function addWorkingDays(iso: string, days: number): string {
  const date = parseIsoDate(iso)
  let left = days
  while (left > 0) {
    date.setDate(date.getDate() + 1)
    const weekday = date.getDay()
    if (weekday !== 0 && weekday !== 6) left--
  }
  return toIsoDate(date)
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()
  return Math.round(ms / 86_400_000)
}

export function formatDate(iso: string, locale = 'en-GB', withYear = true): string {
  const options: Intl.DateTimeFormatOptions = withYear
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { day: 'numeric', month: 'short' }
  try {
    return new Intl.DateTimeFormat(locale, options).format(parseIsoDate(iso))
  } catch {
    return new Intl.DateTimeFormat('en-GB', options).format(parseIsoDate(iso))
  }
}

export function formatTime(isoTimestamp: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(isoTimestamp))
}
