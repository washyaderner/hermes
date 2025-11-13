import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session-service";

// Rate limit configuration
const RATE_LIMITS = {
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  enhance: {
    maxRequests: 50, // More expensive operation
    windowMs: 60 * 1000,
  },
  analyze: {
    maxRequests: 200, // Cheaper operation
    windowMs: 60 * 1000,
  },
};

// In-memory rate limit store (replace with Redis in production)
// Format: { identifier: { count, resetTime } }
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
}>();

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [identifier, entry] of entries) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(identifier);
    }
  }
}, 60 * 1000); // Clean up every minute

// Get rate limit identifier (username or IP)
async function getRateLimitIdentifier(request: NextRequest): Promise<string> {
  // Try to get username from session first
  const session = await getSessionFromCookies();
  if (session.username) {
    return `user:${session.username}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

// Check rate limit
export async function checkRateLimit(
  request: NextRequest,
  endpoint: "default" | "enhance" | "analyze" = "default"
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  response?: NextResponse;
}> {
  const identifier = await getRateLimitIdentifier(request);
  const limit = RATE_LIMITS[endpoint];
  const now = Date.now();

  let entry = rateLimitStore.get(identifier);

  // Initialize or reset if window expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + limit.windowMs,
    };
    rateLimitStore.set(identifier, entry);
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > limit.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      response: NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": limit.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": entry.resetTime.toString(),
          },
        }
      ),
    };
  }

  return {
    allowed: true,
    remaining: limit.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

