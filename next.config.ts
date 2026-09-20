import type { NextConfig } from "next";

// Public base URL of the media bucket/CDN (see .env.example). Used to allow
// next/image to optimise remote media. Empty until storage is configured.
const media = process.env.NEXT_PUBLIC_MEDIA_URL
  ? new URL(process.env.NEXT_PUBLIC_MEDIA_URL)
  : null;

// Baseline security headers. A nonce-based Content-Security-Policy is added in
// Step 10 (performance + hardening) once all scripts/embeds are known.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: media
      ? [
          {
            protocol: media.protocol.replace(":", "") as "http" | "https",
            hostname: media.hostname,
            pathname: "/**",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
