import { NextRequest, NextResponse } from "next/server";
import { platforms } from "@/lib/prompt-engine/platforms";

// CORS headers for automation platforms
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
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

    return NextResponse.json(platformResponseStructure, { headers: corsHeaders });
  } catch (error) {
    console.error("Error retrieving platform configurations:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to retrieve platforms" 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
