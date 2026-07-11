/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The server data layer (postgres.js) only loads when DATABASE_URL is
  // present. Keep the driver external so the serverless bundle stays lean.
  serverExternalPackages: ["postgres", "bcryptjs"],
  // Emit a self-contained server bundle (.next/standalone) so the app can be
  // run anywhere with `node server.js` — used by the Docker image for
  // self-hosting. Ignored by Vercel, which manages its own output. See
  // docs/SELF_HOSTING.md.
  output: "standalone",
};

export default nextConfig;
