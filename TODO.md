# Tasques pendents abans de publicar

## Contingut

- [ ] **Crear el contingut visual de les heroes** — imatges/disseny per a les hero sections de la portada i col·leccions
- [ ] **Escriure el text de producte** — descripcions, copy i narratives per a cada producte/col·lecció

## Disseny / UI

- [ ] **Arreglar els logos de col·lecció del footer** — actualment no es mostren correctament
- [ ] **Revisar footer de serveis** — hi ha informació obsoleta i cal actualitzar-la. Implementar-hi les tarifes de temps i transport (Gelato) amb dades reals de `useShippingCosts.js` i la pàgina `/shipping`
- [ ] **Corregir els 30 dies de devolució a 14 dies** — el dret de desistiment són 14 dies naturals segons la Directiva Europea 2011/83/UE (confirmat a la doc de Gelato). Revisar totes les pàgines on apareix (FAQ, Shipping, footer, etc.)

## Tour guiat (product tour / coach marks)

Implementar un tour guiat de la botiga amb globus de diàleg per explicar les funcionalitats als usuaris nous.

### Llibreries candidates
- **Driver.js** (~14KB, sense dependències, modern) — recomanada
- **React Joyride** (~20KB, específic per React)
- **Intro.js** (~10KB, clàssic)

### Pàgines a explicar
- [ ] Home / portada
- [ ] Checkout (procés de compra)
- [ ] Compte d'usuari
- [ ] Pàgina de producte (PDP)

### Detalls
- El tour ha d'aparèixer automàticament la primera vegada (amb opció de saltar)
- També ha d'estar accessible via un botó "Com funciona?"
- Estil coherent amb la resta de la web (Roboto, colors #141414, etc.)
- Guardar a localStorage que l'usuari ja ha vist el tour per no repetir-lo
