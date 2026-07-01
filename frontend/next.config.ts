import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "crestwaves-ai",
  project: "stichoh-frontend",
  silent: !process.env.CI,
});
