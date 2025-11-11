import { NextRequest, NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/prompt-engine/analyzer";

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
    const { prompt } = requestBody;

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

    return NextResponse.json(analysisResponseStructure, { headers: corsHeaders });
  } catch (error) {
    console.error("Error analyzing prompt:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to analyze prompt" 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
