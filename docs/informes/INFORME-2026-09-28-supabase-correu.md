# Correu a Supabase (text a punt d'enviar)

**A:** support@supabase.com
**Assumpte:** Egress overage on project jnuuejlxuyqhhkfucuxg (org higginsgrafic) — root cause found and fixed, request for review before 30 Sep

**Adjunts suggerits:** la captura del panell d'Usage amb el desglossament diari del 26, 27 i 28 de setembre.

---

Dear Supabase team,

I am writing regarding the egress quota notice for our organization **higginsgrafic** (org ID `hjykjkntiubkdhcickbu`, project `jnuuejlxuyqhhkfucuxg`), which states that projects will be restricted on **30 September 2026** unless we come back within our plan limits.

We have investigated the overage, found the root cause, and fixed it. We would like to ask you to take this into account before applying the restriction.

## Our usage

Our current billing period (14 Sep – 14 Oct 2026) shows **14.34 GB of billable egress** against the 5.5 GB included in the Free plan. We understand the amount already consumed cannot be undone.

For context, our store is **not open to the public yet**, so there is no customer traffic involved.

## Root cause

Two things, both on our side:

1. **Our product catalog was being fetched in full on every page load.** The query returned all products together with all of their variants (4,116 variant rows, including their image URLs). We measured it with browser performance tooling: **3.02 MB per page load**, requested every time the app mounted. During a normal day of development that is around 125 page loads, i.e. roughly **380 MB per day**. This accounts for the vast majority of the egress.

2. **Our Storage bucket was served without cache.** The bucket held 307 PNG files (545 MB) — original 3000×3000 mockups of 1.4–2.7 MB each — and they were being re-downloaded on every visit, since the objects are served with `Cache-Control: no-cache`.

## What we changed

1. **Cached the catalog query** (in-memory + `localStorage`, 1 hour TTL). The payload shape is unchanged; we simply stopped re-downloading 3 MB on every page view. The admin view that must see changes immediately is deliberately left uncached.
2. **Moved the mockups off Supabase Storage to our own CDN.** All 307 files were converted to WebP (545.5 MB → 36 MB, a 93 % reduction) and are now served from our site with `Cache-Control: public, max-age=31536000, immutable`. Our Storage bucket is now **empty (0 files)**.
3. **Extended cache metadata on uploads** from 1 hour to 1 year, and cleaned up unused objects (167 files, 294 MB, all of which had a verified local copy first).

## Evidence that it is working

From your own Usage dashboard, the daily egress breakdown shows the change taking effect:

| Date | PostgREST | Storage | Total |
|---|---|---|---|
| 26 Sep | 2.088 GB (98.0%) | 43.6 MB (2.0%) | 2.132 GB |
| 27 Sep | 1.188 GB (98.0%) | 24.8 MB (2.0%) | 1.213 GB |
| 28 Sep (after the fix) | 499.7 MB (47.9%) | 543.0 MB (52.1%) | 1.043 GB |

Two clarifications about 28 September:

- The PostgREST figure is already the corrected regime, and it will drop further with the 1-hour cache (the 28 Sep number still includes the period before deployment).
- **The Storage portion on 28 September was caused by our own migration**, i.e. by us downloading those files in order to convert them. We can evidence this from the Storage logs: in a 41-minute window there were 655 requests from our migration scripts (300 of them `DELETE`), 306 system `ObjectRemoved` lifecycle events from the same deletions, 26 requests from our automated browser measurements, and only **12 requests from a real human browser**. There is no unexpected consumer of the project.

## Our request

Given that:

- the root cause has been identified and fixed,
- the Storage bucket is now empty, so that source of egress no longer exists,
- the catalog is no longer re-downloaded on every page view, and
- the daily egress is already falling (from roughly 2 GB/day to below 500 MB/day, and expected to settle in the tens of MB per day),

we would like to ask you **not to apply the restriction on 30 September**, and to allow our project to run normally until the current billing period resets on 14 October 2026. We are also happy to take any further action you consider necessary, and we can provide any additional detail, logs, or measurements you may need.

Thank you very much for your time and for your understanding.

Best regards,
Marc
Higgins Gràfic

---

## Nota per a en Marc (no s'envia)

- **Org ID:** comprovat contra el correu original i la URL del panell: tots dos diuen `hjykjkntiubkdhcickbu`.
- **Adjunt:** la segona captura del panell (la que té el desglossament del 26) és la més convincent, perquè ensenya els 2.088 GB de PostgREST del dia 26 contra els 499,7 MB del 28.
- **Si et demanen més dades:** el desglossament complet és a `docs/informes/INFORME-2026-09-28-supabase-egress.md`.
- **Termini:** el correu hauria de sortir **abans del 30/09**. Com més aviat, més marge perquè ho revisin.
