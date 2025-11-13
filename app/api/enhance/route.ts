import { NextRequest, NextResponse } from "next/server";
import {
  enhancePrompt,
  generateVariations,
  explainImprovements,
  calculateImprovement,
} from "@/lib/prompt-engine/enhancer";
import { analyzePrompt } from "@/lib/prompt-engine/analyzer";
import { getPlatformById } from "@/lib/prompt-engine/platforms";
import { Tone } from "@/types";
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
  const rateLimitResult = await checkRateLimit(request, "enhance");
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }

  // Validate request size
  const sizeCheck = await validateRequestSize(request, "enhance");
  if (!sizeCheck.isValid) {
    return sizeCheck.response!;
  }

  try {
    const body = await request.json();

    // Validate parsed body size
    const bodySizeCheck = validateParsedBodySize(body, "enhance");
    if (!bodySizeCheck.isValid) {
      return bodySizeCheck.response!;
    }
    const {
      prompt,
      platformId,
      tone = "professional",
      fewShotCount = 0,
      systemMessage,
      variationCount = 2,
      datasetContent,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return validationError("Prompt is required and must be a string");
    }

    if (!platformId || typeof platformId !== "string") {
      return validationError("Platform ID is required");
    }

    const platform = getPlatformById(platformId);
    if (!platform) {
      return validationError("Invalid platform ID");
    }

    // Analyze original prompt
    const originalAnalysis = analyzePrompt(prompt);

    // Generate variations with dataset context
    const variations: string[] = [];
    for (let i = 0; i < variationCount; i++) {
      const complexity = originalAnalysis.complexity;
      const resolveAmbiguity = i >= 1; // Only resolve ambiguity for 2nd+ variations
      const fewShots = i === 2 && complexity > 5 ? 2 : i === 1 && complexity > 7 ? 3 : fewShotCount;
      const useTone = i === 2 ? "spartan" : tone;

      const enhanced = enhancePrompt(prompt, platform, {
        tone: useTone as Tone,
        fewShotCount: fewShots,
        resolveAmbiguity,
        systemMessage,
        datasetContent,
      });

      variations.push(enhanced);
    }

    // Analyze each variation and create response
    const enhancedPrompts = variations.map((enhanced, index) => {
      const enhancedAnalysis = analyzePrompt(enhanced);
      const improvements = explainImprovements(prompt, enhanced, platform);
      const improvement = calculateImprovement(
        originalAnalysis.qualityScore,
        enhancedAnalysis.qualityScore
      );

      // Determine enhancement type based on variation index
      const enhancementType = index === 0 ? "conservative" : index === 1 ? "balanced" : "aggressive";
      const usedFewShotCount = index === 2 && originalAnalysis.complexity > 5 ? 2 : index === 1 && originalAnalysis.complexity > 7 ? 3 : fewShotCount;

      return {
        id: `variation-${index + 1}-${Date.now()}`,
        original: prompt,
        enhanced,
        platform,
        qualityScore: enhancedAnalysis.qualityScore,
        improvements,
        tokenCount: enhancedAnalysis.tokenCount,
        improvement,
        analysis: enhancedAnalysis,
        // Pattern metadata for success tracking
        patternMetadata: {
          enhancementType,
          tone: index === 2 ? "spartan" : tone,
          fewShotCount: usedFewShotCount,
        },
      };
    });

    const corsHeaders = getCorsHeaders(request);
    return NextResponse.json(
      {
        success: true,
        originalAnalysis,
        enhancedPrompts,
        metadata: {
          platform: platform.name,
          tone,
          fewShotCount,
          variationCount: enhancedPrompts.length,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return serverError("Failed to enhance prompt", error);
  }
}
