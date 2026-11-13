/**
 * Where signups are POSTed. Set VITE_WAITLIST_URL at build time to a form
 * endpoint that accepts JSON (Formspree, Buttondown, a Google Apps Script...).
 * When unset, the form and its surrounding card are not rendered in production.
 */
export const WAITLIST_URL = import.meta.env.VITE_WAITLIST_URL as string | undefined

export const waitlistVisible = Boolean(WAITLIST_URL) || import.meta.env.DEV
