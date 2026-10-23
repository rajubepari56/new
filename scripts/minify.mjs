// Post-build step (runs after `jekyll build`):
//  1. minifies every CSS and JS file in _site/assets
//  2. bundles main + home + case + motion CSS into one render-blocking file (assets/css/site.css)
//     and points every HTML page at it, so the browser makes one CSS request instead of four.
import { transform } from "esbuild";
import { readdir, readFile, writeFile, stat, unlink } from "node:fs/promises";
import { join, extname } from "node:path";

const root = "_site";
let saved = 0;
async function walk(dir, fn) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) { await walk(p, fn); continue; }
    await fn(p);
  }
}

// 1. minify
await walk(join(root, "assets"), async (p) => {
  const ext = extname(p);
  if (ext !== ".css" && ext !== ".js") return;
  const src = await readFile(p, "utf8");
  const out = await transform(src, { loader: ext === ".css" ? "css" : "js", minify: true, legalComments: "none", target: "es2019" });
  saved += src.length - out.code.length;
  await writeFile(p, out.code);
});

// 2. bundle CSS (order matters: later files refine earlier ones)
const parts = ["main", "home", "case", "motion", "luxury"];
let bundle = "";
for (const n of parts) bundle += (await readFile(join(root, "assets/css", `${n}.css`), "utf8")) + "\n";
await writeFile(join(root, "assets/css/site.css"), bundle);
await walk(root, async (p) => {
  if (extname(p) !== ".html") return;
  let h = await readFile(p, "utf8");
  if (!h.includes("/assets/css/main.css")) return;
  h = h.replace(/<link rel="stylesheet" href="\/assets\/css\/(home|case|motion|luxury)\.css">\s*/g, "")
       .replace('href="/assets/css/main.css"', 'href="/assets/css/site.css"');
  await writeFile(p, h);
});
for (const n of parts) await unlink(join(root, "assets/css", `${n}.css`));
console.log(`minified assets (saved ${(saved / 1024).toFixed(1)} KB) and bundled CSS into assets/css/site.css`);
