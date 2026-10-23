#!/usr/bin/env bash
# Builds the site and packs it, together with the PHP backend, into raju-bepari-hostinger.zip (ready for hPanel File Manager).
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/build.sh
rm -rf dist-hostinger raju-bepari-hostinger.zip
mkdir dist-hostinger
cp -R _site/. dist-hostinger/
cp -R hostinger/api dist-hostinger/api
rm -rf dist-hostinger/admin dist-hostinger/_redirects
# the Decap CMS link only works on Netlify
sed -i 's|<a class="btn" href="/admin/">Edit site content</a> ||' dist-hostinger/dashboard/index.html || true
(cd dist-hostinger && zip -qr ../raju-bepari-hostinger.zip .)
echo "Created raju-bepari-hostinger.zip"
