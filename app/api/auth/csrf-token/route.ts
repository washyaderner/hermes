import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { getCsrfToken } from "@/lib/middleware/csrf";
import { getCorsHeaders } from "@/lib/utils/cors";

// Get CSRF token for authenticated user
export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth(request);
  if (!authResult.isAuthenticated) {
    return authResult.response!;
  }

  // Get or create CSRF token
  const csrfToken = await getCsrfToken(request);

  if (!csrfToken) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate CSRF token",
      },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }

  return NextResponse.json(
    {
      success: true,
      csrfToken,
    },
    { headers: getCorsHeaders(request) }
  );
}

