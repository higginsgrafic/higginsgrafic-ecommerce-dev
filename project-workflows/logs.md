---
description: Daily Logs Routine (work + language)
---

# Goal

Create a lightweight, daily log routine that forces:
- reading the latest logs at the start of each session
- writing a short summary at the end of each session

Logs are split by category so work notes and language notes never mix.

# Folder layout

- `project-logs/WORK/YYYY-MM-DD.md`
- `project-logs/LANGUAGE/YYYY-MM-DD.md`

Templates:
- `project-workflows/templates/log-work.md`
- `project-workflows/templates/log-language.md`

# Session ritual

## 1) Session start (mandatory)

1. Open and read:
   - latest file in `project-logs/WORK/`
   - latest file in `project-logs/LANGUAGE/`

2. Create today's files if missing by copying templates:
   - `project-logs/WORK/YYYY-MM-DD.md`
   - `project-logs/LANGUAGE/YYYY-MM-DD.md`

3. Add a short header line in each log:
   - what you will do today
   - what not to touch today (scope guard)

## 2) During work

Append short bullets only (no long narratives):
- decisions
- changed files / routes
- open questions
- next actions

## 3) Session end (mandatory)

Append a final section:
- What changed today (3-10 bullets)
- What is still broken / unknown (0-5 bullets)
- Next session: first 1-3 actions

# Adding new categories

When we add a category:
- create a new folder in `project-logs/<CATEGORY>/`
- create a new template `project-workflows/templates/log-<category>.md`
- keep the same daily naming: `YYYY-MM-DD.md`
