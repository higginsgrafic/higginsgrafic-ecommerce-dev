# START HERE (for new AIs)

## What this repo is
- Project: `grafic-ecommerce3`
- Goal (current focus): polish the `/nike-tambe` demo page and keep the debug/layout inspector usable.

## Current state (2026-01-18)
### Done
- `/nike-tambe` respesca editorial layout refined.
- Debug/layout inspector:
  - structure outlines visible when inspector is active
  - selection highlight (`debug-selected`) clearly visible
  - tokens humanized (prefer `id` / `data-*` / `aria-*` / `role` / semantic classes)
- BG toggle in debug toolbar synced with localStorage (`NIKE_TAMBE_BG_ON`).
- Cloudflare/Netlify diagnosis + fix path documented.

### Open / next work
- Fix footer gap on `/nike-tambe` structurally (avoid fragile spacer). 
- Visual validation: BG ON/OFF does not affect layout.

## Source of truth files (touch these first)
- `/nike-tambe` page: `src/pages/NikeTambePage.jsx`
- Debug/layout inspector: `src/App.jsx`
- Debug CSS: `src/index.css`

## Logs (read order)
1. WORK: `project-logs/WORK/2026-01-18.md`
2. LANGUAGE: `project-logs/LANGUAGE/2026-01-18.md` (Catalan normalization rules)

## First actions for a new session
1. Open `/nike-tambe` and reproduce the footer gap.
2. Replace the spacer approach with a robust layout solution.
3. Validate BG toggle visually (ON and OFF).

## Constraints / reminders
- Keep UI minimal and “editorial”.
- Prefer stable semantic identifiers (`data-*`) for debug tokens.
- Avoid brittle hacks (especially fixed pixel spacers) unless explicitly accepted.
