@AGENTS.md

# Deploying to Coolify (GitHub App, Nixpacks)

This app deploys to Coolify via the standard GitHub App integration (private repo), using Coolify's default Nixpacks builder — no Dockerfile. Deploy target: `main` branch. Env vars (`DATABASE_URL`, `JWT`) are set directly in the Coolify resource's Environment Variables tab, not via a committed `.env` file.

## Known fixes for recurring build failures

**1. `npm ci` fails with `Missing: <pkg>@<version> from lock file` even though the lockfile "looks" in sync.**
Cause: `package-lock.json` was regenerated locally with a newer npm (e.g. npm 11.x), which tolerates incomplete optional-dependency entries that Coolify's bundled npm (10.9.x, shipped with the Nixpacks-provisioned Node) rejects under `npm ci`'s stricter validation. `npm install` locally succeeds and masks the problem.
Fix: regenerate the lockfile with the same npm major Coolify uses: `npx --yes npm@10.9.0 install`, then commit. Verify with `npx --yes npm@10.9.0 ci` before pushing.

**2. Nix build step fails with `error: undefined variable 'nodejs_24'` (or similar `nodejs_<N>`).**
Cause: `package.json`'s `engines.node` field included a range wide enough that Nixpacks picked a Node major version not present in this Coolify server's pinned Nixpkgs snapshot. Only Node 22 is confirmed available here.
Fix: keep `engines.node` pinned to `"^22.12"` only — don't add `>=24.0` or other alternates unless first confirmed available on this server.

**3. `postinstall` (`prisma generate`) fails with `ENOENT: no such file or directory, open '.env'`.**
Cause: `prisma.config.ts` called `process.loadEnvFile()` unconditionally. That throws if no physical `.env` file exists. `.env` is gitignored by design and never reaches Coolify's build context — Coolify injects env vars directly into the process environment instead.
Fix: wrap the call — `try { process.loadEnvFile(); } catch {}` — so a missing `.env` is a no-op and `env("DATABASE_URL")` falls through to the real injected env var.

**4. Same lockfile/Nix error persists after a "fix" is committed.**
Cause: fixes were committed to a feature branch, but Coolify tracks and deploys `main` — the feature branch was never merged in. Check `git log --oneline main..<feature-branch>` to see what's missing from `main` before assuming a fix didn't work.
Fix: fast-forward merge the feature branch into `main` and push both.

## Workflow used for these fixes

Work happens on `feature/authorization`; after verifying a fix locally, commit there, then:

```bash
git checkout main && git merge feature/authorization --no-edit && git push origin main
git checkout feature/authorization && git push origin feature/authorization
```

