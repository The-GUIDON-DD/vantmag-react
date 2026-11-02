If this repo doesn't have an existing AGENTS.md, use the following pattern for React/VantMag projects. Preserve and only remove verified guidance, add nothing more than what you can verify.
Repo Location & Entry Points
- Repository: /home/julyanna/GitHub/vantmag-react
- Default base: check package.json root scripts or .github/workflows/ for CI commands
- Monorepo boundary: look for packages.jsonc, tsconfig.base.json, or shared dependency lists in root
  Development Commands (Verify Before Writing)
- Run npm run lint:check then npm run build before making changes if linter/format checks exist
- Test entry points: check scripts like test, vitest, or paths like src/ / lib/ for test runners
- Dev server: verify whether start, dev, or serve is used in scripts
  Build & Config Flow

1. Source of truth: tsconfig.json, package.json, build.config.ts (if any), .vitestrc / .eslintrc.js
2. Codegen triggers: check for CLI commands that regenerate files or type definitions before committing
3. Typecheck first: if TypeScript, ensure type errors are caught before runtime checks (npm run typecheck)

Backend
- The project's backend is a WordPress REST API.
- It has one custom endpoint for returning N random articles.

  Testing Conventions

- Unit tests for `app/fetchers.ts` must verify:
  - Correct return type on successful fetch.
  - Errors are thrown on failed fetches or non-ok responses.
  - Invalid parameters (e.g., negative offsets) throw errors before calling `fetch`.
  - Fetch URL parameters are correct according to the function's purpose.
  - A "valid category" is defined as any category whose ID is present in the `categories` constant in `app/constants.ts`.
- Integration test prerequisites: verify docker-compose.yml or infra services if tests need background processes
- Flaky suite markers: look for flags like --update-snap, skipOnSlow, or CI environment markers in test files or scripts
- Coverage threshold: check .codeclimate.jsonc or similar CI gates in GitHub Actions
  Style & Conventions (Repo-Specific)
- ESLint: check rule overrides or ignores from root .eslintrc.js
- File naming: prefer .ts, not .tsx unless it's a component entry point
- Commit messages: if conventional commits are enforced, verify the commit checker script
  Environment & Deploys
- Build output location: npm run build/dist/output or similar for artifacts
- Infra config in root: check wrangler.json, .dockerignore, or docker-compose.yml if deploying to Cloudflare/Cloud
- Secrets handling: verify .env.local is loaded or stored in CLI secrets if relevant
  Existing Guidance (Preserve & Reconcile)
- If opencode.json or instruction files exist, copy their rules into this file for consistency
- Keep verifiable references to internal documentation paths only
- Remove any advice that requires assumptions beyond what exists in scripts/configs
  Questions to Ask (Only If Needed)

1. Is there a CI/CD pipeline? Yes: where's the deploy script and which command runs tests before deployment?
2. Any flaky test suites or known expensive tests that require special handling or isolation?
3. Are there team conventions for PR review or branch protection (e.g. required status checks)?
   Writing Rules Summary (Self-Instructions)

- Don't include generic React advice already covered in docs
- Only add facts you can verify by checking configs/script/CI flows
- Keep sections short; avoid file trees unless they define important paths
- Update this file when scripts or configs change; preserve verified patterns only
