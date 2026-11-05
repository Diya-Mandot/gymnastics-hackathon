import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep Next's tracing inside this repository when a parent directory has a
  // separate lockfile (as it does in the competition workspace).
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
