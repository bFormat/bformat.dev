#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${project_root}"

npm run build

pages_output="${project_root}/dist/pages"
rm -rf "${pages_output}"
mkdir -p "${pages_output}"
cp -R "${project_root}/dist/client/." "${pages_output}/"

"${project_root}/node_modules/.bin/esbuild" \
  "${project_root}/worker/pages.ts" \
  --bundle \
  --format=esm \
  --platform=browser \
  --outfile="${pages_output}/_worker.js" \
  '--external:node:*'

node --input-type=module - "${pages_output}/_worker.js" <<'NODE'
import { readFile, writeFile } from "node:fs/promises";

const workerPath = process.argv[2];
const worker = await readFile(workerPath, "utf8");
const pagesWorker = worker.replaceAll(
  "/workspace/sites/bformat-dev/.vinext/fonts/",
  "/assets/_vinext_fonts/",
);

if (pagesWorker === worker) {
  throw new Error("Expected Vinext font URLs were not found in the Pages worker");
}

await writeFile(workerPath, pagesWorker);
NODE

printf '_worker.js\n' >> "${pages_output}/.assetsignore"
rm -f "${project_root}/.wrangler/deploy/config.json"

echo "Built Cloudflare Pages artifact: dist/pages"
