/** Parse YYYY-MM-DD to a UTC date at midnight. */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/** Format a Date as YYYY-MM-DD (UTC). */
export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** ISO datetime → YYYY-MM-DD (UTC). */
export function toIsoDate(isoDateTime: string): string {
  return isoDateTime.slice(0, 10)
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return formatIsoDate(date)
}

export function daysBetween(startIsoDate: string, endIsoDate: string): number {
  const start = parseIsoDate(startIsoDate).getTime()
  const end = parseIsoDate(endIsoDate).getTime()
  return Math.round((end - start) / 86_400_000)
}

export function isYesterday(activityDate: string, today: string): boolean {
  return addDays(today, -1) === activityDate
}
