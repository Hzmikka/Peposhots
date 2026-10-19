import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
import { requireProject, loadProject } from "./helpers/project-loader.mjs";

const { validateBookingInquiry, localDateKey } = loadProject("lib/bookingValidation.ts");
const { readBookingDraft, BOOKING_DRAFT_TTL, stepForErrors, bartenderReferenceApplies, buildWhatsAppUrl, formatEventDate } = loadProject("lib/bookingSupport.ts");
const { sanitizePreferences } = loadProject("lib/preferences.ts");
const { validateContribution } = loadProject("lib/reviewValidation.ts");
const { translate } = loadProject("lib/i18n.ts");
const english = JSON.parse(readFileSync("data/english.json", "utf8"));
const valid = { name: "Camila", email: "camila@example.test", phone: "7866067684", eventDate: "2030-12-25", eventType: "CORPORATIVO", guestRange: "Hasta 50 invitados", location: "Miami", serviceNeeded: "Bartender", venueHasBar: "Sí", message: "Indoor event." };

test("waitstaff and combined service never reuse a bartender-only numeric reference", () => {
  assert.equal(bartenderReferenceApplies("Mesero"), false);
  assert.equal(bartenderReferenceApplies("Bartender + mesero"), false);
  assert.equal(bartenderReferenceApplies("Aún no sé"), false);
  assert.equal(bartenderReferenceApplies("Bartender"), true);
  assert.match(translate("en", "Base de bartenders: ${price} · hasta 4 h", { price: 300 }), /\$300/);
});

test("client and server validation share trimming, real dates and Miami's calendar", () => {
  const now = new Date("2026-10-20T02:00:00Z");
  assert.equal(localDateKey(now), "2026-10-19");
  const result = validateBookingInquiry({ ...valid, email: " camila@example.test ", eventDate: "2026-10-19" }, now);
  assert.equal(result.ok, true);
  assert.equal(result.data.email, "camila@example.test");
  assert.equal(validateBookingInquiry({ ...valid, eventDate: "2030-02-30" }, now).ok, false);
  assert.equal(validateBookingInquiry({ ...valid, eventDate: "2026-10-18" }, now).ok, false);
  assert.match(formatEventDate("2030-12-25", "en"), /December/);
  assert.match(formatEventDate("2030-12-25", "es"), /diciembre/);
});

test("server errors return to the first relevant form step", () => {
  assert.equal(stepForErrors({ email: "Invalid", eventDate: "Invalid" }), 0);
  assert.equal(stepForErrors({ venueHasBar: "Invalid", name: "Invalid" }), 1);
  assert.equal(stepForErrors({ phone: "Invalid" }), 2);
  assert.equal(stepForErrors({ unknown: "Error" }), 3);
});

test("drafts restore bounded user fields and expire without accepting arbitrary state", () => {
  const now = 1_000_000_000;
  const saved = { version: 1, savedAt: now - 100, step: 2, dirty: ["name", "email", "not-a-field"], fields: { ...valid, unknown: "drop", message: "x".repeat(2000) } };
  const draft = readBookingDraft(saved, now);
  assert.equal(draft.step, 2);
  assert.equal(draft.fields.email, valid.email);
  assert.equal(draft.fields.message.length, 1200);
  assert.equal(draft.fields.unknown, undefined);
  assert.deepEqual(draft.dirty, ["name", "email"]);
  assert.equal(readBookingDraft({ ...saved, savedAt: now - BOOKING_DRAFT_TTL - 1 }, now), null);
  assert.equal(readBookingDraft({ ...saved, savedAt: now + 120_000 }, now), null);
  assert.equal(readBookingDraft("bad JSON", now), null);
});

test("damaged stored preferences cannot break the cocktail or map flow", () => {
  assert.deepEqual(sanitizePreferences({ favoriteDrinks: "mojito", eventPath: "invalid", preferredBarSetup: null }), {});
  assert.deepEqual(sanitizePreferences({ favoriteDrinks: ["mojito", "invalid", "mojito"], eventPath: "up-to-50", location: " Miami " }), { eventPath: "up-to-50", favoriteDrinks: ["mojito"], location: "Miami" });
});

test("WhatsApp preserves Unicode, punctuation and the chosen configuration", () => {
  const text = "Hello\nGuests: Up to 50 guests\nCocktails: PIÑA COLADA & MOJITO";
  const url = new URL(buildWhatsAppUrl("+1 (786) 606-7684", text));
  assert.equal(url.pathname, "/17866067684");
  assert.equal(url.searchParams.get("text"), text);
});

test("sharing a photo does not require a fabricated review or rating", () => {
  const photo = { name: "Camila", email: valid.email, consent: "yes", mode: "photo", text: "", rating: "" };
  assert.equal(validateContribution(photo, true).ok, true);
  assert.equal(validateContribution(photo, false).ok, false);
  assert.equal(validateContribution({ ...photo, mode: "review" }, true).ok, false);
  assert.equal(validateContribution({ ...photo, consent: "" }, true).ok, false);
});

test("translations cover static interface text, interpolated actions and error messages", () => {
  const missing = new Set();
  const brands = new Set(["PEPOSHOTS", "BARTENDER & WAITER · MIAMI", "PepoShots — Bartender & Waiter", "Bartender", "Email", "No"]);
  function literals(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
    if (ts.isConditionalExpression(node)) return [...literals(node.whenTrue), ...literals(node.whenFalse)];
    return [];
  }
  function scan(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (/\.tsx?$/.test(file)) {
        const tree = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
        const walk = (node) => {
          if (ts.isCallExpression(node) && node.expression.getText(tree) === "t" && node.arguments.length) {
            for (const source of literals(node.arguments[0])) {
              const key = source.trim();
              if (/[a-záéíóúñ¿]/i.test(key) && !english[key] && !Object.values(english).includes(key) && !brands.has(key)) missing.add(key);
            }
          }
          ts.forEachChild(node, walk);
        };
        walk(tree);
      }
    }
  }
  scan("components"); scan("app");
  assert.deepEqual([...missing], []);
  assert.equal(translate("en", "Quitar {name}", { name: "MOJITO" }), "Remove MOJITO");
  assert.equal(translate("es", "Enter a valid email address."), "Usa un email válido.");
  const invalid = validateBookingInquiry({});
  for (const message of Object.values(invalid.errors)) assert.notEqual(translate("en", message), message);
});

test("data-driven package, bar and cocktail descriptions also have English copy", () => {
  const { eventPaths } = loadProject("data/eventPaths.ts");
  const { barSetups } = loadProject("data/barSetups.ts");
  const { drinks } = loadProject("data/drinks.ts");
  const { realEvents } = loadProject("data/realEvents.ts");
  const phrases = [...eventPaths.flatMap((path) => [path.label, path.title, ...path.meta]), ...barSetups.flatMap((bar) => [bar.description, ...(bar.logisticsNote ? [bar.logisticsNote] : [])]), ...drinks.map((drink) => drink.line), ...realEvents.flatMap((event) => [event.descriptor, event.alt])];
  for (const phrase of phrases) assert.ok(english[phrase], `Missing English description: ${phrase}`);
  // Review copy, authors and ratings are editorial content outside this check.
});

test("Cami's layouts, proportions and shaker trajectory remain byte-identical", () => {
  const expected = {
    "app/globals.css": "cf4f09334c023fb3a2259b5ca3af44cb8be3e12445eefe214f222ea8642fa30d",
    "app/responsive.css": "6039d36722304626b8903a5fb85061716d328f647719b1bcff5e14048378e01c",
    "app/journey.css": "8061d36f3911ef0fad4926d9d2ba5c02be5286e782a027201394ee2ccb576ec6",
    "lib/shakerJourney.ts": "6b441602596b198b045be79393fa0d1f0ef837cb7f9912350070da6af49e77c2",
    "components/sections/CocktailJourney.tsx": "3e4c5a6de18ebf9473276d2d89cde9a0cc2b2a72339090ecb935d85852a63c15",
  };
  for (const [file, hash] of Object.entries(expected)) assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), hash, file);
});

test("the actual page renders in English while option values remain stable", () => {
  const React = requireProject("react");
  const { renderToStaticMarkup } = requireProject("react-dom/server");
  const { LanguageProvider } = loadProject("components/i18n/LanguageProvider.tsx");
  const { PepoExperienceProvider } = loadProject("components/peposhots/PepoExperienceContext.tsx");
  const { SiteExperience } = loadProject("components/layout/SiteExperience.tsx");
  const render = (language) => renderToStaticMarkup(React.createElement(LanguageProvider, { initialLanguage: language }, React.createElement(PepoExperienceProvider, null, React.createElement(SiteExperience))));
  const englishPage = render("en");
  assert.match(englishPage, /Enjoy your party/);
  assert.match(englishPage, /Check your date/);
  assert.match(englishPage, /value="Hasta 50 invitados">Up to 50 guests/);
  assert.match(englishPage, /A small celebration with the bar in good hands/);
  assert.match(englishPage, /Fresh, bright and made to refresh/);
  assert.doesNotMatch(englishPage, /LAURA M\.|ANDRÉS R\.|RESEÑA DE MUESTRA/);
  assert.equal((englishPage.match(/<form\b/g) || []).length, 1);
  assert.match(render("es"), /Disfruta tu fiesta/);
});

test("HTTP handlers localize validation and deliver only through mocked mail", async () => {
  const mail = loadProject("lib/bookingDelivery.ts");
  const originalBooking = mail.deliverBookingEmail;
  const originalReview = mail.deliverReviewEmail;
  let sentBooking, sentPhoto;
  mail.deliverBookingEmail = async (data) => { sentBooking = data; return { delivered: true, simulated: true }; };
  mail.deliverReviewEmail = async (data) => { sentPhoto = data; return { delivered: true, simulated: true }; };
  try {
    const booking = loadProject("app/api/booking/route.ts");
    const headers = { "Content-Type": "application/json", "Accept-Language": "en", "x-forwarded-for": "test-booking" };
    const rejected = await booking.POST(new Request("http://localhost/api/booking", { method: "POST", headers, body: "{}" }));
    assert.equal(rejected.status, 422);
    const errors = await rejected.json();
    assert.match(errors.errors.email, /valid email/);
    assert.equal(sentBooking, undefined);
    const accepted = await booking.POST(new Request("http://localhost/api/booking", { method: "POST", headers, body: JSON.stringify(valid) }));
    assert.equal(accepted.status, 200);
    assert.equal(sentBooking.context.language, "en");
    mail.deliverBookingEmail = async () => { throw Object.assign(new Error("secret internal details"), { code: "EMAIL_AUTH_FAILED" }); };
    const failed = await booking.POST(new Request("http://localhost/api/booking", { method: "POST", headers, body: JSON.stringify(valid) }));
    assert.equal(failed.status, 503);
    const failure = await failed.json();
    assert.match(failure.message, /Try again or contact us/);
    assert.doesNotMatch(failure.message, /Gmail|Vercel|PASSWORD|secret|EMAIL_AUTH/);
    const review = loadProject("app/api/review/route.ts");
    const form = new FormData();
    for (const [key, value] of Object.entries({ mode: "photo", name: "Camila", email: valid.email, consent: "yes", text: "", rating: "" })) form.set(key, value);
    form.set("photo", new File([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jp1sAAAAASUVORK5CYII=", "base64")], "event.png", { type: "image/png" }));
    const uploaded = await review.POST(new Request("http://localhost/api/review", { method: "POST", headers: { "Accept-Language": "en", "x-forwarded-for": "test-photo" }, body: form }));
    assert.equal(uploaded.status, 200);
    assert.equal(sentPhoto.mode, "photo");
    assert.equal(sentPhoto.text, "");
    assert.ok(sentPhoto.attachment.content.length > 0);
  } finally { mail.deliverBookingEmail = originalBooking; mail.deliverReviewEmail = originalReview; }
});
