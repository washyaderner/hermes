// Client-side CSRF token management
// This utility helps fetch and include CSRF tokens in API requests

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

// Fetch CSRF token from server
export async function fetchCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  // Return existing promise if already fetching
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // Fetch new token
  csrfTokenPromise = (async () => {
    try {
      const response = await fetch("/api/auth/csrf-token", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }

      const data = await response.json();
      if (!data.success || !data.csrfToken) {
        throw new Error("Invalid CSRF token response");
      }

      csrfTokenCache = data.csrfToken;
      return data.csrfToken;
    } catch (error) {
      csrfTokenPromise = null;
      throw error;
    }
  })();

  return csrfTokenPromise;
}

// Clear CSRF token cache (call on logout)
export function clearCsrfToken(): void {
  csrfTokenCache = null;
  csrfTokenPromise = null;
}

// Get CSRF token header for API requests
export async function getCsrfHeader(): Promise<Record<string, string>> {
  const token = await fetchCsrfToken();
  return {
    "X-CSRF-Token": token,
  };
}

// Enhanced fetch with CSRF token
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfHeaders = await getCsrfHeader();
  const headers = {
    ...options.headers,
    ...csrfHeaders,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // Always include cookies
  });
}

