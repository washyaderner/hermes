/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Request size limits to prevent DoS attacks
  api: {
    bodyParser: {
      sizeLimit: "10kb", // Limit for prompt inputs
    },
    responseLimit: "10mb", // Limit for responses
  },
  // Security headers
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    
    // Content Security Policy
    // Allow self, inline styles (Tailwind), and blob/data URIs for downloads
    // In production, remove 'unsafe-inline' and 'unsafe-eval' if possible
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'", // API routes
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests", // Force HTTPS in production
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Strict-Transport-Security (HSTS) - only in production with HTTPS
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

module.exports = nextConfig;
