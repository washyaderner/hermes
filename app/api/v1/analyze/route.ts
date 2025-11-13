import { NextRequest, NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/prompt-engine/analyzer";
import { requireAuth } from "@/lib/middleware/auth";
import { checkRateLimit } from "@/lib/middleware/rateLimit";
import { corsMiddleware, getCorsHeaders } from "@/lib/utils/cors";
import { validateRequestSize, validateParsedBodySize } from "@/lib/middleware/requestSize";
import { requireCsrfToken } from "@/lib/middleware/csrf";
import { validationError, serverError } from "@/lib/utils/errors";

export async function OPTIONS(request: NextRequest) {
  const corsResponse = corsMiddleware(request);
  return corsResponse || NextResponse.json({}, { headers: getCorsHeaders(request) });
}

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
    const requestBody = await request.json();

    // Validate parsed body size
    const bodySizeCheck = validateParsedBodySize(requestBody, "analyze");
    if (!bodySizeCheck.isValid) {
      return bodySizeCheck.response!;
    }

    const { prompt } = requestBody;

    // Validate required fields
    if (!prompt || typeof prompt !== "string") {
      return validationError("Prompt is required and must be a string");
    }

    // Perform prompt analysis
    const promptAnalysisResult = analyzePrompt(prompt);

    const analysisResponseStructure = {
      success: true,
      prompt,
      analysis: {
        intent: promptAnalysisResult.intent,
        domain: promptAnalysisResult.domain,
        complexity: promptAnalysisResult.complexity,
        qualityScore: promptAnalysisResult.qualityScore,
        tokenCount: promptAnalysisResult.tokenCount,
        missingComponents: promptAnalysisResult.missingComponents,
        conflicts: promptAnalysisResult.conflicts,
        painPoint: promptAnalysisResult.painPoint,
      },
      recommendations: {
        suggestedImprovements: promptAnalysisResult.missingComponents.map((component) => ({
          component,
          reason: `Adding ${component} will improve prompt clarity and effectiveness`,
        })),
        conflictsToResolve: promptAnalysisResult.conflicts.map((conflict) => ({
          conflict,
          suggestion: `Resolve this conflict to ensure consistent prompt behavior`,
        })),
      },
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    };

    return NextResponse.json(analysisResponseStructure, { headers: getCorsHeaders(request) });
  } catch (error) {
    return serverError("Failed to analyze prompt", error);
  }
}
