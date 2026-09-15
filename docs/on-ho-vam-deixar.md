# On ho vam deixar — 15 de setembre de 2026

**Si acabes d'arribar i no saps res d'aquest projecte, llegeix això i després els
tres documents que s'hi esmenten. Amb això tindràs tot el context que cal.**

Ordre de lectura:

1. `docs/constitucio.md` — les regles que no es poden trencar. **Comença per aquí.**
2. `docs/informe-sistema-factures.md` — com funciona el sistema de factures.
3. `docs/pla-mode-de-proves.md` — la propera feina, ja planificada.

I si has de tocar la manera d'escriure, `docs/guia-pronoms-febles.md` i
`docs/nota-falsa-alarma-seguretat.md` (aquesta segona explica un error meu, perquè
no es torni a repetir).

---

## Què està fet i funcionant

- **Sistema de factures sencer**: numeració correlativa a la base de dades, factura
  automàtica en pagar, pàgina imprimible, correu amb enllaç, llistat del client i
  llistat de l'administrador amb filtres i totals per trimestre.
- **Editor de factura manual** amb esborranys, rectificatives i exportació CSV.
- **Catàleg sincronitzat** des de Gelato: 63 productes, 3.976 variants, totes amb
  talla i color correctes.
- **Rol d'administrador comprovat bé** (cal `role = 'admin'`, no només estar actiu).
- 248 tests que passen.

## Què està pendent

| # | Què | On |
|---|---|---|
| 1 | Comprovar si falten migracions per executar | vegeu més avall |
| 2 | **Mode de proves** (comandes de prova sense gastar número) | `docs/pla-mode-de-proves.md` |
| 3 | Una comanda de prova amb la targeta `4242 4242 4242 4242` | per veure el circuit sencer |
| 4 | Refés les fitxes de Gelato amb la **Gildan 64000** i **DTF** | ho ha de fer l'amo |
| 5 | Confirmar amb la **gestoria** el criteri de les sèries FO/FS/FR | conversa pendent |
| 6 | La factura en **PDF com a fitxer** (avui és una pàgina imprimible) | millora |

## Com comprovar l'estat de les migracions

Al Supabase → SQL Editor:

```sql
SELECT tablename, rowsecurity,
       (SELECT count(*) FROM pg_policies p
         WHERE p.schemaname = 'public' AND p.tablename = t.tablename) AS politiques
FROM pg_tables t WHERE t.schemaname = 'public'
ORDER BY tablename;
```

I per saber si les validacions de factures hi són:

```sql
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.invoices'::regclass AND NOT tgisinternal;
```

Han de sortir dos: `invoices_no_update` (immutabilitat) i
`invoices_validacio_imports` (rectificativa negativa i imports que quadren).

## Com treballar-hi

```bash
npm run dev        # servidor de desenvolupament (port 3003)
npx vitest run     # els 248 tests
npm run build      # comprovar que compila
```

**No es desplega.** Es fa commit i push, i prou. La resta és a la constitució.
