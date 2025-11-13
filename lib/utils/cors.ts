import { NextRequest, NextResponse } from "next/server";

// Get allowed origins from environment variable
function getAllowedOrigins(): string[] {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "http://localhost:3000";
  return allowedOriginsEnv.split(",").map((origin) => origin.trim());
}

// Validate origin against allowed origins
export function validateOrigin(origin: string | null): boolean {
  if (!origin) {
    // Allow requests with no origin (same-origin requests)
    return true;
  }

  const allowedOrigins = getAllowedOrigins();
  
  // Allow exact matches
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow localhost with any port in development
  if (process.env.NODE_ENV === "development") {
    const localhostPattern = /^https?:\/\/localhost(:\d+)?$/;
    if (localhostPattern.test(origin)) {
      return true;
    }
  }

  // Allow Vercel preview deployments (any subdomain of vercel.app)
  // This handles preview deployments automatically
  const vercelPattern = /^https:\/\/[a-z0-9-]+(-[a-z0-9]+)*\.vercel\.app$/;
  if (vercelPattern.test(origin)) {
    return true;
  }

  return false;
}

// Get CORS headers for a request
export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  const isValidOrigin = validateOrigin(origin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (isValidOrigin && origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else if (isValidOrigin) {
    // Same-origin request, no CORS headers needed
    headers["Access-Control-Allow-Origin"] = request.headers.get("host") || "*";
  } else {
    // Invalid origin - will be rejected
    headers["Access-Control-Allow-Origin"] = "null";
  }

  return headers;
}

// CORS middleware for API routes
export function corsMiddleware(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  
  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const headers = getCorsHeaders(request);
    return NextResponse.json({}, { headers });
  }

  // Validate origin for actual requests
  if (origin && !validateOrigin(origin)) {
    return NextResponse.json(
      {
        success: false,
        error: "Origin not allowed",
      },
      { status: 403 }
    );
  }

  return null; // Continue with request
}

