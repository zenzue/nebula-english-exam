# NEBULA | English Proficiency Assessment

**Author:** Aung Myat Thu  
**Stack:** SvelteKit 5 + Vite+ 1.4.0 (`vp`) + Node.js + SQLite

A dark, Apple Liquid Glass-inspired, sci-fi SvelteKit assessment system with **300 server-owned questions**, **60 questions per exam**, **a one-hour timer**, **3 total attempts per local day (1 initial + 2 retakes)**, automatic server-side grading, ranks, leaderboards, and personalised study advice.

## Quick start

Requirements: Node.js **22.18+ or 24.11+** (use a supported Vite+ release, preferably Node 24 LTS), **Vite+ CLI (`vp`)**, an npm-compatible package manager, a persistent local disk, and HTTPS when deployed. The application uses Node's built-in `node:sqlite` (still experimental in some Node 22 releases) so there is no native SQLite driver to compile. For multi-instance/high-availability production, replace its data layer with PostgreSQL before rollout.

```bash
# Install the official Vite+ CLI once (Linux/macOS), if `vp` is not available:
curl -fsSL https://vite.plus | bash

cd nebula-english-exam
vp install
cp .env.example .env
# Edit .env: ADMIN_EMAIL, ADMIN_PASSWORD (>=16 unique characters), ORIGIN
vp run seed:admin
vp dev
```

On Windows, install Vite+ using the official PowerShell installer (`irm https://vite.plus/ps1 | iex`). Close and reopen the terminal after installing `vp`. The global CLI delegates to the project's pinned `vite-plus@1.4.0`. Alternatively, if you already have Node.js and npm, run the local CLI with `npm exec -- vp <command>` after dependency installation.

Open `http://localhost:5173`. The instructor account is created using the CLI, *never* via the public registration page. Student registration creates only student accounts. The sample account details in `.env.example` are placeholders, not credentials.

For production (Node server, **not static export**):

```bash
vp build
NODE_ENV=production ORIGIN=https://exam.example.edu vp run start
```

The `vite.config.js` file loads `.env` for `vp dev` and `vp build`; the standalone Node server and instructor-seeding scripts load `.env` using Node’s `--env-file` option. Vite+ is a build tool only; all student authentication, timing, grading and answer keys still run on the SvelteKit server. Do not expose the development server on the Internet.

Set `DATABASE_PATH` to a persistent volume and `QUESTION_BANK_PATH` to a private server-readable file. If run behind a reverse proxy, set the proxy Host/Origin correctly. Run using a restricted system user, HTTPS, firewall rules and automated encrypted database backups. Rotate secrets and use strong passwords. For deploys to multiple app instances use a transactional server database (PostgreSQL) rather than per-instance SQLite.

## Student experience

1. Register or log in.
2. Start an exam from the dashboard. An in-progress attempt resumes after refresh.
3. The server picks 40 grammar/vocabulary questions plus four full five-question reading passages (20 reading questions), randomly from a private bank.
4. **Exactly one question** and its four options are returned at a time to the student, with any passage needed for that question. `correctIndex` and the other bank entries stay server-only. Responses are saved by server POST.
5. At 60 minutes the exam expires; server submissions after the deadline are rejected and existing responses are graded. A student may finish early.
6. Result page shows pass/fail, S/A/B/C/D/F grade, percent, counts by skill, current leaderboard position and tailored learning suggestions. It deliberately does **not** reveal which answer was correct.
7. One initial attempt and two retakes are allowed per **Asia/Bangkok calendar day**, configurable by `EXAM_TIMEZONE`.

**Scoring:** 70% pass. S 95–100; A 85–94; B 75–84; C 70–74; D 60–69 (fail); F below 60 (fail). On a 60-question exam the minimum pass is 42/60. Leaderboard ranks the **best completed attempt** for each student (public name and score only).

## Instructor access

`/admin` is only accessible by an authenticated `admin` user. It displays overall performance, recent results, and paginated question-bank entries with an answer-reveal control. Full instructor exports are in `private/instructor-answer-key.csv` (all 300) and `private/original-questions-answer-key.csv` (75 original). These files should remain on private instructor storage.

**Source fidelity note:** The first 50 short questions were transcribed from the supplied screenshots. Five reading passages and their 25 questions were reconstructed/paraphrased from low-resolution photos to make them readable, and each is flagged `needsInstructorReview: true`. Instructors must verify them against the original paper before using in a high-stakes scored exam. The 225 new practice questions were newly authored for this app, not sourced from the user's original exam.

## Security boundaries — important

- The full bank and keys are in `private/question-bank.json`, loaded only by `src/lib/server/questions.js`, **never** a Svelte component or `static/` asset. Student pages use only the minimal fields needed to render the current question. SvelteKit's server-only module import boundary prevents accidental client bundling of `$lib/server` modules.
- Authentication uses per-user `scrypt` password hashes and random session cookies (`HttpOnly; SameSite=Lax; Secure` in production), with a SHA-256 hashed session token in SQLite. The exam locks question lists and daily quotas in database transactions; only the server can grade, track time or decide pass/fail.
- Responses to student exam and result pages are `Cache-Control: no-store, private`. Form actions use SvelteKit origin checking. Basic login throttling limits brute-force attempts; administrators should add WAF/CDN rate limiting and audit logs for real production deployment.
- Browser text selection, `copy`, and context-menu are disabled **only as a deterrent** on the test interface. Anyone who can see a question can copy it through screenshots, OCR, accessibility tools, browser DevTools, the network response, or a camera. This **cannot be prevented by website code**. Never claim otherwise or rely on anti-copy controls for high-stakes proctoring.
- This is a starter application, not a certified anti-cheat/proctoring product. For high-stakes use add authoring review, stronger identity checks, server-side randomisation rules, audit events, observability, autoscaling, device/policy controls, accessibility testing, database migration tooling and formal security/penetration testing. Kiosk mode and supervised assessment may reduce casual cheating but do not hide the currently displayed question.
- Because the user requested access to the entire instructor bank, the **downloaded source ZIP includes teacher-only material**. Do not publish this ZIP or the `private/` directory to a public GitHub repository. For production, move the question bank to a protected secret volume or private database, and exclude original teacher exports from your source-control repository.

## Test

```bash
vp run test:logic   # Node built-in server-side question and scoring tests
vp run check        # SvelteKit sync and Svelte component checking
vp check            # Vite+ formatting, lint and code checks
vp build            # Production SvelteKit build
```

`vp run test:logic` validates bank size, answer indices, reading group sizes and grading thresholds using Node built-ins. `vp run check` runs the dedicated SvelteKit checker (note: `vp check` is Vite+'s *built-in* toolchain check, not the `check` package script). `vp build` creates the SvelteKit Node server after dependencies are installed. A manual end-to-end smoke test should register a student, start an exam, save answers, finish it, verify the leaderboard, and confirm an ordinary student receives 403 on `/admin`.

## Project layout

```text
src/lib/server/           Private DB, questions, authentication and grading
src/hooks.server.js       Cookie session + security headers
src/routes/login/         Student login and registration
src/routes/dashboard/     Attempts and history
src/routes/exam/          Server-backed one-question-at-a-time exam
src/routes/results/[id]/  Graded report (never sends the key)
src/routes/leaderboard/   Best-attempt ranking
src/routes/admin/         Instructor-only question browser
private/                  Private question bank and instructor answer keys
scripts/                  Bank builder and instructor creation
```

## Vite+ migration notes

- `vite-plus@1.4.0` is a pinned local development dependency. `vite` is aliased to the matching Vite+ core package with an npm override, avoiding a second incompatible Vite copy; Vitest is pinned to the Vite+ bundled version.
- The project remains a SvelteKit SSR Node-server application. **Do not use a static-site export** because grading and exam timing run only on the server.
- `.env` is consumed by the server process; `VITE_*` variables should never include question-bank contents or secrets.
- There is no checked-in dependency lockfile in this supplied starter package. Run `vp install` on a supported Node.js version and commit the generated lockfile after validating your dependency graph.
- The migrated package manifest, Vite configuration, author metadata and Node logic tests were checked, but **Vite+ dependencies could not be downloaded or the app compiled in the authoring environment**. After installing dependencies, run `vp run check`, `vp check`, `vp build` and an end-to-end smoke test before production use.

Built as a distinct starter project, not yet connected to any student roster or external identity provider. Add OIDC/SAML integration if your university requires it.
