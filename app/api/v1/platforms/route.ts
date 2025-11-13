import { NextRequest, NextResponse } from "next/server";
import { platforms } from "@/lib/prompt-engine/platforms";
import { requireAuth } from "@/lib/middleware/auth";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { corsMiddleware, getCorsHeaders } from "@/lib/utils/cors";
import { validateRequestSize } from "@/lib/middleware/requestSize";
import { serverError } from "@/lib/utils/errors";

export async function OPTIONS(request: NextRequest) {
  const corsResponse = corsMiddleware(request);
  return corsResponse || NextResponse.json({}, { headers: getCorsHeaders(request) });
}

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
    const allPlatformConfigurations = platforms;

    const platformResponseStructure = {
      success: true,
      platforms: allPlatformConfigurations,
      metadata: {
        totalCount: allPlatformConfigurations.length,
        categories: Array.from(
          new Set(allPlatformConfigurations.map((p) => p.category))
        ),
        apiFormats: Array.from(
          new Set(allPlatformConfigurations.map((p) => p.apiFormat))
        ),
      },
    };

    return NextResponse.json(platformResponseStructure, { headers: getCorsHeaders(request) });
  } catch (error) {
    return serverError("Failed to retrieve platforms", error);
  }
}
