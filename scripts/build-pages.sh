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

printf '_worker.js\n' >> "${pages_output}/.assetsignore"
rm -f "${project_root}/.wrangler/deploy/config.json"

echo "Built Cloudflare Pages artifact: dist/pages"
