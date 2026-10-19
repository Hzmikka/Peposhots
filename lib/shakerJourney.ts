export type JourneyPoint = { x: number; y: number };
export type JourneyRect = { left: number; top: number; width: number; height: number };
export type ShakerPose = JourneyPoint & { angle: number };
export type JourneyLayout = {
  width: number;
  height: number;
  documentTop: number;
  viewportHeight: number;
  hero: JourneyRect;
  paths: JourneyRect;
  heading: JourneyRect;
  carousel?: JourneyRect;
  bars: JourneyRect;
  drinksHeading: JourneyRect;
  card: JourneyRect;
  tray: JourneyRect;
};

export type JourneyKeyframe = ShakerPose & { scroll: number };
export type ShakerJourney = {
  size: number;
  width: number;
  height: number;
  keyframes: JourneyKeyframe[];
  pourStart: number;
  pourEnd: number;
  nozzle: JourneyPoint;
  pool: JourneyPoint & { width: number; height: number };
  paths: { stream: string; left: string; right: string; pool: string };
  stops: Record<string, number>;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / Math.max(1, end - start), 0, 1);
const ease = (value: number) => value * value * (3 - 2 * value);
const bottom = (rect: JourneyRect) => rect.top + rect.height;
const center = (rect: JourneyRect) => rect.left + rect.width / 2;
const round = (value: number) => Math.round(value * 100) / 100;

// The existing WebP is horizontal, with its lid at the left edge. Coordinates
// are normalized to that untouched 1536 × 1024 canvas, including transparent margins.
export function getShakerNozzle(pose: ShakerPose, size: number): JourneyPoint {
  const dx = (.022 - .5) * size;
  const dy = (.515 - .5) * size * 2 / 3;
  const angle = pose.angle * Math.PI / 180;
  return {
    x: pose.x + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: pose.y + dx * Math.sin(angle) + dy * Math.cos(angle),
  };
}

export function createShakerJourney(layout: JourneyLayout): ShakerJourney | null {
  const { width, height, viewportHeight, documentTop } = layout;
  const rects = [layout.hero, layout.paths, layout.heading, layout.bars, layout.drinksHeading, layout.card, layout.tray];
  if (![width, height, viewportHeight, documentTop, ...rects.flatMap((rect) => Object.values(rect))].every(Number.isFinite)
    || width <= 0 || height <= 0 || viewportHeight <= 0 || rects.some((rect) => rect.width <= 0 || rect.height <= 0)) return null;

  const size = Math.min(1040, Math.max(440, width * .8));
  const gutter = Math.min(48, width * .04);
  const horizontal: ShakerPose = {
    x: layout.carousel ? center(layout.carousel) : width / 2,
    y: layout.carousel
      ? layout.carousel.top + Math.min(layout.carousel.height * .35, 180)
      : bottom(layout.heading) + 300,
    angle: 0,
  };
  const side: ShakerPose = {
    x: width - size * .18 - gutter,
    // Anchor the lid near the hero's lower edge as the oversized shaker grows.
    y: bottom(layout.hero) + size * .478 - clamp(width * .14, 120, 200) + 90,
    angle: 90,
  };
  const pivot = { x: horizontal.x + size * .478, y: horizontal.y };
  const leaving: ShakerPose = {
    x: pivot.x - size * .478 * Math.SQRT1_2,
    y: pivot.y + size * .478 * Math.SQRT1_2,
    angle: -45,
  };
  const bars: ShakerPose = {
    x: pivot.x - 50,
    y: pivot.y + size * .478 + 40,
    angle: -90,
  };
  const inverted: ShakerPose = { ...bars };
  const nozzle = getShakerNozzle(inverted, size);
  const keyframes: JourneyKeyframe[] = [];
  function add(pose: ShakerPose, desiredScroll: number) {
    const previous = keyframes.at(-1)?.scroll;
    keyframes.push({ ...pose, scroll: Math.max(0, previous === undefined ? 0 : previous + 64, desiredScroll) });
  }
  add(side, documentTop + side.y - viewportHeight * .82);
  add(horizontal, documentTop + horizontal.y - viewportHeight * .52);
  add(horizontal, keyframes[1].scroll + Math.min(160, viewportHeight * .16));
  add(leaving, documentTop + leaving.y - viewportHeight * .52);
  add(bars, documentTop + bars.y - viewportHeight * .48);
  add(inverted, documentTop + inverted.y - viewportHeight * .32);

  const pool = {
    x: (center(layout.tray) + center(layout.card)) / 2,
    y: Math.max(layout.card.top + layout.card.height * .7, layout.tray.top + layout.tray.height * .54, nozzle.y + 220),
    width: Math.min(width - gutter * 2, Math.max(layout.card.left + layout.card.width, layout.tray.left + layout.tray.width)
      - Math.min(layout.card.left, layout.tray.left) + 40),
    height: Math.min(330, Math.max(150, width * .23)),
  };
  const pourStart = keyframes.at(-1)!.scroll + 24;
  const pourEnd = Math.max(pourStart + viewportHeight * .7, documentTop + pool.y - viewportHeight * .35);
  const streamEnd = { x: center(layout.card), y: layout.card.top + layout.card.height * .6 };
  const distance = streamEnd.y - nozzle.y;
  const sx = round(nozzle.x), sy = round(nozzle.y), px = round(pool.x), py = round(pool.y);
  const lx = round(center(layout.tray)), rx = round(center(layout.card));
  const w = pool.width, h = pool.height;
  const paths = {
    stream: `M ${sx} ${sy} C ${sx - 12} ${round(sy + distance * .28)}, ${round(streamEnd.x)} ${round(sy + distance * .55)}, ${round(streamEnd.x)} ${round(streamEnd.y)}`,
    left: `M ${px} ${round(py - h * .22)} C ${round(px - w * .12)} ${round(py - h * .7)}, ${round(lx + w * .05)} ${round(py - h * .35)}, ${lx} ${round(py + h * .03)}`,
    right: `M ${px} ${round(py - h * .22)} C ${round(px + w * .1)} ${round(py - h * .8)}, ${round(rx - w * .05)} ${round(py - h * .4)}, ${rx} ${round(py + h * .08)}`,
    pool: `M ${round(px - w * .5)} ${py} C ${round(px - w * .58)} ${round(py - h * .28)}, ${round(px - w * .29)} ${round(py - h * .7)}, ${round(px - w * .18)} ${round(py - h * .39)} C ${round(px - w * .04)} ${round(py - h * .68)}, ${round(px + w * .06)} ${round(py - h * .48)}, ${round(px + w * .16)} ${round(py - h * .34)} C ${round(px + w * .36)} ${round(py - h * .7)}, ${round(px + w * .58)} ${round(py - h * .13)}, ${round(px + w * .48)} ${round(py + h * .13)} C ${round(px + w * .53)} ${round(py + h * .55)}, ${round(px + w * .18)} ${round(py + h * .63)}, ${round(px + w * .04)} ${round(py + h * .41)} C ${round(px - w * .16)} ${round(py + h * .73)}, ${round(px - w * .48)} ${round(py + h * .54)}, ${round(px - w * .5)} ${py} Z`,
  };
  return {
    size, width, height, keyframes, pourStart, pourEnd, nozzle, pool, paths,
    stops: {
      side: keyframes[0].scroll,
      horizontal: keyframes[1].scroll,
      turning: keyframes[4].scroll,
      inverted: keyframes[5].scroll,
      pouring: pourStart + (pourEnd - pourStart) * .78,
    },
  };
}

export function sampleShakerJourney(journey: ShakerJourney, scroll: number, reducedMotion = false) {
  const frames = journey.keyframes;
  // Reduced motion is a fixed decoration behind the service heading, with no pour.
  if (reducedMotion) return { ...frames[1], flow: 0, pool: 0, phase: "static" };
  const position = Number.isFinite(scroll) ? scroll : 0;
  let pose: ShakerPose = frames.at(-1)!;
  if (position <= frames[0].scroll) pose = frames[0];
  else {
    for (let index = 1; index < frames.length; index++) {
      const next = frames[index];
      if (position > next.scroll) continue;
      const previous = frames[index - 1];
      const amount = ease(range(position, previous.scroll, next.scroll));
      pose = {
        x: previous.x + (next.x - previous.x) * amount,
        y: previous.y + (next.y - previous.y) * amount,
        angle: previous.angle + (next.angle - previous.angle) * amount,
      };
      // Follow the right-end turn with a gentle drift through the whole turn.
      if (index === 3 || index === 4) {
        const radius = journey.size * .478;
        const previousAngle = previous.angle * Math.PI / 180;
        const nextAngle = next.angle * Math.PI / 180;
        const angle = pose.angle * Math.PI / 180;
        const anchorX = previous.x + radius * Math.cos(previousAngle);
        const anchorY = previous.y + radius * Math.sin(previousAngle);
        pose.x = anchorX + (next.x + radius * Math.cos(nextAngle) - anchorX) * amount - radius * Math.cos(angle);
        pose.y = anchorY + (next.y + radius * Math.sin(nextAngle) - anchorY) * amount - radius * Math.sin(angle);
        const turnProgress = ease(range(position, frames[2].scroll, frames[4].scroll));
        const drift = Math.sin(Math.PI * turnProgress) ** 2;
        pose.x -= Math.min(80, journey.size * .08) * drift;
        pose.y += Math.min(45, journey.size * .045) * drift;
      }
      break;
    }
  }
  const pour = ease(range(position, journey.pourStart, journey.pourEnd));
  const flow = ease(clamp(pour / .62, 0, 1));
  const pool = ease(clamp((pour - .62) / .38, 0, 1));
  const phase = position < frames[1].scroll ? "side"
    : position <= frames[2].scroll ? "horizontal"
      : position < frames[5].scroll ? "turning"
        : flow > 0 ? "pouring" : "inverted";
  return { ...pose, flow, pool, phase };
}
