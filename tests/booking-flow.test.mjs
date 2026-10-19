import test from "node:test";
import assert from "node:assert/strict";
import { requireProject, loadProject } from "./helpers/project-loader.mjs";

const React = requireProject("react");
const { act, create } = requireProject("react-test-renderer");
const { LanguageProvider } = loadProject("components/i18n/LanguageProvider.tsx");
const { PepoExperienceProvider } = loadProject("components/peposhots/PepoExperienceContext.tsx");
const { BookingInquiryForm } = loadProject("components/forms/BookingInquiryForm.tsx");
const { BookingConfirmation } = loadProject("components/booking/BookingConfirmation.tsx");
const { BOOKING_DRAFT_KEY } = loadProject("lib/bookingSupport.ts");

const fields = {
  name: "Test Guest", phone: "7865550123", email: "guest@example.test",
  eventDate: "2030-12-25", eventType: "CORPORATIVO", guestRange: "Hasta 50 invitados",
  location: "Miami", serviceNeeded: "Bartender", venueHasBar: "Sí",
  schedule: "6 PM", setting: "Interior", message: "Event details",
};

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}

// Real React state and handlers; host refs stay null. This is not browser QA.
async function withForm(step, run) {
  const keys = ["window", "document", "HTMLElement", "localStorage", "sessionStorage", "fetch", "FormData", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = new Map(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const local = storage();
  const session = storage();
  session.setItem(BOOKING_DRAFT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), fields, dirty: Object.keys(fields), step }));
  const NativeFormData = globalThis.FormData;
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true, HTMLElement: class {},
    localStorage: local, sessionStorage: session,
    window: { localStorage: local, location: { pathname: "/" }, setTimeout, clearTimeout,
      requestAnimationFrame: () => 1, cancelAnimationFrame() {}, addEventListener() {}, removeEventListener() {} },
    document: { documentElement: { dataset: {} }, activeElement: null },
    FormData: class extends NativeFormData { constructor() { super(); } },
    fetch: async () => { throw new Error("Unexpected request; real network is disabled in this test."); },
  });
  let renderer;
  try {
    await act(async () => {
      renderer = create(React.createElement(LanguageProvider, { initialLanguage: "en" },
        React.createElement(PepoExperienceProvider, null, React.createElement(BookingInquiryForm))));
    });
    await run({ root: renderer.root, session, submit: () => renderer.root.findByType("form").props.onSubmit({ preventDefault() {}, currentTarget: null }) });
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test("submitting an intermediate booking step advances to review without sending", async () => {
  await withForm(0, async ({ root, submit }) => {
    let requests = 0;
    globalThis.fetch = async () => { requests += 1; throw new Error("Must not send before review"); };
    for (const field of ["serviceNeeded", "email"]) {
      await act(async () => { await submit(); });
      assert.equal(root.findByProps({ name: field }).props.value, fields[field]);
    }
    await act(async () => { await submit(); });
    assert.equal(requests, 0);
    assert.equal(root.findByProps({ type: "submit" }).children.join(""), "Check your date");
    assert.equal(root.findAllByType(BookingConfirmation).length, 0);
  });
});

test("rapid duplicate submits send once, freeze edits, and confirm only after server success", async () => {
  await withForm(3, async ({ root, submit, session }) => {
    let requests = 0;
    let resolveResponse;
    let pending;
    const originalHandler = root.findByType("form").props.onSubmit;
    globalThis.fetch = (_url, options) => {
      requests += 1;
      const payload = JSON.parse(options.body);
      assert.equal(payload.email, fields.email);
      assert.equal(payload.context.language, "en");
      return new Promise((resolve) => { resolveResponse = resolve; });
    };
    await act(async () => { pending = submit(); await submit(); });
    assert.equal(requests, 1);
    assert.equal(root.findByProps({ type: "submit" }).children.join(""), "Sending…");
    assert.equal(root.findByType("form").props["aria-busy"], true);
    for (const button of root.findAllByType("button").filter((node) => node.props.className === "booking-back" || node.children.join("") === "Edit")) assert.equal(button.props.disabled, true);
    await act(async () => {
      resolveResponse({ ok: true, json: async () => ({ ok: true, simulated: false }) });
      await pending;
      await originalHandler({ preventDefault() {}, currentTarget: null });
    });
    assert.equal(requests, 1);
    assert.equal(root.findByType(BookingConfirmation).props.summary.eventDate, fields.eventDate);
    assert.equal(session.getItem(BOOKING_DRAFT_KEY), null);
  });
});

for (const [name, json] of [
  ["HTTP 200 without explicit success", async () => ({ message: "Unexpected response" })],
  ["HTTP 200 containing invalid JSON", async () => { throw new SyntaxError("Not JSON"); }],
]) {
  test(`${name} never displays a successful booking`, async () => {
    await withForm(3, async ({ root, submit, session }) => {
      globalThis.fetch = async () => ({ ok: true, json });
      await act(async () => { await submit(); });
      assert.equal(root.findAllByType(BookingConfirmation).length, 0);
      assert.equal(root.findByProps({ role: "alert" }).props.className, "form-error");
      assert.equal(root.findByProps({ type: "submit" }).props.disabled, false);
      assert.ok(session.getItem(BOOKING_DRAFT_KEY));
    });
  });
}

test("a network failure preserves the draft and allows a successful retry", async () => {
  await withForm(3, async ({ root, submit, session }) => {
    globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
    await act(async () => { await submit(); });
    assert.equal(root.findAllByType(BookingConfirmation).length, 0);
    assert.ok(session.getItem(BOOKING_DRAFT_KEY));
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ ok: true }) });
    await act(async () => { await submit(); });
    assert.equal(root.findAllByType(BookingConfirmation).length, 1);
    assert.equal(session.getItem(BOOKING_DRAFT_KEY), null);
  });
});

test("a server validation error returns to the event step with the saved values", async () => {
  await withForm(3, async ({ root, submit }) => {
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: "Review the highlighted fields.", errors: { eventDate: "Choose a date from today onward." } }) });
    await act(async () => { await submit(); });
    assert.equal(root.findByProps({ name: "eventDate" }).props.value, fields.eventDate);
    assert.equal(root.findByProps({ name: "eventDate" }).props["aria-invalid"], true);
    assert.equal(root.findAllByType(BookingConfirmation).length, 0);
  });
});
