import { NextRequest, NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/prompt-engine/analyzer";
import { requireAuth } from "@/lib/middleware/auth";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { corsMiddleware, getCorsHeaders } from "@/lib/utils/cors";
import { validateRequestSize, validateParsedBodySize } from "@/lib/middleware/requestSize";
import { requireCsrfToken } from "@/lib/middleware/csrf";
import { validationError, serverError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
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

  // Check CSRF token
  const csrfResult = await requireCsrfToken(request);
  if (!csrfResult.isValid) {
    return csrfResult.response!;
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, "analyze");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  // Validate request size
  const sizeCheck = await validateRequestSize(request, "analyze");
  if (!sizeCheck.isValid) {
    return sizeCheck.response!;
  }

  try {
    const body = await request.json();

    // Validate parsed body size
    const bodySizeCheck = validateParsedBodySize(body, "analyze");
    if (!bodySizeCheck.isValid) {
      return bodySizeCheck.response!;
    }

    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return validationError("Prompt is required and must be a string");
    }

    const analysis = analyzePrompt(prompt);

    return NextResponse.json(
      {
        success: true,
        analysis,
      },
      { headers: getCorsHeaders(request) }
    );
  } catch (error) {
    return serverError("Failed to analyze prompt", error);
  }
}
