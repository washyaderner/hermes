import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session-service";

// Authentication middleware for API routes
export async function requireAuth(
  request: NextRequest
): Promise<{
  isAuthenticated: boolean;
  username: string | null;
  response?: NextResponse;
}> {
  // Bypass authentication in development mode for local testing
  if (process.env.NODE_ENV === "development") {
    return {
      isAuthenticated: true,
      username: "dev-user",
    };
  }

  const session = await getSessionFromCookies();

  if (!session.isValid || !session.username) {
    return {
      isAuthenticated: false,
      username: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      ),
    };
  }

  return {
    isAuthenticated: true,
    username: session.username,
  };
}

// Optional auth - returns username if authenticated, but doesn't require it
export async function optionalAuth(
  request: NextRequest
): Promise<{
  isAuthenticated: boolean;
  username: string | null;
}> {
  const session = await getSessionFromCookies();

  return {
    isAuthenticated: session.isValid,
    username: session.username || null,
  };
}

