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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      platformId,
      tone = "professional",
      fewShotCount = 0,
      systemMessage,
      variationCount = 2,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (!platformId || typeof platformId !== "string") {
      return NextResponse.json(
        { error: "Platform ID is required" },
        { status: 400 }
      );
    }

    const platform = getPlatformById(platformId);
    if (!platform) {
      return NextResponse.json(
        { error: "Invalid platform ID" },
        { status: 400 }
      );
    }

    // Analyze original prompt
    const originalAnalysis = analyzePrompt(prompt);

    // Generate variations
    const variations = generateVariations(prompt, platform, variationCount);

    // Analyze each variation and create response
    const enhancedPrompts = variations.map((enhanced, index) => {
      const enhancedAnalysis = analyzePrompt(enhanced);
      const improvements = explainImprovements(prompt, enhanced, platform);
      const improvement = calculateImprovement(
        originalAnalysis.qualityScore,
        enhancedAnalysis.qualityScore
      );

      return {
        id: `variation-${index + 1}`,
        original: prompt,
        enhanced,
        platform,
        qualityScore: enhancedAnalysis.qualityScore,
        improvements,
        tokenCount: enhancedAnalysis.tokenCount,
        improvement,
        analysis: enhancedAnalysis,
      };
    });

    return NextResponse.json({
      success: true,
      originalAnalysis,
      enhancedPrompts,
      metadata: {
        platform: platform.name,
        tone,
        fewShotCount,
        variationCount: enhancedPrompts.length,
      },
    });
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
