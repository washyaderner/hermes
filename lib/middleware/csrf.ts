import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session-service";
import crypto from "crypto";
import { authorizationError } from "@/lib/utils/errors";

// CSRF token store (in-memory, replace with Redis in production)
// Format: { sessionToken: csrfToken }
const csrfTokenStore = new Map<string, string>();

// Clean up expired tokens periodically (when session expires)
setInterval(() => {
  // Tokens are cleaned up when sessions expire
  // This is just a safety cleanup
  const now = Date.now();
  // Tokens are tied to sessions, so they'll be cleaned up with sessions
}, 5 * 60 * 1000); // Every 5 minutes

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Get or create CSRF token for session
export async function getCsrfToken(request: NextRequest): Promise<string | null> {
  const session = await getSessionFromCookies();
  
  if (!session.isValid || !session.sessionToken) {
    return null;
  }

  // Return existing token or create new one
  let token = csrfTokenStore.get(session.sessionToken);
  if (!token) {
    token = generateCsrfToken();
    csrfTokenStore.set(session.sessionToken, token);
  }

  return token;
}

// Validate CSRF token
export async function validateCsrfToken(
  request: NextRequest,
  providedToken: string | null
): Promise<{
  isValid: boolean;
  response?: NextResponse;
}> {
  const session = await getSessionFromCookies();

  if (!session.isValid || !session.sessionToken) {
    return {
      isValid: false,
      response: authorizationError("Invalid session"),
    };
  }

  if (!providedToken) {
    return {
      isValid: false,
      response: authorizationError("CSRF token required"),
    };
  }

  const expectedToken = csrfTokenStore.get(session.sessionToken);

  if (!expectedToken) {
    return {
      isValid: false,
      response: authorizationError("CSRF token not found"),
    };
  }

  // Use constant-time comparison to prevent timing attacks
  // Ensure both tokens are the same length before comparing
  if (providedToken.length !== expectedToken.length) {
    return {
      isValid: false,
      response: authorizationError("Invalid CSRF token"),
    };
  }

  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(providedToken, "hex"),
      Buffer.from(expectedToken, "hex")
    );
  } catch (error) {
    // Invalid hex encoding
    return {
      isValid: false,
      response: authorizationError("Invalid CSRF token format"),
    };
  }

  if (!isValid) {
    return {
      isValid: false,
      response: authorizationError("Invalid CSRF token"),
    };
  }

  return { isValid: true };
}

// Invalidate CSRF token (on logout or session invalidation)
export function invalidateCsrfToken(sessionToken: string): void {
  csrfTokenStore.delete(sessionToken);
}

// Invalidate all CSRF tokens for a user (on password reset, etc.)
export function invalidateAllUserCsrfTokens(username: string): void {
  // This would need to iterate through sessions to find user's tokens
  // For now, tokens are tied to sessions, so invalidating sessions handles this
}

// CSRF middleware for state-changing operations
export async function requireCsrfToken(
  request: NextRequest
): Promise<{
  isValid: boolean;
  response?: NextResponse;
}> {
  // Only require CSRF for state-changing methods
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!stateChangingMethods.includes(request.method)) {
    return { isValid: true };
  }

  // Get CSRF token from header or body
  const csrfTokenFromHeader = request.headers.get("x-csrf-token");
  const body = await request.clone().json().catch(() => ({}));
  const csrfTokenFromBody = (body as { csrfToken?: string }).csrfToken;
  const providedToken = csrfTokenFromHeader || csrfTokenFromBody || null;

  return validateCsrfToken(request, providedToken);
}

