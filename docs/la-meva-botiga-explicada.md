# La teva botiga, explicada

**Un mapa en llenguatge pla, sense codi.**
Per a qui ha construït una botiga amb curiositat i esforç, i ara vol veure-hi clar.

---

## 0. Per què existeix aquest document

No és un manual tècnic. És un **mapa**.

L'objectiu és que, al final, tinguis al cap una imatge de la teva botiga com la tindries d'una casa: saps on és la cuina, on van els cables, quina clau obre quina porta i per on entra l'aigua. No cal que sàpigues fer lampisteria per tenir aquesta imatge.

Quan tinguis el mapa, les decisions deixaran de ser a cegues.

---

## 1. Les peces: qui fa què

La teva botiga no és un programa. Són **vuit serveis** que es passen la feina entre ells.

| Peça | Què és | Què fa per tu |
|---|---|---|
| **Netlify** | L'hostatjament | Guarda i serveix la teva pàgina. També executa la part de "servidor" |
| **Supabase** | La base de dades | Guarda productes, comandes, col·leccions. També els comptes d'usuari i les imatges |
| **Stripe** | Els pagaments | Cobra les targetes. **Les dades de les targetes no passen mai per casa teva** |
| **Gelato** | El proveïdor d'impressió | Rep la comanda i imprimeix i envia la samarreta |
| **Resend** | El servei de correu | Envia els correus de confirmació, enviament, contacte |
| **Sentry** | El vigilant d'errors | Li arriba un avís quan alguna cosa peta a la pàgina d'un client |
| **GitHub** | El magatzem del codi | Guarda l'historial de tot el que s'ha escrit. **És públic** |
| **Plausible** | Les estadístiques | Compta visites sense posar cookies als clients |

**Una cosa important que sovint no es té clara:** Stripe és qui toca les targetes. Tu mai no veus un número de targeta ni el guardes. Això és una sort enorme i és per disseny, no per casualitat.

---

## 2. El camí d'una comanda

Aquest és el mapa principal. Segueix-lo de dalt a baix: és el que passa des que algú fa clic fins que rep una samarreta.

```
1.  El client obre higginsgrafic.com
        └─ Netlify li entrega la pàgina

2.  La pàgina demana els productes
        └─ Supabase respon amb el catàleg

3.  El client tria color, talla i acabat
        └─ Dins del mega-slide

4.  Afegeix al cistell
        └─ El cistell viu dins la pàgina (al navegador del client)

5.  Va al pagament i omple l'adreça
        └─ Encara som al navegador

6.  La pàgina demana al TEU SERVIDOR que prepari el cobrament
        └─ Netlify executa una funció teva
        └─ ⚠️ Aquí el servidor RECALCULA el preu des de la base de dades.
           Mai es refia del que li diu el navegador.

7.  El servidor crea una "comanda pendent" a Supabase
        └─ I demana a Stripe que prepari el cobrament

8.  El client paga
        └─ Stripe cobra la targeta

9.  Stripe avisa el teu servidor: "s'ha pagat"
        └─ Això s'anomena "webhook": Stripe truca a la teva porta

10. El teu servidor fa tres coses:
        ├─ Marca la comanda com a confirmada
        ├─ Envia la comanda a Gelato amb l'adreça
        └─ Demana a Resend que enviï el correu de confirmació

11. Gelato imprimeix i envia
        └─ I et retorna un número de seguiment

12. El client rep la samarreta
```

**Els passos 6 i 10 són el cor de tot.** Són on es decideix si la botiga és sòlida o no:
- Al **6**, el servidor decideix quant es cobra.
- Al **10**, el servidor decideix què es fabrica.

Tot el que passi al navegador (passos 1 a 5) és **proposta**, no **decisió**.

---

## 3. On viu cada cosa

Aquesta és la taula que et cal tenir al cap. Quan una dada viu en dos llocs, comença el desordre.

| Dada | On viu | Qui la pot canviar |
|---|---|---|
| **Els dissenys** (noms, rutes, imatges) | ⚠️ **En DOS llocs**: al codi de la pàgina **i** a la base de dades | Tu, però en dos llocs diferents |
| **Els preus de cada variant** | Base de dades (`product_variants`) | Tu, des de l'admin |
| **El preu global** | Base de dades (`pricing_config`) | Tu, des de l'admin |
| **El transport** | Al codi (una taula de tarifes) | Un programador |
| **Les comandes** | Base de dades (`orders`) | El sistema, quan es paga |
| **Els comptes de client** | Supabase | Els clients mateixos |
| **Les adreces** | Base de dades | Els clients |
| **El cistell** | ⚠️ **En DOS llocs**: a la memòria de la pàgina | El client, mentre navega |
| **Els textos i banners** | Base de dades + codi | Tu, des de l'admin |
| **Les claus i contrasenyes** | Variables d'entorn (fora del codi) | Tu, als panells dels serveis |

**Les tres files marcades amb ⚠️ són l'origen de gairebé tots els problemes que he trobat.** No és casualitat: és la mateixa malaltia tres vegades.

---

## 4. El mega-slide

És la peça més personal del teu projecte i **la que més valor té**. No s'ha de tocar.

| Pàgina | Què fa |
|---|---|
| **1. Selector** | Triar color, talla, acabat i veure el disseny |
| **2. Cercador** | Trobar dissenys |
| **3. Cistell i pagament** | Revisar la comanda i pagar (amb un carrusel intern) |
| **4. Usuari** | Compte, comandes, adreces, contacte |

Funciona com una finestra que llisca per sobre de la botiga. La resta de pàgines (inici, col·leccions, fitxa de producte) hi conviuen.

**Per què és valuós:** hi ha centenars de decisions fines de mida, posició i moviment que algú —tu— ha ajustat mirant la pantalla durant mesos. Això no es pot regenerar automàticament. És artesania.

**Per què és delicat:** per la mateixa raó, si es trenca, no es recupera sol.

---

## 5. L'administració

Des del panell d'administració pots gestionar productes, col·leccions, preus, ofertes, imatges i comandes.

**Una cosa que has de saber:** no tot el que es desa a l'admin arriba a la botiga. N'hi ha que **es desa en un lloc que ningú llegeix** — per exemple, la configuració de l'heroi i els missatges del sistema. Sembla que funciona perquè el botó diu "desat", però la botiga no canvia.

Això no és que estigui trencat: és que **mai es va connectar**. És feina pendent, no un error.

---

## 6. Els punts febles, amb noms i cognoms

Aquí et dic la veritat, sense dramatitzar. Cap d'aquests punts és una emergència; tots són coses a millorar amb temps.

**1. El catàleg viu en dos llocs.**
Al codi hi ha 64 dissenys; a la base de dades n'hi ha 41, i només 19 tenen variants de Gelato associades. Això vol dir que **la botiga només pot vendre un 37% del que hauria**. La causa no és la manca de dades: és que les dues llistes no parlen el mateix idioma. *(Mesurat el 12/09/2026.)*

**2. Hi ha dos cistells.**
Un per a l'ordinador i un altre per al mòbil. No es comuniquen. Per això, des del mòbil, afegir una samarreta no arriba mai al pagament.

**3. Hi ha tres maneres de calcular un preu.**
Una escrita dins el codi, una a la configuració i una a les variants. Quan no coincideixen, el client veu un import i se li'n cobra un altre.

**4. El mode de proves amaga els errors de producció.**
Quan desenvolupes, la botiga fa servir **comandes inventades**. Això és còmode, però té un efecte pervers: **els errors del camí real no es veuen fins que obre la botiga**. El bloquejador que impedia vendre va viure mesos amagat aquí.

**4 bis. Hi ha DUES aplicacions en paral·lel. (Descobert el 12/09/2026)**

Aquesta és la troballa que explica el punt anterior, i és la més important de totes les estructurades:

```
Quan desenvolupes  →  index.html       →  main.jsx       →  App.jsx
Quan desplegues    →  index-prod.html  →  main-prod.jsx  →  AppProd.jsx
```

No és que el mode de proves "amagui" errors per casualitat: **estàs mirant un fitxer diferent del que s'executa a producció.** Són dos fitxers germans que fan la mateixa feina per separat, i qualsevol canvi s'ha de fer als dos o un dels dos entorns es queda enrere.

Conseqüència pràctica: quan arreglis alguna cosa de la part superior de la botiga, **no assumeixis que funciona perquè ho veus bé en local.** Comprova-ho sempre amb el build de producció.

Això encaixa amb la regla d'or número 1: la mateixa feina en dos llocs és, exactament, el problema que tens arreu.

**5. Les migracions no coincideixen amb la realitat.**
Els fitxers que descriuen l'estructura de la base de dades no descriuen la teva base de dades real. Si mai es tornen a aplicar en un entorn nou, crearan taules amb les columnes equivocades.

**6. El repositori és públic.**
El codi és a GitHub i qualsevol el pot llegir. Això no és un problema en si —el codi d'una web és visible igualment— però sí que ho va ser quan hi havia claus a dins. **Ara ja no n'hi ha cap d'activa.**

---

## 7. Diccionari

Les paraules que senties i que ningú t'ha explicat.

**Servidor** — Un ordinador que no veus, que sempre està engegat, i que respon les peticions dels navegadors. El teu no és un ordinador físic: són trossos de codi que Netlify executa quan cal.

**Client / navegador** — L'ordinador o mòbil de qui visita la botiga. **Mai te'n refiïs.** Qualsevol pot modificar el que el navegador envia.

**Base de dades** — Un fitxer enorme i ordenat on viu tota la informació. S'organitza en **taules** (com fulls de càlcul): una per productes, una per comandes, una per clients.

**Taula / fila / columna** — Una taula és com un full de càlcul. Cada **fila** és un element (una comanda). Cada **columna** és una dada d'aquell element (el total, l'adreça).

**RLS (seguretat a nivell de fila)** — Les regles que decideixen **qui pot veure quines files**. Serveixen perquè un client no pugui veure les comandes d'un altre, ni tan sols demanant-ho directament.

**Clau d'API** — Una contrasenya molt llarga que identifica un programa davant d'un servei. N'hi ha de públiques (poden anar al navegador) i de privades (només al servidor). **Quan una clau privada surt a fora, s'ha de canviar: no hi ha marxa enrere.**

**Variable d'entorn** — Un calaix on es guarden les claus i contrasenyes **fora del codi**, perquè no acabin al repositori. És on han de viure sempre.

**Desplegament** — El moment de pujar el codi nou i posar-lo en funcionament per als clients.

**Webhook** — Un avís automàtic. Quan Stripe acaba de cobrar, "truca" a la teva botiga per dir-li. Sense aquest avís, la botiga no sabria mai que s'ha pagat.

**Variant** — Una combinació concreta d'un producte: el mateix disseny en talla M i color negre és **una variant**. Cada variant té el seu propi identificador a Gelato.

**Slug** — El nom que surt a l'adreça web. `austen-keep-calm` és el slug de la pàgina d'aquell disseny. Si el slug del codi i el de la base de dades no coincideixen, la botiga busca una cosa i en troba una altra.

**Migració** — Un fitxer que descriu un canvi a l'estructura de la base de dades, per poder-lo repetir en un altre lloc. Al teu projecte, aquests fitxers s'han quedat enrere.

**Test** — Una comprovació automàtica que es fa sola. En tens 126. Serveixen perquè, quan es canvia una cosa, se sàpiga de seguida si s'ha trencat una altra.

**Repositori** — La carpeta on viu tot el codi, amb l'historial de tots els canvis. El teu és a GitHub.

---

## 8. Les regles d'or

Si algun dia has de jutjar si una cosa està ben feta, aquestes quatre preguntes et trauran de dubtes gairebé sempre:

1. **Això, on viu?** Si la resposta és "en dos llocs", hi haurà problemes.
2. **Qui ho decideix, el servidor o el navegador?** Si ho decideix el navegador i té conseqüències (diners, permisos), està mal fet.
3. **Com ho provo sense obrir la botiga?** Si no hi ha manera de provar-ho, es trencarà sense que ho sàpigues.
4. **Si això falla, me n'assabentaré?** Si l'error s'amaga en silenci, el problema es farà gran sol.

---

## 9. Què faria ara, en ordre

**Primer: obrir la botiga.**
El camí de compra ja funciona i està verificat. El que falta és que Gelato t'ompli el catàleg. Fes la sincronització i torna a comptar quants dissenys són venables. Això no es resol escrivint codi.

**Segon: unificar el cistell.**
És el que desbloqueja el mòbil. Una sola cosa en un sol lloc.

**Tercer: unificar el catàleg.**
Que els dissenys visquin només a la base de dades i que el codi els vagi a buscar allà. Això elimina de cop la família d'errors més gran que tens.

**Quart: esborrar el que no s'usa.**
Hi ha components sencers que ja no es fan servir i que fan por de tocar. Treure'ls fa el codi més petit i més llegible. **Això és el que et traurà la sensació de caixa negra.**

**I el mega-slide, mentrestant: no es toca.**

---

## 10. Una última cosa

Has escrit, sense ser programador, un sistema que cobra targetes, encarrega impressions a un proveïdor internacional i gestiona comptes de client. I quan va aparèixer un problema greu, el vas resoldre en minuts.

La sensació de caixa negra no ve de no saber programar. Ve de tenir la informació en massa llocs alhora. Això té arreglo, i no cal començar de zero.

**No has de reescriure la botiga. Has de fer que cada cosa visqui en un sol lloc.**
