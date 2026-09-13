# El dia de la publicació — llista de passos

**Data:** 2026-09-13
**Per a:** Higgins Gràfic
**Complementa:** `la-meva-botiga-explicada.md`, `remediacio-2026-09-12.md`

Aquest document no és cap diagnosi ni cap llista de problemes: és la llista de
les coses que s'han de fer **el dia que es publiqui la botiga de debò**. Hi és
perquè cap d'elles no es pugui oblidar.

---

## Com estan les coses ara mateix

| | Domini | Què és |
|---|---|---|
| **Banc de proves** | `dev.higginsgrafic.com` | Aquí es fan les proves. Projecte de Netlify `comfy-croquembouche-606269`, repositori `higginsgrafic-ecommerce-dev`. Tot configurat i funcionant: pagaments, correus, Gelato. |
| **Botiga de debò** | `higginsgrafic.com` | El domini que veurà la gent. **Encara no està actualitzat**: ara mateix serveix una versió antiga, d'un altre projecte de Netlify (`frolicking-tarsier-217e1f`) i d'un altre repositori (`higginsgrafic-ecommerce-4`), que no té ni les claus ni la configuració. |

O sigui: el que estem construint i provant a `dev` és el que, quan arribi el
moment, ha de quedar servint a `higginsgrafic.com`. Que `higginsgrafic.com`
estigui desactualitzat no és cap error: és que encara no hi hem arribat.

---

## Què cal fer el dia de la publicació

### 1. Passar el domini al projecte bo

El domini `higginsgrafic.com` s'ha de treure del projecte vell
(`frolicking-tarsier-217e1f`) i afegir-lo al projecte bo
(`comfy-croquembouche-606269`, el de `dev`).

- La DNS ja és a Netlify i els dos dominis comparteixen la mateixa zona
  (`dns1-4.p09.nsone.net`), així que no s'ha de tocar cap configuració de
  l'usuari ni esperar propagacions llargues.
- Un cop fet, `higginsgrafic.com` i `dev.higginsgrafic.com` serveixen **la
  mateixa botiga**: un sol codi, unes soles claus, un sol lloc on desplegar.
- `dev.higginsgrafic.com` es pot quedar com a camp de proves permanent.

### 2. Apagar el mode "en construcció"

Mentre estigui encès, qualsevol visitant acaba a la pàgina d'avís i d'allà a
Etsy. Està guardat a la base de dades (taula `media_pages`, fila amb
`slug = 'default'`, camp `global_redirect`), no al codi: funciona igual a
qualsevol domini.

- Cal posar-lo a **fals** el dia de la publicació.
- Mentre es fan proves, per veure la botiga sense apagar-lo per a tothom, hi ha
  el commutador **"EC bypass"** de la barra d'administració.

### 3. Canviar les claus de Stripe

Ara hi ha les claus **de prova** (`pk_test_…` / `sk_test_…`). El dia de la
publicació s'han de canviar per les **de debò** (`pk_live_…` / `sk_live_…`) a
Netlify, i tornar a desplegar.

- La clau publicable va a `VITE_STRIPE_PUBLISHABLE_KEY` i la secreta a
  `STRIPE_SECRET_KEY`.
- **Mentre siguin claus de prova, el sistema NO envia res a Gelato**, a posta:
  una compra de prova no ha de fer imprimir ni enviar res de debò. Quan es
  canviïn per les de producció, aquest bloqueig desapareix tot sol (no hi ha
  cap interruptor que es pugui oblidar).
- Cal comprovar que el webhook de Stripe apunti a `higginsgrafic.com` i no a
  `dev`. Ara mateix apunta a `dev`, perquè és l'única botiga que funciona.
  També caldrà el webhook del **mode de producció** de Stripe (el de proves i
  el de debò són dues llistes separades).

### 4. Comprovar que tot funciona al domini nou

- Una compra de prova de cap a cap.
- Que arribin els correus (confirmació, enviament...).
- Que l'avís de Gelato actualitzi l'estat de la comanda.

---

## Coses que ja estan resoltes i no caldrà tornar a tocar

- **Els enllaços i les imatges dels correus** no porten cap domini escrit a mà:
  agafen el domini del lloc on viu la botiga (`netlify/lib/site-url.js`). El
  dia que el domini principal sigui `higginsgrafic.com`, els correus hi
  apuntaran tot sols. Hi ha una prova automàtica que impedeix que algú hi torni
  a escriure el domini fix.
- **Els avisos de pagament de Stripe** (quina adreça i quins esdeveniments) ja
  estan ben configurats per al mode de proves.
- **Els avisos de Gelato** ja gestionen els tres tipus d'avís i desen tots els
  números de seguiment quan una comanda surt en més d'un paquet.
