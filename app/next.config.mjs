import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // 部品ライブラリ（packages/ui）を TypeScript のまま取り込む
  transpilePackages: ["@home-expense/ui"],
  // モノレポのルートを基準に standalone 出力を作る
  outputFileTracingRoot: workspaceRoot,
  // React Compiler で再レンダーの最適化を自動化する（useCallback / useMemo を手で書かない）
  reactCompiler: true,
};

export default nextConfig;
