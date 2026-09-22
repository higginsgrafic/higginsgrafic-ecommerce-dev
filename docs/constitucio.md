# Constitució del projecte — Higgins GRÀFIC

**Què és això.** Les regles que no es discuteixen mai en aquest projecte. Si una tasca demana saltar-se'n una, **atura't i pregunta** a l'amo abans de continuar.

**Com es fa servir.** Qualsevol agent (humà o IA) llegeix aquest fitxer **abans de tocar res**. Les decisions noves que afectin tothom s'afegeixen aquí, amb el motiu.

**Manteniment.** Una constitució desactualitzada és pitjor que no tenir-ne. Si una regla deixa de ser certa, es canvia aquí **el mateix dia**.

---

## 1. No es desplega

**La regla.** No es fa cap desplegament a Netlify ni a cap altre servei. Es fa `git commit` i `git push`, i prou.

**Per què.** L'amo ho va demanar explícitament. El desplegament el decideix ell, quan li convé.

**Com es comprova.** No hi ha d'haver cap `netlify deploy`, cap `--prod`, cap acció de publicació en cap guió.

---

## 2. Sempre en català

**La regla.** Els comentaris del codi, els missatges de commit, els textos de la interfície i les explicacions a l'amo són **en català**. Els identificadors del codi, en anglès.

**Per què.** És l'idioma de l'amo i del projecte sencer. Un comentari en un altre idioma es llegeix pitjor i s'acaba ignorant.

---

## 3. Res no es dona per fet sense comprovar-ho

**La regla.** Abans de dir que una cosa funciona:

```bash
npx vitest run     # tots els tests han de passar
npm run build      # ha de compilar
```

I si es toca la base de dades, **comprovar l'esquema de debò**, no suposar-lo.

**Per què.** En aquest projecte hi ha hagut casos de codi que semblava correcte i fallava en silenci: un webhook que no confirmava comandes durant dies, un esborrat que no esborrava res, unes variants de producte totes amb la mateixa talla.

**Corol·lari.** Els tests són criteris d'acceptació executables. Cada errada que es troba **es converteix en un test** que l'hauria d'haver atrapat.

---

## 4. Les migracions s'executen a mà

**La regla.** Una migració vol dir **dues coses**: escriure el fitxer a `supabase/migrations/` **i** donar a l'amo el bloc SQL per enganxar al **SQL Editor de Supabase**. Sempre les dues, sempre avisant-lo.

**Per què.** El CLI de Supabase **no està autenticat** en aquest entorn. Una migració escrita i no executada és pitjor que no tenir-ne: el codi nou falla i sembla que el problema sigui una altra cosa.

**Com es comprova.** Abans de confiar en una columna o una funció nova, consultar-la. Si no hi és, avisar l'amo i **no seguir endavant** com si hi fos.

**Convenció dels fitxers:** un comentari que explica *per què* cal la migració, i al final una consulta de comprovació que retorna files si tot ha anat bé.

---

## 5. Una factura emesa no es toca mai

**La regla.** Les factures són **immutables**. No es modifiquen ni s'esborren. Per corregir-ne una, s'emet una **factura rectificativa**, que és un document nou que referencia l'original.

**Per què.** És un document fiscal. Un disparador a la base de dades ho impedeix, i això és correcte: la protecció ha de ser al motor, no a la bona voluntat del codi.

**Corol·lari.** La factura desa una **còpia** del client, les línies i els imports del dia en què es va emetre. Mai una referència a la comanda: si demà canvia una adreça o un preu, la factura d'ahir ha de continuar dient el mateix.

---

## 6. La numeració de factures viu a la base de dades

**La regla.** El número de factura l'assigna una funció de la base de dades, **en el moment d'emetre**, i mai abans.

**Per què.** Dues raons, i totes dues greus:

- Un comptador al navegador podria repetir el número si dues persones compren alhora.
- Si el número s'agafés en crear la comanda (abans de pagar), cada intent abandonat deixaria un **forat** a la sèrie — i la sèrie fiscal no pot tenir forats.

**Nota.** Ara mateix hi ha **tres sèries** (`FO` ordinària, `FS` simplificada, `FR` rectificativa). La numeració ha canviat més d'un cop; **comprovar sempre l'estat real a la base de dades abans d'explicar-la**, i no refiar-se de cap document antic.

---

## 7. Un sol preu, en un sol lloc

**La regla.** El preu de venda i l'IVA surten **només** de `src/config/pricing.js`. Cap preu escrit a mà enlloc més.

**Per què.** Hi va haver un temps en què la base de dades deia 29,99 € i la web deia 15,50 €. Un preu duplicat és un preu que divergirà.

---

## 8. El cost del proveïdor i el preu de venda són coses diferents

**La regla.** El que cobrem (**preu de venda**) i el que ens costa (**cost de Gelato**) es guarden en camps separats i no es barregen mai.

**Per què.** Es van barrejar, i el resultat va ser que la botiga venia a preu de cost sense saber-ho.

**Nota.** El cost és una **instantània** del preu del proveïdor en aquell moment. Si canvia el catàleg de Gelato, cal tornar a sincronitzar i revisar la taula de costos.

---

## 9. La clau de servei no surt mai del servidor

**La regla.** La clau de servei de Supabase només s'usa a les funcions de Netlify i als guions locals. **Mai** al navegador.

**Per què.** Aquella clau ho pot veure i modificar tot, saltant-se totes les polítiques de seguretat.

**Com es comprova.** Al codi del client (`src/`) només hi ha d'haver la clau anònima (`VITE_SUPABASE_ANON_KEY`). Cap `SERVICE_ROLE` dins de `src/`.

**Corol·lari.** Les operacions d'administració passen per una funció del servidor que comprova `verifyAdmin(event)` **abans** de fer res.

---

## 10. El filtre de dades el fa la base de dades

**La regla.** Que cada client vegi només les seves dades és responsabilitat de les **polítiques RLS**, no de la interfície. La interfície no ha de comprovar permisos pel seu compte.

**Per què.** Una comprovació al navegador es pot saltar. Una política de base de dades, no. I si el filtre viu en un sol lloc, no hi ha manera d'oblidar-se'n en una pàgina nova.

---

## 11. Els comentaris expliquen el perquè

**La regla.** Quan es canvia alguna cosa per arreglar un problema, **s'escriu quin problema era**. No «canvio això», sinó «això fallava perquè…».

**Per què.** És el que evita que algú desfaci d'aquí a tres mesos una decisió sense saber per què es va prendre. En aquest projecte hi ha diverses solucions que semblen estranyes i són correctes, i totes tenen el motiu escrit al costat.

---

## 12. L'amo no és tècnic

**La regla.** Respostes curtes, en català, i **sempre queda clar què ha de fer ell i què fas tu**. Quan una cosa és delicada, es diu.

**Per què.** Ell pren les decisions de negoci; els agents, les tècniques. Si no sap què li toca, la feina s'atura.

**I una cosa més:** en temes fiscals, legals o de proveïdors, **no s'improvisa assessorament**. Es diu clarament «això és una consulta de gestor» i s'explica què cal preguntar.

---

## 13. Res de feina perduda

**La regla.** Abans de fer qualsevol operació destructiva (`git checkout`, `git reset --hard`, esborrar fitxers), assegurar-se que la feina en curs està **desada en un commit o en una branca**.

**Per què.** En aquest projecte hi treballen diverses eines alhora, i la feina sense cometre és la que es perd. Si hi ha canvis a mig fer i cal prendre una decisió, **primer es desen en una branca** i després es decideix amb calma.

---

## 14. Verificar no és opinar

**La regla.** Quan es diu que una cosa està feta, es diu **com s'ha comprovat**. Si una part no s'ha pogut provar, es diu també.

**Per què.** «Sembla que funciona» no serveix. I amagar una part no verificada acaba costant molt més que dir-la.

---

## 15. Pedaços, si es poden evitar, no

**La regla.** Un pedaç no és una solució. Si la causa d'un problema es pot arreglar
de debò, **s'arregla la causa**. Un pedaç només s'accepta quan la causa no es pot
tocar encara, i llavors s'escriu al costat **quin pedaç és i quina causa tapa**.

**Per què.** Aquest projecte està ple de pedaços que van funcionar el dia que es
van posar i que avui són el problema: el terra de 10 px i el de 12 px al
megaslide tapen que el text i les files es mesuren amb dos sistemes diferents; el
desplaçament mesurat des de JavaScript a la hero de l'inici tapa que la seva
posició no està declarada enlloc. Cap d'aquests pedaços és incorrecte: tots dos
arriben al número bo. El problema és que **no hi ha manera de saber si el número
bo és el que toca**, perquè no està escrit enlloc.

**El cost, mesurat.** El desplaçament de la hero (`Home.jsx`) és un bucle que
mesura, s'ajusta i torna a mesurar. Mesurat a 768×1024 amb vuit càrregues i 245
mostres durant el muntatge, **surt sempre el mateix número** (305,95 px, i el
fons a 19,9 px). No és inestable. El problema és un altre i és pitjor: **aquell
número no està declarat enlloc**. El bucle hi arriba perquè mesura la pantalla, i
per això ningú no pot saber si 305,95 és el valor de disseny o el resultat d'un
accident que avui quadra. Si demà canvia l'alçada de la capçalera, el número
canvia sol i ningú no ho sabrà llegir.

**Correcció d'una afirmació meva.** A la primera versió d'aquesta regla hi deia
que el bucle «oscil·la entre dos valors separats 20 px». Era una deducció feta
llegint el codi, no una mesura, i és **falsa**. Es deixa escrit perquè forma part
de la regla: una afirmació sense mesura no es pot fer servir per justificar res,
ni tan sols una regla que sigui certa.

**Com es reconeix un pedaç.**

- Un número que no se sap d'on surt, i que si es canvia una altra cosa deixa de
  quadrar.
- Una mesura del DOM per decidir una posició o un aire que es podria declarar.
- Una segona regla per a un cas concret quan la primera ja hauria de valer.
- Un terra, un topall o un `+ 2px` que compensa una altra regla.

**Què es fa en lloc seu.** Es busca la causa, es diu en veu alta, i es proposa el
canvi de debò. Si el canvi de debò és gran, **es diu que és gran** i es fa sencer
o no es fa. El que no es fa és deixar el pedaç i dir que ja està.

---

*Si has de trencar alguna d'aquestes regles, para i pregunta. Cap d'elles és negociable sense el propietari.*
