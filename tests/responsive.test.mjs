import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const postcss = createRequire(require.resolve("next/package.json"))("postcss");
const css = postcss.parse(["app/responsive.css", "app/journey.css"].map((path) => readFileSync(path, "utf8")).join("\n"));

async function importSource(path) {
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { getLayoutMode, TABLET_MIN_WIDTH, DESKTOP_MIN_WIDTH } = await importSource("lib/responsive.ts");
const { responsiveViewports } = await importSource("data/responsiveViewports.ts");
const { getSectionScrollOffset } = await importSource("lib/scrolling.ts");

test("Cami’s phone stylesheet is byte-identical to her latest ZIP", () => {
  const hash = createHash("sha256").update(readFileSync("app/globals.css")).digest("hex");
  assert.equal(hash, "cf4f09334c023fb3a2259b5ca3af44cb8be3e12445eefe214f222ea8642fa30d");
});

test("all new layout rules are scoped to a named canvas at least 600 CSS pixels wide", () => {
  const baselineSelectors = new Set([
    ".live-site", ".page-device",
    ".header-nav", ".header-cta", ".hero-actions", ".drinks-wide-intro", ".cocktail-wide-actions", ".archive-navigation",
    ".cocktail-showcase", ".cocktail-selection", ".where-intro", ".where-map-explorer", ".where-signature",
    ".cocktail-journey", ".journey-motion-layer", ".pepo-hero-panorama",
  ]);
  css.walkRules((rule) => {
    let parent = rule.parent;
    let query;
    while (parent) {
      if (parent.type === "atrule" && parent.name === "container") query = parent;
      parent = parent.parent;
    }
    if (query) {
      assert.match(query.params, /^pepo \(min-width: \d+px\)$/);
      assert.ok(Number(query.params.match(/\d+/)[0]) >= TABLET_MIN_WIDTH, query.params);
    } else {
      for (const selector of rule.selectors) assert.ok(baselineSelectors.has(selector), `Phone layout leak: ${selector}`);
      if (!rule.selectors.includes(".live-site") && !rule.selectors.includes(".page-device")) {
        assert.equal(rule.nodes.length, 1);
        assert.equal(rule.nodes[0].prop, "display");
        assert.ok(["none", "contents"].includes(rule.nodes[0].value));
      }
    }
  });
});

test("CSS breakpoints and pointer/review logic agree at the exact boundaries", () => {
  const queries = [];
  css.walkAtRules("container", (rule) => queries.push(rule.params));
  assert.ok(queries.includes(`pepo (min-width: ${TABLET_MIN_WIDTH}px)`));
  assert.ok(queries.includes(`pepo (min-width: ${DESKTOP_MIN_WIDTH}px)`));
  for (const width of [320, 344, 360, 375, 390, 393, 402, 412, 430, 440, 480, 599, 599.5]) assert.equal(getLayoutMode(width), "Móvil");
  for (const width of [600, 600.5, 640, 768, 820, 834, 900, 1023, 1023.5]) assert.equal(getLayoutMode(width), "Tablet");
  for (const width of [1024, 1024.5, 1280, 1366, 1440, 1920, 2560]) assert.equal(getLayoutMode(width), "PC");
  // The portfolio canvas stays a phone even on a 1920 px host window.
  assert.equal(getLayoutMode(400), "Móvil");
});

test("review presets cover small phones, large phones, tablets, laptops and cut edges", () => {
  const ids = responsiveViewports.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  const widths = new Set(responsiveViewports.map((item) => item.width));
  for (const width of [320, 344, 360, 375, 390, 393, 402, 412, 430, 440, 480, 599, 600, 601, 640, 768, 820, 834, 899, 900, 901, 1023, 1024, 1025, 1279, 1280, 1281, 1366, 1440, 1920, 2560]) {
    assert.ok(widths.has(width), `Missing review width: ${width}`);
  }
});

test("scroll destinations clear a sticky PC header and preserve both phone offsets", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { getComputedStyle: (header) => ({ position: header.position }) };
  const makeElement = (position, demo = false) => ({
    closest: (selector) => selector === ".page-shell"
      ? { querySelector: () => ({ position, offsetHeight: 80 }) }
      : demo ? {} : null,
  });
  try {
    assert.equal(getSectionScrollOffset(makeElement("absolute")), 12);
    assert.equal(getSectionScrollOffset(makeElement("absolute", true)), 52);
    assert.equal(getSectionScrollOffset(makeElement("sticky")), 96);
  } finally { globalThis.window = previousWindow; }
});

// Optional build inspection; this checks emitted HTML, without simulating a browser.
if (process.env.PEPO_CHECK_BUILT_HTML === "1") {
  test("built home page keeps one booking form and valid navigation destinations", () => {
    const html = readFileSync(".next/server/app/index.html", "utf8");
    for (const id of ["top", "event-paths", "bar-setups", "drinks", "what-you-bring", "real-work", "where-and-when", "booking", "booking-form"]) {
      assert.equal([...html.matchAll(new RegExp(` id="${id}"`, "g"))].length, 1, `Anchor ${id}`);
    }
    assert.equal([...html.matchAll(/<form\b[^>]*class="booking-form"/g)].length, 1);
    assert.ok(!html.includes("Revisión de pantallas"));
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(new URL(canonical).href, new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "https://peposhots.com").href);
  });
}
