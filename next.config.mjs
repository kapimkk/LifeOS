/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Security headers applied to every response.
 * References: https://owasp.org/www-project-secure-headers/
 */
const securityHeaders = [
  // Prevent MIME-type sniffing (XSS vector)
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Deny framing entirely to block clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },

  // Legacy XSS filter for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },

  // Referrer policy: send origin only on same-origin, nothing cross-origin
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Permissions policy: disable unused browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },

  // HSTS: enforce HTTPS for 1 year, include subdomains (production only)
  ...(!isDev
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
      ]
    : []),

  // Content-Security-Policy
  // 'unsafe-inline' is required for Tailwind CSS runtime styles in dev.
  // In production you would add a nonce-based approach or hash allowlist.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: allow self + Next.js inline bootstrap
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: allow self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline'",
      // Images: allow self, data URIs and the remote patterns already configured
      "img-src 'self' data: blob: https:",
      // Fonts
      "font-src 'self'",
      // API calls are same-origin only
      "connect-src 'self'",
      // No plugins
      "object-src 'none'",
      // Prevent base-tag hijacking
      "base-uri 'self'",
      // Block mixed content
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
