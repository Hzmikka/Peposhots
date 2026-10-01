# Deployment fix

The failed Vercel build was caused by an incomplete GitHub commit, not by the page layout or Next.js aliases.

The deployed repository was missing the complete `data/` and `lib/` directories. Components import those modules through `@/data/...` and `@/lib/...`, so Vercel correctly reported module-not-found errors.

This package includes all required source directories at the project root and adds a pre-build structure check so an incomplete future upload fails immediately with a concise missing-file list.

When replacing the GitHub repository contents, preserve these root directories exactly:

- app/
- components/
- data/
- lib/
- public/
- scripts/

Do not place the project inside an extra parent directory.
