/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow the v0 preview hosts to reach Next.js dev resources (HMR). Without
  // this, hot updates are blocked and the preview stays frozen on stale code.
  allowedDevOrigins: ["*.vusercontent.net", "*.v0.app", "*.v0.dev"],
}

export default nextConfig
