# Norma lingüística vigent — Higgins Gràfic

**Data de la decisió:** 2026-09-12
**Substitueix:** `norma_tu_vos_catala.txt`, `ux_norma_ellipsis_imperatius.txt`, `ux_nroma_tu_vos_web.txt`

Aquests tres documents incloïen regles sobre l'ús de "vós" i sobre els botons en
imperatiu plural que **no s'apliquen**. Es conserven com a historial, però mana
aquest document.

---

## 1. Tractament al client

**Segona persona del SINGULAR.** Mai el pronom *tu* ni cap subjecte explícit:
el verb ja diu qui actua.

| | |
|---|---|
| ✅ | *"La teva comanda"* · *"Tens 14 dies"* · *"Necessites ajuda?"* |
| ❌ | *"Tu tens 14 dies"* · *"Nosaltres fem servir…"* |

El que s'evita és **la paraula *tu*** (i qualsevol subjecte redundant). Les formes
de segona persona —*teva*, *tens*, *pots*, *reps*— són correctes i no es toquen.

## 2. Botons

**Imperatiu SINGULAR.** Mai infinitiu.

| ✅ | ❌ |
|---|---|
| Desa | Desar · Guardar |
| Confirma | Confirmar |
| Cancel·la | Cancel·lar |
| Esborra | Esborrar |
| Afegeix | Afegir |
| Torna-ho a provar | Tornar-ho a provar |

## 3. Idioma

**Només català.** Cap castellanisme, tampoc els disfressats
(*"Instruccions de Cura"* → *Instruccions de rentat*; *"Nombre de comanda"* →
*Número de comanda*).

**Excepció:** terminologia tècnica sense equivalent consolidat — *software*,
*JSON*, *SKU*, *UID*, *API*, *URL*, *POD (print on demand)*.

## 4. Subjecte el·líptic

El subjecte no s'escriu quan el verb ja indica qui actua. Aquesta norma es manté
i és la raó per la qual la segona persona singular és compatible amb no dir *tu*.

## 5. Llenguatge tècnic i eines de desenvolupament

**Fora de l'abast d'aquesta norma.** El HUD de depuració, les etiquetes de
diagnòstic (`overlay: loading…`, `Dry-run`, `Sprite`, `REF`) i els missatges
interns del servidor que no arriben a l'usuari **es queden com estan**.

L'abast d'aquesta norma és **el text visible a la botiga i als correus**.

## 6. Convenció d'adreces

`/checkout` es manté en anglès com a convenció internacional d'URL.

---

## Com comprovar-ho

Si algun document antic o algun tros de codi contradiu aquest full, **mana
aquest full**. Els tres fitxers originals es van escriure el 16/01/2026 i
contenien contradiccions entre ells (un deia ✅ *"Vós sou benvinguts"* i un altre
el marcava com a ❌).
