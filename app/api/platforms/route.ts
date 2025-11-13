import { NextRequest, NextResponse } from "next/server";
import { platforms, getAllCategories } from "@/lib/prompt-engine/platforms";
import { requireAuth } from "@/lib/middleware/auth";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { corsMiddleware, getCorsHeaders } from "@/lib/utils/cors";
import { validateRequestSize } from "@/lib/middleware/requestSize";
import { serverError } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return corsResponse;
  }

  // Check authentication
  const authResult = await requireAuth(request);
  if (!authResult.isAuthenticated) {
    return authResult.response!;
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, "default");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  // Validate request size (for GET requests, this is minimal)
  const sizeCheck = await validateRequestSize(request, "platforms");
  if (!sizeCheck.isValid) {
    return sizeCheck.response!;
  }

  try {
    return NextResponse.json(
      {
        platforms,
        categories: getAllCategories(),
        count: platforms.length,
      },
      { headers: getCorsHeaders(request) }
    );
  } catch (error) {
    return serverError("Failed to fetch platforms", error);
  }
}
