/** Deliberately simple: enough to reject typos, not a full RFC 5322 check. */
export function isValidEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
