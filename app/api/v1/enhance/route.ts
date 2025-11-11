import { NextRequest, NextResponse } from "next/server";
import { analyzePrompt, countTokens } from "@/lib/prompt-engine/analyzer";
import { enhancePrompt } from "@/lib/prompt-engine/enhancer";
import { getPlatformById } from "@/lib/prompt-engine/platforms";
import { generateId } from "@/lib/utils";
import { UserSettings, Tone } from "@/types";

// CORS headers for automation platforms
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { prompt, platform: platformId, settings = {} } = requestBody;

    // Validate required fields
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required and must be a string"
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!platformId || typeof platformId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Platform ID is required and must be a string"
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Retrieve platform configuration
    const platformConfigurationData = getPlatformById(platformId);
    if (!platformConfigurationData) {
      return NextResponse.json(
        {
          success: false,
          error: `Platform with ID "${platformId}" not found`
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Parse user settings with defaults
    const userSettingsConfiguration: UserSettings = {
      temperature: settings.temperature ?? 0.7,
      maxTokens: settings.maxTokens ?? 2000,
      tone: (settings.tone as Tone) ?? "professional",
      outputFormats: settings.outputFormats ?? ["markdown"],
      fewShotEnabled: settings.fewShotEnabled ?? false,
      fewShotCount: settings.fewShotCount ?? 0,
      systemMessageEnabled: settings.systemMessageEnabled ?? false,
      customSystemMessage: settings.customSystemMessage ?? "",
    };

    // Perform initial prompt analysis
    const originalAnalysisResult = analyzePrompt(prompt);

    // Determine variation count based on prompt complexity
    const promptComplexity = originalAnalysisResult.complexity;
    const variationCount = promptComplexity >= 7 ? 3 : promptComplexity >= 4 ? 2 : 1;

    // Generate enhanced variations with high-verbosity naming
    const enhancedVariations: string[] = [];
    for (let variationIndex = 0; variationIndex < variationCount; variationIndex++) {
      const enhancementOptions = {
        tone: userSettingsConfiguration.tone,
        fewShotCount: userSettingsConfiguration.fewShotEnabled
          ? userSettingsConfiguration.fewShotCount
          : 0,
        systemMessage: userSettingsConfiguration.systemMessageEnabled
          ? userSettingsConfiguration.customSystemMessage
          : undefined,
        resolveAmbiguity: variationIndex > 0, // Resolve ambiguity for variations 2+
      };

      const enhancedPromptText = enhancePrompt(
        prompt,
        platformConfigurationData,
        enhancementOptions
      );
      enhancedVariations.push(enhancedPromptText);
    }

    // Build enhanced prompts with analysis
    const enhancedPromptsWithAnalysis = enhancedVariations.map((enhancedText, index) => {
      const enhancedTokenCount = countTokens(enhancedText);
      const improvementsList = [];

      if (enhancedText.length > prompt.length * 1.2) {
        improvementsList.push("Added contextual details for clarity");
      }
      if (enhancedText.includes("Step") || enhancedText.includes("First")) {
        improvementsList.push("Structured into clear steps");
      }
      if (userSettingsConfiguration.tone !== "professional") {
        improvementsList.push(`Applied ${userSettingsConfiguration.tone} tone`);
      }
      if (userSettingsConfiguration.fewShotEnabled) {
        improvementsList.push(`Included ${userSettingsConfiguration.fewShotCount} example(s)`);
      }

      // Calculate quality score (base score + enhancements)
      let qualityScore = originalAnalysisResult.qualityScore;
      qualityScore += improvementsList.length * 5;
      qualityScore += variationCount > 1 ? 10 - index * 5 : 0;
      qualityScore = Math.min(100, qualityScore);

      return {
        id: generateId(),
        original: prompt,
        enhanced: enhancedText,
        platform: platformConfigurationData,
        qualityScore,
        improvements: improvementsList,
        tokenCount: enhancedTokenCount,
        createdAt: new Date().toISOString(),
      };
    });

    // Sort by quality score (highest first)
    enhancedPromptsWithAnalysis.sort((a, b) => b.qualityScore - a.qualityScore);

    const analysisResponseStructure = {
      success: true,
      original: prompt,
      enhanced: enhancedPromptsWithAnalysis,
      scores: {
        inputQuality: originalAnalysisResult.qualityScore,
        outputQuality: enhancedPromptsWithAnalysis[0]?.qualityScore ?? 0,
        tokenOptimization: Math.round(
          (countTokens(prompt) /
          (enhancedPromptsWithAnalysis[0]?.tokenCount ?? 1)) * 100
        ),
      },
      metadata: {
        platform: platformConfigurationData.name,
        variationCount: enhancedPromptsWithAnalysis.length,
        appliedSettings: userSettingsConfiguration,
        processedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    };

    return NextResponse.json(analysisResponseStructure, { headers: corsHeaders });
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to enhance prompt"
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
