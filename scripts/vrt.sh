#!/usr/bin/env sh
# Run the visual regression tests inside the Playwright Docker image, so
# local screenshots match CI. Extra arguments go to `playwright test`,
# e.g. `pnpm vrt --update-snapshots`.
set -eu

VERSION=$(node -p "require('@playwright/test/package.json').version")
IMAGE="mcr.microsoft.com/playwright:v${VERSION}-noble"

# node_modules and .next live in named volumes so the Linux container never
# overwrites the host's native binaries.
exec docker run --rm --init --ipc=host \
  -v "$(pwd)":/work \
  -v sebald-me-vrt-node-modules:/work/node_modules \
  -v sebald-me-vrt-next:/work/.next \
  -v sebald-me-vrt-pnpm-store:/pnpm-store \
  -w /work \
  -e CI \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e npm_config_store_dir=/pnpm-store \
  "$IMAGE" \
  sh -c 'corepack enable && pnpm install --frozen-lockfile && pnpm exec playwright test "$@"' -- "$@"
