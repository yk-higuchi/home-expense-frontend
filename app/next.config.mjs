import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const nextConfig = {
  output: "standalone",
  transpilePackages: ["@home-expense/ui"],
  outputFileTracingRoot: workspaceRoot,
  reactCompiler: true,
};

export default nextConfig;
