import { cookies } from "next/headers";
import crypto from "crypto";

// Session configuration
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const SESSION_COOKIE_NAME = "hermes_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_TIMEOUT_MS / 1000, // Convert to seconds
  path: "/",
};

// In-memory session store (replace with Redis in production)
// Format: { sessionToken: { username, createdAt, lastActivity } }
const sessionStore = new Map<string, {
  username: string;
  createdAt: Date;
  lastActivity: Date;
}>();

// Clean up expired sessions periodically
setInterval(() => {
  const now = new Date();
  const entries = Array.from(sessionStore.entries());
  for (const [token, session] of entries) {
    const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
    if (timeSinceActivity > SESSION_TIMEOUT_MS) {
      sessionStore.delete(token);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Generate secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Create session for user
export async function createSession(username: string): Promise<string> {
  const sessionToken = generateSessionToken();
  const now = new Date();

  sessionStore.set(sessionToken, {
    username,
    createdAt: now,
    lastActivity: now,
  });

  return sessionToken;
}

// Verify and refresh session
export function verifySession(sessionToken: string): {
  isValid: boolean;
  username?: string;
  error?: string;
} {
  const session = sessionStore.get(sessionToken);
  if (!session) {
    return {
      isValid: false,
      error: "Invalid session",
    };
  }

  // Check if session has expired
  const now = new Date();
  const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
  if (timeSinceActivity > SESSION_TIMEOUT_MS) {
    sessionStore.delete(sessionToken);
    return {
      isValid: false,
      error: "Session expired",
    };
  }

  // Update last activity
  session.lastActivity = now;

  return {
    isValid: true,
    username: session.username,
  };
}

// Invalidate session
export function invalidateSession(sessionToken: string): void {
  sessionStore.delete(sessionToken);
  // Also invalidate CSRF token if CSRF module is available
  try {
    const { invalidateCsrfToken } = require("@/lib/middleware/csrf");
    invalidateCsrfToken(sessionToken);
  } catch {
    // CSRF module might not be loaded yet, ignore
  }
}

// Invalidate all sessions for a user
export function invalidateAllUserSessions(username: string): void {
  const entries = Array.from(sessionStore.entries());
  for (const [token, session] of entries) {
    if (session.username === username) {
      sessionStore.delete(token);
    }
  }
}

// Get session from cookies
export async function getSessionFromCookies(): Promise<{
  sessionToken: string | null;
  username: string | null;
  isValid: boolean;
}> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;

    if (!sessionToken) {
      return { sessionToken: null, username: null, isValid: false };
    }

    const verification = verifySession(sessionToken);
    return {
      sessionToken,
      username: verification.username || null,
      isValid: verification.isValid,
    };
  } catch (error) {
    return { sessionToken: null, username: null, isValid: false };
  }
}

// Set session cookie
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Regenerate session token (on login)
export async function regenerateSession(username: string): Promise<string> {
  // Invalidate old sessions for this user
  invalidateAllUserSessions(username);

  // Create new session
  return createSession(username);
}

