---
description: Task workflow (unitats de canvi)
---

# Objectiu

Evitar barreges de canvis (100s/1000s) i obligar a treballar per **unitat de canvi**.

- **Una unitat = una branca** (ex: `task/git/unify-history-20260114`)
- **Una unitat = commits petits i coherents**
- Quan acabes una unitat: **stage només el que toca** i **commit immediat**.

# Categories recomanades

- `git`
- `calibratge`
- `mockups`
- `ui`
- `api`
- `infra`
- `assets`

# Ritual (start → work → finish)

## 1) Abans de començar

- Comprova l'estat:

  `npm run task:status`

- Si tens canvis pendents: o bé els commiteges (si són una unitat acabada) o bé els guardes/stash.

## 2) Inicia una unitat

Exemples:

- `npm run task:start -- --cat git --name unify-history`
- `npm run task:start -- --cat calibratge --name cube-iron-cube-68`

Això:
- exigeix working tree net
- fa checkout a `main` + pull
- crea una branca `task/<cat>/<name>-YYYYMMDD`

## 3) Durant la feina

Regles:
- si veus que estàs tocant 2 àrees (p.ex. `src/` i `scripts/` i `supabase/`) atura i decideix si és **una** unitat o són **dues**.
- fes commits petits quan tanques una peça.

## 4) Tancar una unitat

1. Stage només el que pertany a la unitat:

   `git add <fitxers>`

2. Comprova que no queda res untracked/unstaged:

   `npm run task:status`

3. Fes el commit (automàtic):

   `npm run task:finish -- --msg "<missatge>"`

Opcionalment, per fer push a la branca:

- `npm run task:finish -- --msg "<missatge>" --push`
