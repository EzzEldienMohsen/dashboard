// Plain constants only (no secrets, no server-only APIs) — imported from
// both RSC/Server Action contexts (session.ts, actions.ts) and proxy.ts,
// which runs in a distinct execution context that "server-only" isn't
// meant to gate.
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60; // matches JWT_EXPIRES_IN=1h default
