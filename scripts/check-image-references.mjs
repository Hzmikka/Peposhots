import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "data", "lib"];
const sourceExt = new Set([".ts", ".tsx", ".css", ".js", ".mjs"]);
const imagePattern = /(?:["'(]|url\(["']?)(\/images\/[^"')\s]+?\.(?:webp|png|jpe?g))/gi;
const refs = new Set();
const legacy = [];
const missing = [];
const invalid = [];

export function verifyWebpContainer(data) {
  if (data.length < 12 || data.toString("ascii", 0, 4) !== "RIFF" || data.toString("ascii", 8, 12) !== "WEBP") return "Invalid WebP/RIFF header";
  const expected = data.readUInt32LE(4) + 8;
  if (expected !== data.length) return `Truncated or inconsistent WebP: expected ${expected} bytes, found ${data.length}`;
  let offset = 12;
  let hasImage = false;
  while (offset < data.length) {
    if (offset + 8 > data.length) return "Incomplete WebP chunk header";
    const type = data.toString("ascii", offset, offset + 4);
    const size = data.readUInt32LE(offset + 4);
    offset += 8 + size + (size % 2);
    if (offset > data.length) return "Incomplete WebP chunk payload";
    if (["VP8 ", "VP8L", "ANMF"].includes(type)) hasImage = true;
  }
  return hasImage ? null : "WebP contains no image payload";
}

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

for (const ref of refs) {
  const disk = path.join("public", ref.replace(/^\//, ""));
  if (!fs.existsSync(disk) || !ref.endsWith(".webp")) continue;
  const error = verifyWebpContainer(fs.readFileSync(disk));
  if (error) invalid.push(`${ref}: ${error}`);
}

if (legacy.length || missing.length || unused.length || invalid.length) {
  if (legacy.length) console.error("Active non-WebP image references:\n" + legacy.join("\n"));
  if (missing.length) console.error("Missing image references:\n" + missing.join("\n"));
  if (unused.length) console.error("Unused images in public/images:\n" + unused.join("\n"));
  if (invalid.length) console.error("Damaged WebP images:\n" + invalid.join("\n"));
  process.exit(1);
}

console.log(`Asset references OK: ${refs.size} local images; all are present, referenced, and valid WebP containers.`);
