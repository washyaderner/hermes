import { NextRequest, NextResponse } from "next/server";
import { requestTooLargeError } from "@/lib/utils/errors";

// Request size limits per endpoint (in bytes)
const REQUEST_SIZE_LIMITS = {
  default: 10 * 1024, // 10KB
  enhance: 50 * 1024, // 50KB (allows for larger prompts with context)
  analyze: 20 * 1024, // 20KB
  platforms: 1 * 1024, // 1KB (GET request, minimal payload)
};

// Check request size
export async function validateRequestSize(
  request: NextRequest,
  endpoint: "default" | "enhance" | "analyze" | "platforms" = "default"
): Promise<{
  isValid: boolean;
  response?: NextResponse;
}> {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    // If no content-length header, we can't validate upfront
    // The body parser will handle it
    return { isValid: true };
  }

  const requestSize = parseInt(contentLength, 10);
  const limit = REQUEST_SIZE_LIMITS[endpoint];

  if (requestSize > limit) {
    return {
      isValid: false,
      response: requestTooLargeError(
        `Request payload exceeds maximum size of ${limit / 1024}KB`
      ),
    };
  }

  return { isValid: true };
}

// Validate request body size after parsing (for cases without content-length)
export function validateParsedBodySize(
  body: unknown,
  endpoint: "default" | "enhance" | "analyze" | "platforms" = "default"
): {
  isValid: boolean;
  response?: NextResponse;
} {
  const bodyString = JSON.stringify(body);
  const bodySize = Buffer.byteLength(bodyString, "utf8");
  const limit = REQUEST_SIZE_LIMITS[endpoint];

  if (bodySize > limit) {
    return {
      isValid: false,
      response: requestTooLargeError(
        `Request payload exceeds maximum size of ${limit / 1024}KB`
      ),
    };
  }

  return { isValid: true };
}

