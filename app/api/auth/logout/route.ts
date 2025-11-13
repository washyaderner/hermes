import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, invalidateSession, clearSessionCookie } from "@/lib/auth/session-service";
import { requireCsrfToken } from "@/lib/middleware/csrf";
import { invalidateCsrfToken } from "@/lib/middleware/csrf";
import { getCorsHeaders } from "@/lib/utils/cors";
import { serverError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    // Check CSRF token
    const csrfResult = await requireCsrfToken(request);
    if (!csrfResult.isValid) {
      return csrfResult.response!;
    }

    const session = await getSessionFromCookies();

    // Invalidate session if exists
    if (session.sessionToken) {
      invalidateSession(session.sessionToken);
      // Also invalidate CSRF token
      invalidateCsrfToken(session.sessionToken);
    }

    // Clear session cookie
    await clearSessionCookie();

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { headers: getCorsHeaders(request) }
    );
  } catch (error) {
    return serverError("An error occurred during logout", error);
  }
}

