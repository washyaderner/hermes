import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/user-service";
import { regenerateSession, setSessionCookie } from "@/lib/auth/session-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Username is required",
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Password is required",
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await authenticateUser(username, password);

    if (!authResult.success) {
      // Return generic error message (don't reveal if account is locked)
      const errorMessage = authResult.lockUntil
        ? "Too many failed login attempts. Please try again later."
        : "Invalid credentials";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          ...(authResult.attemptsRemaining !== undefined && {
            attemptsRemaining: authResult.attemptsRemaining,
          }),
        },
        { status: 401 }
      );
    }

    // Create new session
    const sessionToken = await regenerateSession(username);
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      username,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during login",
      },
      { status: 500 }
    );
  }
}

