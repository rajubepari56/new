#!/usr/bin/env bash
# Production build: Jekyll, then minify CSS/JS.
set -euo pipefail
JEKYLL_ENV=production bundle exec jekyll build
node scripts/minify.mjs
