# Informe del Perfil d'Usuari
## Especificacions per al Sistema de Gestió de Compte

---

## 1. Compte

### Informació Personal
**Camps principals:**
- **Nom complet** (First name + Last name)
- **Nom d'usuari** (Username)
- **Membre des de** (Member since) - Data de registre
- **Botó d'edició de perfil**

### Configuració Regional
**Localització:**
- **Gènere** - Selector desplegable
- **Idioma** - Selector desplegable amb opcions multilingües
- **Moneda** - Selector desplegable per a la moneda preferida
- **Botó "Desa canvis"**

### Gestió de Contrasenya
**Camps de seguretat:**
- **Contrasenya actual** - Camp de text amb màscara
- **Contrasenya nova** - Camp de text amb màscara + botó "Mostra"
- **Confirma la contrasenya nova** - Camp de text amb màscara + botó "Mostra"
- **Botó "Canvia contrasenya"**
- **Enllaç "Has oblidat la contrasenya?"**

### Gestió de Correu Electrònic
**Secció de canvi d'email:**
- **Correu electrònic actual** - Mostrat amb estat (Confirmat/No confirmat)
- **Canvia el teu correu electrònic:**
  - Camp "Correu electrònic nou"
  - Camp "Confirma el correu electrònic nou"
  - Camp "Contrasenya actual" (per verificació)
  - **Botó "Desa canvis"**
- **Nota informativa:** "Necessitaràs confirmar el teu nou correu electrònic abans que es pugui utilitzar"

### Comunicació de la Plataforma
**Preferències de comunicació:**
- Toggle: **Correu postal** - "Envia'm el correu postal"
- Toggle: **Trucades telefòniques** - "Truca'm per telèfon"
- **Botó "Desa preferències de comunicació"**

### Tancament de Compte
**Secció crítica:**
- **Avís informatiu** sobre les conseqüències de tancar el compte
- **Pregunta:** "Què passa quan tanques el teu compte?"
  - Llista de conseqüències (pèrdua d'accés, eliminació de dades, etc.)
- **Enllaç a la política de privacitat**
- **Nota:** "Pots reobrir el teu compte eliminat durant els primers 30 dies. Després d'aquest termini, les dades del teu compte s'eliminaran permanentment"
- **Botó "Tanca el compte"** (acció destructiva)

### Altres Configuracions
**Enllaços addicionals:**
- **Ajuda** - Enllaç al centre d'ajuda
- **Troba'ns** - Enllaç a informació de contacte

---

## 2. Seguretat

### Número de Telèfon Mòbil
**Verificació de contacte:**
- **Badge "Verificat"** (quan està confirmat)
- **Descripció:** "Utilitzem aquest número per verificar la teva identitat i ajudar-te a protegir el teu compte. No compartirem aquest número amb tercers"
- **Enllaç "Més informació"**

### Autenticació de Dos Factors (2FA)
**Seguretat avançada:**
- **Estat:** Activat/Desactivat amb badge visual
- **Toggle principal** amb estat "SMS" o "Trucada"
- **Descripció:** "Iniciarem sessió amb un codi de verificació que t'enviarem cada vegada que iniciïs sessió al teu compte"
- **Botó "Edita"** per modificar configuració
- **Opcions de recepció del codi:**
  - Radio button: "Missatge de text (SMS)"
  - Radio button: "Trucada telefònica"

### Comptes de Tercers
**Integració amb proveïdors externs:**
- **Google** - Estat: Connectat/Desconnectat
  - Botó "Desconnecta" (si està connectat)
  - Enllaç "Inicia sessió amb el teu compte de Google"
- **Facebook** - Estat: Connectat/Desconnectat
  - Botó "Connecta" (si no està connectat)
- **Apple** - Estat: Connectat/Desconnectat
  - Botó "Connecta" (si no està connectat)

**Descripció:** "Connecta els teus comptes de tercers al teu compte per iniciar sessió i marcar favorits. Un cop connectat, pots eliminar-lo en qualsevol moment"

### Historial d'Inicis de Sessió
**Monitorització d'activitat:**
- **Botó "Signa i esborra tot"** - Per revisar i netejar l'historial
- **Descripció:** "Mantenim un registre dels inicis de sessió recents o activitat per al teu compte. Pots iniciar sessió i revisar-los o esborrar-los"
- **Taula amb columnes:**
  - **Data/Hora** (Time)
  - **Navegador/Dispositiu** (Browser/Device)
  - **Adreça IP** (IP Address)
  - **Ubicació** (Location)
  - **Estat** (Status)
- **Registres mostrats:** Últimes sessions amb detalls complets
- **Format de data:** DD/MM/AAAA HH:MM
- **Exemples d'ubicació:** "Barcelona, CT (Spain [Spain])"
- **Estats possibles:** "Signed out", "Signed in"

---

## 3. Perfil Públic

### Imatge de Perfil
**Avatar personalitzat:**
- **Visualització:** Cercle gran amb la imatge actual
- **Botó "Canvia foto"** amb opció de càrrega
- **Nom d'usuari mostrat** sota l'avatar
- **Enllaç "Canvia el nom d'usuari"**

### Configuració de Visibilitat
**Opcions de privacitat del perfil:**
- **Checkboxes amb opcions:**
  - ☐ "Sóc un home" / "Sóc una dona" / "Prefereixo no dir-ho" / "Personalitzat"
  - ☐ "Data de naixement"
  - ☐ "Ubicació"
  - ☐ "Edat"

**Avís informatiu (destacat en groc):**
"Alguns elements del teu perfil poden ser visibles per a tothom que visiti el teu perfil. Aprèn més sobre la configuració de privacitat"

### Informació Biogràfica
**Camps de text:**
- **Data de naixement** - Selector de data (DD/MM/AAAA)
- **Sobre mi** - Àrea de text multilínia per descripció personal
- **Enllaç "Informació addicional sobre mi"**

### Materials Favorits
**Preferències de productes:**
- **Descripció:** "Per exemple: Fusta reciclada o ceràmica feta a mà. Aquestes preferències ajudaran a personalitzar les teves recomanacions"
- **Opcions amb checkboxes:**
  - ☑ "El meu treball" (My work)
  - ☑ "Treball d'altres" (Work by others)
  - ☐ "Articles favorits" (Favorited items)

**Botó "Desa canvis"**

---

## 4. Privacitat

### Visualitzacions Recents
**Historial de navegació:**
- **Descripció:** "Esborra les visualitzacions recents, incloses les idees i els elements que has vist. Les idees i els elements que has vist en el passat no seran recordats"
- **Botó "Esborra visualitzacions recents"**

### Descàrrega de Dades
**Exportació d'informació personal:**
- **Descripció:** "Descarrega una còpia de tota la teva informació personal, incloses les dades que has proporcionat i les que hem recopilat. Troba més informació"
- **Botó "Sol·licita les teves dades per descarregar"**

### Tancament Permanent del Compte
**Eliminació definitiva:**
- **Descripció:** "Tanca i elimina permanentment el teu compte. Un cop eliminat, no podràs tornar a connectar-te. Més informació"
- **Botó "Sol·licita tancament permanent del compte"**

### Configuració de Trobalitat
**Visibilitat en cercadors:**
- **Toggle switch** - Activat/Desactivat
- **Descripció:** "Permet que altres et trobin pel teu correu electrònic? El teu correu electrònic no es mostrarà públicament"
- **Botó "Desa configuració de trobalitat"**

### Configuració de Privacitat Avançada

#### **Consentiment**
- **Descripció detallada** sobre l'ús de dades per a publicitat personalitzada, recomanacions i millores del servei
- **Enllaç a la política de privacitat**

#### **No venguis ni comparteixis la meva informació personal**
- **Descripció:** "Si estàs ubicat a Califòrnia o a Utah, o 'Opta per no compartir les meves dades personals' si estàs a Colorado o Connecticut, pots optar per no vendre o compartir les teves dades personals amb tercers per a publicitat dirigida. Això no afectarà la teva experiència de compra. Més informació"
- **Botó "Actualitza configuració de privacitat"**

---

## 5. Adreces

### Gestió d'Adreces d'Enviament
**Llista d'adreces guardades:**

#### **Adreça Principal (Default)**
- **Badge "Default"** - Indica l'adreça predeterminada
- **Nom complet**
- **Adreça completa:**
  - Carrer i número
  - Ciutat
  - Codi postal
  - País
- **Accions:**
  - ✏️ **Edita** - Botó per modificar l'adreça
  - 🗑️ **Elimina** - Botó per esborrar l'adreça

#### **Adreces Secundàries**
- Mateix format que l'adreça principal
- Sense badge "Default"
- Mateixes opcions d'edició i eliminació

### Afegir Nova Adreça
**Botó principal:**
- **"Afegeix una adreça nova"** - Botó destacat per crear noves adreces

**Nota:** Es poden tenir múltiples adreces guardades per facilitar els enviaments

---

## 6. Targetes de Crèdit

### Llista de Mètodes de Pagament
**Targetes guardades:**

#### **Targeta Principal**
- **Logo de la marca** (Mastercard, Visa, etc.)
- **Nom del titular** (Name on card)
- **Número de targeta** - Últims 4 dígits mostrats (•••• •••• •••• 1234)
- **Data de caducitat** - Format MM/AA
- **Accions:**
  - ✏️ **Edita** - Botó per modificar dades
  - 🗑️ **Elimina** - Botó per esborrar la targeta

#### **Targetes Addicionals**
- Mateix format que la targeta principal
- Suport per a múltiples targetes

### Afegir Nova Targeta
**Botó principal:**
- **"Afegeix una targeta nova"** - Accés al formulari de nova targeta

**Nota de seguretat:** Les dades de les targetes es guarden de forma segura i encriptada

---

## 7. Formulari d'Edició de Targeta

### Modal d'Edició/Creació
**Capçalera:**
- **Títol:** "Edita la teva targeta de crèdit"
- **Botó de tancament** (X)

### Camps del Formulari

#### **Informació de la Targeta**
- **Data de caducitat (MM/AA)**
  - Camp dividit: Mes / Any
  - Botó "NOTA" per informació addicional
- **Nom al carnet** (Name on card)
  - Camp de text lliure
  - Exemple: "Marc Francés Casanovas"

#### **Adreça de Facturació**
**Opció 1: Utilitzar adreça existent**
- Selector desplegable amb adreces guardades
- Exemple: "Carrer St. Llorenc 34, 08950 ESPLUGUES DE LLOBREGAT, Espanya"

**Opció 2: Introduir adreça nova**
- **País** - Selector desplegable (Spain)
- **Adreça completa:**
  - Carrer i número (Street address)
  - Ciutat (Town, AL)
  - Codi postal / ZIP (Apt / Suite / Other (optional))
  - Codi postal (Postal code: 08950)
  - Província/Estat (P/S: Barcelona)
  - Província (Province: BARCELONA)
- **Checkbox:** "Fes aquesta l'adreça predeterminada" (Phone number (optional))

### Accions del Formulari
- **Checkbox:** "Fes-ho per defecte" - Marcar com a targeta predeterminada
- **Botó "Cancel·la"** - Tancar sense desar
- **Botó "Desa"** - Guardar els canvis (botó destacat en negre)

---

## 8. Notificacions

### Alertes de Seguretat
**Notificacions crítiques:**
- **Toggle "Nou: Activa les alertes de seguretat"** - Badge "Nou"
- **Descripció:** "T'enviarem un SMS si detectem alguna activitat inusual, perquè puguis protegir el teu compte ràpidament"

### Configuració de Notificacions per Email

#### **Adreça de correu configurada**
**Email actiu:** higginsgraphic@gmail.com

#### **Envia'm un correu quan...**
**Missatges i comunicacions:**
- ☑ **Rebre missatges**
  - "Email + Missatge"
  - "Missatge només"

**Activitat de seguiment:**
- ☑ **Algú em segueix**
  - "No rebràs correus electrònics sobre nous seguidors"

#### **Subscripcions de correu electrònic**

**General:**
- ☐ **Novetats**
  - "Descobreix les últimes tendències i novetats, consells de compra i recomanacions d'articles únics i especials (enviat diàriament)"

**Interaccions:**
- ☐ **Interaccions**
  - "Nous favorits i activitat en elements que has venut o que t'agraden (enviat ocasionalment)"

**Cupons i Promocions:**
- ☐ **Cupons i Promocions**
  - "Ofertes especials exclusives de la plataforma, com ara descomptes i ofertes especials"

**Esdeveniments:**
- ☐ **Esdeveniments**
  - "Descobreix esdeveniments i experiències properes que et poden interessar (enviat ocasionalment)"

#### **Per a venedors**
**Notificacions comercials:**
- ☑ **Consells per a venedors**
  - "Consells i trucs per ajudar-te a tenir èxit com a venedor (enviat ocasionalment)"

**Actualitzacions:**
- ☑ **Notícies i actualitzacions**
  - "Mantén-te informat sobre les novetats de la plataforma i les eines per a venedors"

**Millores de botiga:**
- ☑ **Consells per millorar la teva botiga**
  - "Aprèn com pots millorar la teva botiga i les teves vendes (enviat ocasionalment)"

**Productes nous:**
- ☐ **Nous productes de venedors que segueixes**
  - "Descobreix els nous articles dels venedors que segueixes (enviat ocasionalment)"

**Botó "Desa configuració"**

---

## Resum de Funcionalitats Clau

### Seguretat
- Autenticació de dos factors (2FA)
- Gestió d'inicis de sessió
- Integració amb proveïdors OAuth (Google, Facebook, Apple)
- Historial d'activitat detallat

### Privacitat
- Control de visibilitat del perfil
- Descàrrega de dades personals
- Configuració de consentiments
- Gestió de trobalitat

### Gestió de Dades
- Múltiples adreces d'enviament
- Múltiples mètodes de pagament
- Preferències de comunicació granulars
- Configuració regional personalitzada

### Experiència d'Usuari
- Interfície clara i organitzada per pestanyes
- Formularis amb validació
- Avisos informatius destacats
- Accions destructives clarament identificades
- Sistema de badges i estats visuals

---

**Document generat el:** Abril 2026  
**Versió:** 1.0  
**Propòsit:** Especificacions per al desenvolupament del sistema de perfil d'usuari
