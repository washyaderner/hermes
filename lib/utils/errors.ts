import { NextResponse } from "next/server";

// Error types for different scenarios
export enum ErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  RATE_LIMIT = "rate_limit",
  REQUEST_TOO_LARGE = "request_too_large",
  SERVER_ERROR = "server_error",
}

// Generic error response structure
interface ErrorResponse {
  success: false;
  error: string;
  errorType?: ErrorType;
  details?: Record<string, unknown>;
}

// Create generic error response for clients
export function createErrorResponse(
  errorType: ErrorType,
  message: string,
  statusCode: number,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  // Log detailed error server-side (without sensitive data)
  const logData = {
    errorType,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  // Don't log sensitive information
  if (errorType !== ErrorType.AUTHENTICATION && errorType !== ErrorType.AUTHORIZATION) {
    console.error("API Error:", logData);
  } else {
    // Log auth errors with minimal info
    console.warn("Auth Error:", { errorType, statusCode, timestamp: logData.timestamp });
  }

  // Return generic error message to client
  const response: ErrorResponse = {
    success: false,
    error: message,
    errorType,
  };

  // Only include non-sensitive details
  if (details && Object.keys(details).length > 0) {
    const safeDetails: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(details)) {
      // Filter out sensitive fields
      if (
        !key.toLowerCase().includes("password") &&
        !key.toLowerCase().includes("token") &&
        !key.toLowerCase().includes("secret") &&
        !key.toLowerCase().includes("key")
      ) {
        safeDetails[key] = value;
      }
    }
    if (Object.keys(safeDetails).length > 0) {
      response.details = safeDetails;
    }
  }

  return NextResponse.json(response, { status: statusCode });
}

// Validation error
export function validationError(
  message: string = "Invalid input",
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return createErrorResponse(ErrorType.VALIDATION, message, 400, details);
}

// Authentication error
export function authenticationError(
  message: string = "Authentication required"
): NextResponse<ErrorResponse> {
  return createErrorResponse(ErrorType.AUTHENTICATION, message, 401);
}

// Authorization error
export function authorizationError(
  message: string = "Insufficient permissions"
): NextResponse<ErrorResponse> {
  return createErrorResponse(ErrorType.AUTHORIZATION, message, 403);
}

// Not found error
export function notFoundError(
  message: string = "Resource not found"
): NextResponse<ErrorResponse> {
  return createErrorResponse(ErrorType.NOT_FOUND, message, 404);
}

// Rate limit error
export function rateLimitError(retryAfter: number): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Rate limit exceeded",
      errorType: ErrorType.RATE_LIMIT,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

// Request too large error
export function requestTooLargeError(
  message: string = "Request payload too large"
): NextResponse<ErrorResponse> {
  return createErrorResponse(ErrorType.REQUEST_TOO_LARGE, message, 413);
}

// Server error (generic)
export function serverError(
  message: string = "An error occurred",
  originalError?: unknown
): NextResponse<ErrorResponse> {
  // Log full error details server-side
  if (originalError) {
    console.error("Server Error:", {
      message,
      error: originalError instanceof Error ? originalError.message : String(originalError),
      stack: originalError instanceof Error ? originalError.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  // Return generic message to client
  return createErrorResponse(ErrorType.SERVER_ERROR, message, 500);
}

// Wrap async route handlers with error handling
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return serverError("An error occurred", error);
    }
  };
}

