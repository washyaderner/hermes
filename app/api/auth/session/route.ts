import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session-service";

// Check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();

    if (!session.isValid || !session.username) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      username: session.username,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "An error occurred",
      },
      { status: 500 }
    );
  }
}

