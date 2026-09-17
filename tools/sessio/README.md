# Sessió de treball amb un clic

Aquest directori conté el sistema que **reprèn tota la sessió de treball
d'aquest projecte amb un doble clic** des de l'escriptori:

1. engega el **servidor DeepSeek Harness** (`dsh web`) al port `3080`, amb
   l'espai de treball d'aquest projecte, i obre la GUI al navegador;
2. engega el **servidor de proves** (`npm run proves`) al port `8888`, que
   arrenca la instància de **Vite** del `3003` pel seu compte;
3. obre **http://localhost:3003**, que és on es treballa.

```
        doble clic
            │
            ▼
   ┌────────────────────┐        ┌──────────────────────────────┐
   │ sessio.sh          │───────▶│ dsh web           :3080      │  GUI de l'agent
   │ (aquesta carpeta)  │───────▶│ npm run proves → netlify dev │  funcions
   └────────────────────┘        │              └─▶ Vite :3003   │  la web
            │                    └──────────────────────────────┘
            └──▶ navegador: GUI (3080) + web (3003)
```

## Instal·lació (un cop)

```bash
cd tools/sessio
chmod +x sessio.sh instal-la-desktop.sh
./instal-la-desktop.sh
```

Això crea dos fitxers a `~/Desktop`:

| Icona | Què fa |
| --- | --- |
| `Higgins - Engega sessio.command` | Doble clic: engega DSH + proves i obre el navegador. |
| `Higgins - Atura sessio.command` | Doble clic: atura DSH, proves i Vite (demana confirmació). |

Són embolcalls prims: tota la lògica viu a `sessio.sh`. Si mous el projecte,
torna a executar `instal-la-desktop.sh` i els embolcalls s'actualitzen sols.

Per treure'ls: `./instal-la-desktop.sh --desinstal-la`

## Ús

Un doble clic a **Engega sessio** i ja hi ets. El que veuràs:

- S'obre una **finestra de Terminal** que es queda mostrant els registres de
  `netlify dev`. Mentre aquesta finestra és oberta, el servidor de proves
  funciona; **Ctrl-C l'atura** (el servidor DSH continua en marxa).
- S'obren **dues pestanyes** al navegador: la GUI de l'agent (`3080`) i la web
  (`3003`).
- Si el servidor DSH ja era en marxa, **no se'n engega cap altre**: es reutilitza
  la mateixa sessió i es reobre la GUI amb la URL autenticada desada.

## Ordres manuals

```bash
tools/sessio/sessio.sh              # engega-ho tot
tools/sessio/sessio.sh --estat      # què hi ha en marxa ara mateix
tools/sessio/sessio.sh --aturar     # atura-ho tot (amb confirmació)
tools/sessio/sessio.sh --reinicia   # atura i torna a engegar (token nou)
tools/sessio/sessio.sh --simula     # explica què faria, sense tocar res
tools/sessio/sessio.sh --ajuda
```

## Com recupera la sessió

El DSH desa les converses **per espai de treball**, en carpetes derivades del
camí (`~/.dsh/sessions/<clau del camí>/`). Per això `sessio.sh` engega
`dsh web` **amb el cwd del projecte**: és el que fa que la GUI et torni a
mostrar les converses d'aquest projecte i no les d'un altre.

A més, `dsh web` no serveix res sense el **token d'arrencada** que imprimeix a
la sortida. Aquest token és aleatori i només viu a la memòria del procés, de
manera que no es pot endevinar ni recuperar després. El guió, doncs:

- llegeix la línia `dsh web: http://127.0.0.1:3080/?token=…` del registre,
- desa la URL sencera a `.state/dsh.url`,
- i la reobre tal qual als clics següents.

Si el servidor del `3080` l'ha engegat una altra cosa (per exemple, a mà), el
token no es pot saber: en aquest cas s'obre l'arrel `http://127.0.0.1:3080/` i
el navegador reutilitza la seva galeta. Si et surt «unauthorized», aquell
servidor ve d'una altra arrencada: `sessio.sh --reinicia`.

## Ports i fitxers

| Port | Servei | Comanda |
| --- | --- | --- |
| `3080` | GUI de l'agent (DeepSeek Harness) | `dsh web --port 3080` |
| `3003` | Vite (la web) — proxy de `/api` i `/.netlify/functions` cap al 8888 | arrencat per `netlify dev` |
| `8888` | Funcions de servidor (netlify dev) | `npm run proves` |

Tot el que genera el guió queda dins del projecte, a `tools/sessio/.state/`
(no es versiona):

```
.state/
├── dsh.bin    # camí del programa dsh que s'ha fet servir
├── dsh.pid    # pid del servidor DSH engegat pel guió
├── dsh.url    # URL autenticada (amb token) de la GUI
└── logs/
    └── dsh-web.log
```

Els paràmetres (ports, temps d'espera) es poden canviar a `config.sh`; no cal
tocar `sessio.sh`.

## Problemes

**«No trobo el programa dsh».** No hi ha cap `dsh` instal·lat globalment: surt
de la memòria cau de `npx`. Comprova que hi és:

```bash
npx @deepseek-ai/dsh --version
```

El guió el busca tot sol (primer al `PATH`, després a `~/.npm/_npx/*`), i en
desa el camí a `.state/dsh.bin`.

**El navegador diu «unauthorized» a la GUI.** La galeta del navegador és d'un
servidor que ja no hi és, o el servidor del `3080` el va engegar una altra cosa.
Solució: `sessio.sh --reinicia`.

**El port 3003 no respon.** Mira la finestra del Terminal: `netlify dev` hi
escriu els errors. Comprovacions útils:

```bash
tools/sessio/sessio.sh --estat
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3003/
```

**«Port 8888 already in use».** Ja hi ha un `netlify dev` en marxa; el guió no
n'engega cap altre i simplement obre el navegador.

**La finestra del Terminal s'ha tancat.** El servidor de proves ha parat amb
ella. El servidor DSH continua en marxa (va destacat amb `nohup`). Torna a
clicar «Engega sessio».

**Vull veure què faria sense que ho faci.** `tools/sessio/sessio.sh --simula`.
