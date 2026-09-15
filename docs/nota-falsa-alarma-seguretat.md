# Nota: la falsa alarma de seguretat (15 de setembre de 2026)

**Què vaig dir.** Que 21 de les 24 taules del projecte eren llegibles i escrivibles amb la clau pública, que la taula `staff` permetia fer-se administrador, i que calia tancar-ho amb urgència.

**Què era cert.** **Res d'això.** La base de dades estava ben protegida des del principi.

## Com m'hi vaig equivocar

Dues proves mal fetes, totes dues per llegir malament una resposta buida:

1. **La lectura.** Vaig consultar cada taula amb la clau pública i vaig interpretar que la consulta **s'havia resolt**. Però en una base de dades amb seguretat de files, una consulta que no et deixa veure res retorna una **llista buida**, no un error. Vaig llegir «no em dona error» quan volia dir «no em dona res».

2. **L'escriptura.** Vaig fer un `UPDATE` amb un filtre que no coincideix amb cap fila i em va tornar un codi d'èxit. Però **si no hi ha cap fila, no s'arriba a comprovar cap permís**: aquell èxit no volia dir res. La prova correcta hauria estat un `INSERT` amb dades invàlides, que provoca un error de permisos **abans** de comprovar les dades.

## Què vaig fer malbé

- Dues migracions (`20260915250000` i `20260915270000`) que **no calien**. Activen la seguretat en taules que ja la tenien activada. Són innòcues —no fan res— però els seus comentaris diuen coses falses.
- Dos missatges de commit que també ho diuen.

**Comprovat ara mateix, amb la clau de servei i amb la clau pública:**

| Taula | Files reals | Files visibles al públic |
|---|---|---|
| `staff` | 1 | 0 |
| `profiles` | 1 | 0 |
| `addresses` | 1 | 0 |
| `messages` | 4 | 0 |
| `orders` | — | accés denegat |
| `products` | 63 | 63 (correcte: el catàleg és públic) |
| `product_variants` | 3.976 | 3.976 (correcte) |

## Què queda per comprovar, de debò

L'única pregunta que **no** he resolt: si alguna política de seguretat permet **escriure** on no toca. La consulta que ho diu:

```sql
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

Fins que no es miri això, no es pot afirmar res sobre l'escriptura. I aquesta vegada no ho afirmo.

## La lliçó, per escrit

1. **Una resposta buida no és una resposta.** Cal comprovar sempre contra el que hi ha de debò, amb una clau que ho pugui veure tot.
2. **Una prova que no toca dades no prova permisos.** Cal una operació que arribi a la comprovació.
3. **Abans d'avisar d'un forat de seguretat, comparar les dues bandes.** Servidor i públic. La diferència és la resposta.
