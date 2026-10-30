# Skills inspection & setup record

Inspected 2026-10-30. Location: `~/.agents/skills/` (all 10 new skills live here;
no copies in `~/.claude/skills`).

## Verdict

**All 10 skills load and are usable.** 9 need no setup at all. 1
(`web-design-guidelines`) fetches its rules from a remote URL on every run and
therefore needs network access. 1 (`ui-ux-pro-max`) ships a test suite whose
4 "errors" are an upstream packaging assumption, not a defect in the skill.

## Environment (verified)

| Tool | Version | Needed by |
|---|---|---|
| python3 | 3.12.6 | `design`, `design-system`, `ui-ux-pro-max` scripts |
| node | v22.23.2 | `design-system`, `brand` (`.cjs` scripts) |
| npm / npx | 10.9.8 | `ui-styling` (`npx shadcn@latest`) |
| pytest | **not installed** | not required — scripts use `argparse` CLIs |

All Python imports across the skill scripts resolve to the **standard library**
or sibling modules. **No pip installs required.** No external Python packages.

## Per-skill results

| Skill | Files | Frontmatter | Scripts run? | Setup needed |
|---|---|---|---|---|
| `banner-design` | 2 | ✅ | none | **None** |
| `brand` | 18 | ✅ | `sync-brand-to-tokens.cjs` ✅ runs; **exits: `docs/brand-guidelines.md` not found** | Create `docs/brand-guidelines.md` in a project before use |
| `design` | 38 | ✅ | Python CLIs present (cip/logo/icon) | **None** |
| `design-system` | 27 | ✅ | `validate-tokens.cjs` ✅ runs | **None** |
| `find-skills` | 1 | ✅ | n/a (documents `npx skills`) | **None** |
| `frontend-design` | 2 | ✅ | none | **None** |
| `slides` | 6 | ✅ | none | **None** |
| `ui-styling` | 98 (5.9 MB) | ✅ | fonts bundled locally (81 files), **0 remote font fetches** | **None** for fonts; `npx shadcn` needs network on first use |
| `ui-ux-pro-max` | 90 (4.0 MB) | ✅ | `search.py` ✅, `design_system.py` ✅ | **None** for use |
| `web-design-guidelines` | 1 | ✅ | n/a | **Needs network** — fetches rules each run |

## Validation detail

- **Frontmatter:** 10/10 parse, and `name` matches directory name in every case
  (required for loading).
- **Internal links:** 0 broken. These skills reference external HTTPS URLs, not
  relative files, so there is no in-tree link graph to break.
- **Functional smoke tests run:**
  - `ui-ux-pro-max/scripts/search.py 'saas landing page' --domain landing`
    → returned 2 real patterns (pricing-page-cta, ai-personalization-landing)
  - `design-system/scripts/validate-tokens.cjs --help` → usage printed
  - `brand/scripts/sync-brand-to-tokens.cjs` → ran, then correctly reported a
    missing input file rather than crashing

### `ui-ux-pro-max` test suite

```
Ran 142 tests — errors=4
```

All 4 errors are **collection-time `StopIteration`**, not test failures. Root
cause, from `scripts/tests/test_skill_script_paths.py:24`:

```python
REPO = next(
    parent for parent in Path(__file__).resolve().parents
    if (parent / "scripts" / "generate-catalog-summary.py").is_file()
)
```

The tests search **upward** for `scripts/generate-catalog-summary.py`, which
exists only in the upstream source repository. When the skill is installed into
a flat `~/.agents/skills/` tree, that file is not an ancestor, so `next()` raises.

Affected: `test_catalog_refresh`, `test_catalog_summary_line_endings`,
`test_relevance_evaluator`, `test_skill_script_paths`.

**Impact: none on usage.** These are packaging/CI tests for the upstream repo.
The other **138 tests pass**, and the runtime CLI works. No action needed
unless you want to vendor the upstream repo layout.

## Actions taken

None that modify the skills. No files were edited, no packages installed, no
network configuration changed. This record is documentation only.

## Optional follow-ups (not done)

1. `pip install pytest` — only if you want `pytest`-style output; the bundled
   suites are `unittest`-compatible.
2. `docs/brand-guidelines.md` — create this in a project to enable
   `brand/scripts/sync-brand-to-tokens.cjs`.
3. `npx skills update` — refresh all installed skills from source.

## Relevance to Cognika v2

Potentially applicable, in this order:

| Skill | Use for |
|---|---|
| `web-design-guidelines` | Review `index.html` for a11y/UX compliance alongside audit finding F8 |
| `ui-ux-pro-max` | Query landing-page patterns if F1/F9 (real sub-pages) is approved |
| `design-system` | Only if the CSS is ever tokenised — currently hand-written, not needed |
| `brand`, `banner-design`, `slides`, `design` | `og:image` / social assets if F10 media work expands |

Note: `ui-styling` is shadcn/Tailwind-specific. Cognika's CSS is hand-authored,
so this skill does **not** apply to v2 without a stack change — which is out
of scope.
