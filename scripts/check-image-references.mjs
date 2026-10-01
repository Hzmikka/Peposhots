import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "data", "lib"];
const sourceExt = new Set([".ts", ".tsx", ".css", ".js", ".mjs"]);
const imagePattern = /(?:["'(]|url\(["']?)(\/images\/[^"')\s]+?\.(?:webp|png|jpe?g))/gi;
const refs = new Set();
const legacy = [];
const missing = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const root of roots) {
  for (const file of walk(root)) {
    if (!sourceExt.has(path.extname(file))) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(imagePattern)) {
      const ref = match[1];
      refs.add(ref);
      if (/\.(?:png|jpe?g)$/i.test(ref)) legacy.push(`${file}: ${ref}`);
      const disk = path.join("public", ref.replace(/^\//, ""));
      if (!fs.existsSync(disk)) missing.push(`${file}: ${ref}`);
    }
  }
}

const imageRoot = path.join("public", "images");
const publicImages = new Set(
  walk(imageRoot)
    .filter((file) => /\.(?:webp|png|jpe?g)$/i.test(file))
    .map((file) => `/${file.split(path.sep).join("/").replace(/^public\//, "")}`)
);
const unused = [...publicImages].filter((ref) => !refs.has(ref)).sort();

if (legacy.length || missing.length || unused.length) {
  if (legacy.length) console.error("Active non-WebP image references:\n" + legacy.join("\n"));
  if (missing.length) console.error("Missing image references:\n" + missing.join("\n"));
  if (unused.length) console.error("Unused images in public/images:\n" + unused.join("\n"));
  process.exit(1);
}

console.log(`Asset references OK: ${refs.size} local images; all are WebP, present, and referenced.`);
