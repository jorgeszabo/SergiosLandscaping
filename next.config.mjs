/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The server data layer (postgres.js) only loads when DATABASE_URL is
  // present. Keep the driver external so the serverless bundle stays lean.
  serverExternalPackages: ["postgres", "bcryptjs"],
};

export default nextConfig;
