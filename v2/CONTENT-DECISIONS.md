# Content decisions requiring owner confirmation

From `docs/website/CONTENT_SPECIFICATION.md` § "Content still requiring owner
confirmation", plus items I hit while implementing. **Nothing below was
invented** — where the spec did not supply a fact, I left a placeholder and
flagged it here rather than filling it in.

## 1. 🔴 Official contact email — BLOCKING for `/contact/`

The spec says: *"Use only the existing verified Cognika email address and
contact channels. Do not invent telephone numbers, office addresses or social
media accounts."*

**No verified email exists in this repository.** I searched every `.md`,
`.html`, `.php`, `.txt`, and `.sh` file. The only `@cognika.tech` address found
anywhere is `cognikaftp@cognika.tech`, which is an FTP account — not a public
contact address.

**What I shipped:** `/contact/` currently contains a placeholder link to
`info@cognika.tech`, clearly marked with an HTML comment:

```html
<!-- OWNER CONFIRMATION REQUIRED: this address is not yet verified.
     See v2/CONTENT-DECISIONS.md item 1. Replace or remove before deploy. -->
```

**Needed from you (pick one):**
- **(a)** Confirm `info@cognika.tech` is the real, monitored address → I remove the comment.
- **(b)** Give me the correct address → I substitute it.
- **(c)** No public email yet → I remove the mailto entirely and `/contact/`
  keeps only the invitation text, with no fabricated channel.

**Do not deploy `/contact/` with an unverified address.**

## 2. 🟠 `/projects/` page — added, not in the spec

The spec lists "Projects" as a top-level nav item but defines no `/projects/`
content. Two options were available: point "Projects" at an anchor, or create a
real page. I created `/projects/` with an H1, one sentence of spec wording, and
three cards linking to the project pages. **No new claims** — the card copy is
lifted from the project pages' own opening statements.

**Confirm** you want `/projects/` to exist. If not, I will repoint the nav item
to `/` and delete the page.

## 3. 🟠 Naming: spec says `pat_ia`, existing site says `pa_ia`

| Source | Spelling |
|---|---|
| `CONTENT_SPECIFICATION.md` (authoritative) | **`pat_ia`** |
| Existing `index.html` nav | `pa_ia` |
| Spec's own URL for the page | `/pa-ia/` |

I followed the spec for **visible text** (`pat_ia`) and used the spec's URL
(`/pa-ia/`). **This mismatch should be resolved** — if the product name is
`pat_ia`, the URL `/pa-ia/` is a small inconsistency. I kept it because the spec
specifies that URL explicitly.

## 4. 🟡 e_os technical depth

The spec asks whether `e_os` should publish detailed technical specifications or
retain a higher-level description. I implemented the **higher-level** version
only, exactly as written. No specifications added.

## 5. 🟡 pat_ia expansion

The spec asks whether `pat_ia` should be expanded into a fuller product
description. I implemented only the concept text supplied. No expansion.

## 6. 🟡 SRM simulation results — not published

The spec states: *"Any efficiency-class result must be described as a simulation
result, not a certified IE5 classification."* and asks which results are
suitable for public disclosure.

**I published no efficiency figures at all.** The page shows only the design
parameters the spec supplied (150 mm, 100 mm, 3 N·m, 1,000 rpm, inverter-fed)
and labels them as design targets. No simulated or measured performance numbers
appear. Nothing to disclose until you approve specific figures.

## 7. 🟡 Social profiles / `sameAs`

No verified social profiles exist, so the `Organization` JSON-LD carries **no
`sameAs`** property (audit finding F6 remains open). Supply authoritative
profile URLs and I will add them.

## 8. ✅ Editorial constraints — how each was honoured

| Constraint | Implementation |
|---|---|
| No invented projects/capabilities | Only e_os, pat_ia, Srm_p — the three in the spec |
| No invented specs or results | Srm_p shows design parameters only, labelled as such |
| Don't claim deployment | e_os status says "tested in simulation, progressing toward on-site testing"; spec's forbidden phrase "deployed in operational buildings" is absent (verified by grep) |
| Don't present concepts as available | pat_ia page is titled "Project concept" with a status note stating capabilities are a direction, not available features |
| Distinguish concept/simulation/measured | Explicit `.status-note` block on every project page |
| No IE5 / certification claims | Verified absent by grep |
