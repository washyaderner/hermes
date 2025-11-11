import { NextResponse } from "next/server";
import { platforms, getAllCategories } from "@/lib/prompt-engine/platforms";

export async function GET() {
  try {
    return NextResponse.json({
      platforms,
      categories: getAllCategories(),
      count: platforms.length,
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}
