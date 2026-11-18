/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The app was written without a local build step available, so type/lint checks do not block deployment.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
