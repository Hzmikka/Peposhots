import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const { outputText } = ts.transpileModule(readFileSync("lib/shakerJourney.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { createShakerJourney, sampleShakerJourney, getShakerNozzle } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

function layout(width = 1440, viewportHeight = 900) {
  const heroHeight = width >= 1024 ? width * .44 : Math.max(width * .48, width >= 900 ? 520 : 560);
  const columns = width < 1024 ? 2 : width < 1280 ? 3 : 5;
  const pathsHeight = 500 + Math.ceil(5 / columns) * 390;
  const paths = { left: 24, top: heroHeight + 32, width: width - 48, height: pathsHeight };
  const bars = { left: 0, top: paths.top + paths.height, width, height: width < 900 ? 900 : 760 };
  const drinksTop = bars.top + bars.height;
  const drinksHeading = { left: width * .05, top: drinksTop + Math.min(390, Math.max(260, width * .27)), width: width * .45, height: 170 };
  const card = { left: width * .57, top: drinksHeading.top + 210, width: Math.min(426, width * .39), height: 604 };
  const tray = { left: width * .025, top: card.top + 260, width: width * .47, height: width * .47 * 9 / 16 };
  return {
    width, height: Math.max(card.top + card.height, tray.top + tray.height) + 120,
    documentTop: 80, viewportHeight,
    hero: { left: 0, top: 0, width, height: heroHeight }, paths, bars, drinksHeading, card, tray,
    heading: { left: width * .05, top: paths.top + 80, width: width * .7, height: 160 },
    carousel: { left: paths.left + 32, top: paths.top + 260, width: paths.width - 64, height: paths.height - 300 },
  };
}

test("reference lid starts up, becomes horizontal and ends facing down", () => {
  const journey = createShakerJourney(layout());
  assert.ok(journey);
  assert.equal(sampleShakerJourney(journey, journey.stops.side).angle, 90);
  assert.equal(sampleShakerJourney(journey, journey.stops.horizontal).angle, 0);
  assert.equal(sampleShakerJourney(journey, journey.stops.inverted).angle, -90);
  const horizontal = getShakerNozzle(journey.keyframes[1], journey.size);
  assert.ok(horizontal.x < journey.keyframes[1].x - journey.size * .45);
  const inverted = journey.keyframes.at(-1);
  assert.ok(journey.nozzle.y > inverted.y + journey.size * .45);
});

test("liquid cannot start before the lid faces down and remains attached to the nozzle", () => {
  const journey = createShakerJourney(layout());
  for (let scroll = 0; scroll <= journey.pourStart; scroll += 17) {
    const state = sampleShakerJourney(journey, scroll);
    assert.equal(state.flow, 0);
    assert.equal(state.pool, 0);
  }
  for (let index = 1; index <= 20; index++) {
    const scroll = journey.pourStart + (journey.pourEnd - journey.pourStart) * index / 20;
    const state = sampleShakerJourney(journey, scroll);
    assert.equal(state.angle, -90);
    const nozzle = getShakerNozzle(state, journey.size);
    assert.ok(Math.abs(nozzle.x - journey.nozzle.x) < 1e-6);
    assert.ok(Math.abs(nozzle.y - journey.nozzle.y) < 1e-6);
    if (state.pool > 0) assert.equal(state.flow, 1, "A puddle must wait until the stream reaches it");
  }
});

test("tablet, desktop, landscape and tall viewports produce finite, ordered geometry", () => {
  for (const width of [600, 768, 900, 1024, 1280, 1440, 1920, 2560]) {
    for (const height of [360, 768, 900, 1200]) {
      const journey = createShakerJourney(layout(width, height));
      assert.ok(journey);
      assert.ok(journey.keyframes.every((frame, index, all) => index === 0 || frame.scroll > all[index - 1].scroll));
      assert.ok(journey.pourStart > journey.keyframes.at(-1).scroll);
      assert.ok(journey.pourEnd > journey.pourStart);
      for (const path of Object.values(journey.paths)) assert.ok(!/NaN|Infinity|undefined/.test(path));
      let previousAngle = 90;
      let previousFlow = 0;
      for (let index = 0; index <= 200; index++) {
        const state = sampleShakerJourney(journey, journey.pourEnd * index / 200);
        assert.ok([state.x, state.y, state.angle, state.flow, state.pool].every(Number.isFinite));
        assert.ok(state.angle <= previousAngle + 1e-6, "Rotation should continue in one direction");
        assert.ok(state.flow >= previousFlow - 1e-6);
        assert.ok(state.flow >= 0 && state.flow <= 1 && state.pool >= 0 && state.pool <= 1);
        previousAngle = state.angle;
        previousFlow = state.flow;
      }
    }
  }
});

test("scroll reversal returns to exactly the same pose", () => {
  const journey = createShakerJourney(layout());
  const points = [0, journey.stops.side, journey.stops.horizontal + 40, journey.stops.turning, journey.stops.inverted, journey.stops.pouring, journey.pourEnd];
  const forward = points.map((point) => sampleShakerJourney(journey, point));
  const reversed = points.toReversed().map((point) => sampleShakerJourney(journey, point)).toReversed();
  assert.deepEqual(forward, reversed);
});

test("reduced motion fixes one horizontal decoration and disables the pour", () => {
  const journey = createShakerJourney(layout());
  assert.deepEqual(sampleShakerJourney(journey, 0, true), sampleShakerJourney(journey, journey.pourEnd, true));
  assert.equal(sampleShakerJourney(journey, journey.pourEnd, true).flow, 0);
  assert.equal(sampleShakerJourney(journey, journey.pourEnd, true).angle, 0);
});

test("unmeasurable or hidden layouts fail safely", () => {
  assert.equal(createShakerJourney({ ...layout(), width: 0 }), null);
  assert.equal(createShakerJourney({ ...layout(), viewportHeight: NaN }), null);
  assert.equal(createShakerJourney({ ...layout(), card: { left: 0, top: 0, width: 0, height: 0 } }), null);
  const journey = createShakerJourney(layout());
  assert.deepEqual(sampleShakerJourney(journey, NaN), sampleShakerJourney(journey, 0));
});
