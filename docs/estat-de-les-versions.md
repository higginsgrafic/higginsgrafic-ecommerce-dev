# Estat de les versions del checkout

Aquest fitxer és el recordatori de com està repartida la feina entre les quatre
versions de la botiga (escriptori, tauleta apaïsada, tauleta vertical i mòbil),
perquè no s'hagi de repetir cada cop.

## Versió vertical: CONGELADA

La **tauleta vertical està congelada**. No s'hi fa cap canvi tret que es demani
explícitament, i si es demana, es torna a congelar tot seguit.

Números verificats en el moment de congelar-la (1024×1366 i 820×1180):

| Què | Valor |
|---|---|
| Títol PAGAMENT | 128 px |
| Guia verda (títol + 20) | 177 |
| Guia blava (mega-slide − 20) | 405 |
| Bloc de productes | 177 → 405 (228 px d'alçada de fitxa) |
| Columnes del formulari | 509 |
| Alçada de tots els camps i del botó | 39 px |
| Amplada de la targeta de totals | 220 px |
| Gap entre fitxes | 5 px |
| Gap última fitxa → totals | 14 px |
| Enllaços de col·leccions (2n header) | 103 |
| "Necessites factura?" (tinta) ↔ Ciutat (fons) | 724 |
| Camp de CIF (fons) ↔ País (fons) | 812 |
| "Accepto els Termes" ↔ Correu | 817 |
| Botó de pagar (fons) ↔ Telèfon (fons) | 900 |

**Compte**: aquests números surten de constants fetes a mà. Si es canvia alguna
cosa compartida (l'alçada del header, els camps del formulari, la fitxa de
producte, la tipografia dels títols), cal tornar a comprovar la vertical.

## Versions en curs

- **Escriptori i tauleta apaïsada**: són les que es toquen ara.
- **Mòbil**: l'última de tot.

## Guies de color (temporals)

`src/components/dev/MegaslideEndGuide.jsx` dibuixa tres línies de referència al
checkout (títol + 20, mega-slide − 20 i el final del mega-slide). Surt sempre en
desenvolupament i, al lloc publicat, només amb `?megaslide=1`. A la vertical va
desactivada. **S'ha d'esborrar quan s'acabi la feina**: el component i la línia
que l'importa a `CheckoutPage.jsx`.
