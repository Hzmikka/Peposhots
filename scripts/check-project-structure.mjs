import { existsSync } from "node:fs";

const required = [
  "data/barSetups.ts",
  "data/business.ts",
  "data/drinks.ts",
  "data/eventPaths.ts",
  "data/realEvents.ts",
  "data/serviceAreas.ts",
  "lib/bookingDelivery.ts",
  "lib/bookingValidation.ts",
  "lib/requestGuard.ts",
  "lib/scrolling.ts",
  "lib/seo.ts",
  "lib/types.ts",
  "components/layout/SiteExperience.tsx",
  "app/page.tsx",
  "app/layout.tsx",
];

const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error("\nDeployment package is incomplete. Missing required project files:\n");
  for (const path of missing) console.error(`  - ${path}`);
  console.error("\nUpload/commit the entire project root, including the data/ and lib/ directories.\n");
  process.exit(1);
}
console.log(`Project structure OK: ${required.length}/${required.length} required files present.`);
