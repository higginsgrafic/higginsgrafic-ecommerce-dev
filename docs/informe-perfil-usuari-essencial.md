# Informe del Perfil d'Usuari - Versió Essencial
## Sistema de Comunicació Client ↔ Botiga

---

## 📋 Enfocament

Aquest document defineix les funcionalitats **estrictament necessàries** per a la comunicació entre client i botiga. Sense xarxa social, sense funcionalitats públiques, només allò imprescindible per gestionar comandes i comunicacions.

---

## 1. Compte i Dades Bàsiques

### 1.1. Informació Personal

**Camps obligatoris:**
- **Nom complet** - Input text
- **Email** - Input email (identificador principal)
- **Telèfon** - Input tel (per contacte sobre comandes)

**Camps opcionals:**
- **Empresa/Organització** - Input text (si és client professional)

**Camps NO necessaris:**
- ❌ **Gènere** - La roba és unisex, no cal
- ❌ **Idioma** - Només català, no cal selector

### 1.2. Gestió de Contrasenya

**Funcionalitats:**
- **Contrasenya actual** - Input password
- **Contrasenya nova** - Input password
- **Confirmar contrasenya** - Input password
- **Botó "Canvia contrasenya"**

**Validacions:**
- Mínim 8 caràcters
- Almenys 1 majúscula
- Almenys 1 número

---

## 2. Adreces de Lliurament i Facturació

### 2.1. Adreça de Lliurament

**Camps:**
- **Nom complet del destinatari** - Input text
- **Carrer i número** - Input text
- **Pis/Porta** - Input text (opcional)
- **Codi postal** - Input text
- **Ciutat** - Input text
- **Província/Estat** - Select o Input
- **País** - Select
- **Telèfon de contacte** - Input tel

**Funcionalitats:**
- Checkbox "Desar com a adreça per defecte"
- Botó "Afegir nova adreça"
- Botó "Editar" per cada adreça
- Botó "Eliminar" per cada adreça

### 2.2. Adreça de Facturació

**Opcions:**
- Checkbox "Igual que l'adreça de lliurament"
- Si és diferent, mateixos camps que adreça de lliurament

**Camps addicionals per facturació:**
- **NIF/CIF** - Input text (obligatori per factures)
- **Nom fiscal** - Input text (si és diferent del nom personal)

---

## 3. Mètodes de Pagament

### 3.1. Targetes de Crèdit/Dèbit

**Informació emmagatzemada:**
- **Últims 4 dígits** - Només visible (ex: •••• •••• •••• 1234)
- **Tipus de targeta** - Visa, Mastercard, Amex (icona)
- **Data de caducitat** - MM/AA
- **Nom del titular** - Text

**Funcionalitats:**
- Botó "Afegir targeta"
- Botó "Eliminar" per cada targeta
- Checkbox "Targeta per defecte"

**Seguretat:**
- **CVV mai s'emmagatzema**
- Dades encriptades
- Integració amb passarel·la de pagament (Stripe, Redsys, etc.)

### 3.2. Altres Mètodes

**Opcions:**
- Transferència bancària
- Contra reemborsament
- Bizum (si aplica)

---

## 4. Historial de Comandes

### 4.1. Llista de Comandes

**Informació per comanda:**
- **Número de comanda** - #12345
- **Data** - DD/MM/AAAA
- **Estat** - Badge visual (Pendent, En preparació, Enviada, Lliurada, Cancel·lada)
- **Total** - Import amb IVA
- **Botó "Veure detalls"**

**Estats possibles:**
- 🟡 **Pendent de pagament**
- 🔵 **Pagament confirmat**
- 🟠 **En preparació**
- 🟣 **Enviada** (amb número de seguiment)
- 🟢 **Lliurada**
- 🔴 **Cancel·lada**
- ⚪ **Retornada**

### 4.2. Detall de Comanda

**Informació:**
- **Productes** - Llista amb imatge, nom, quantitat, preu
- **Subtotal** - Suma de productes
- **Enviament** - Cost d'enviament
- **IVA** - Desglossament
- **Total** - Import final
- **Adreça de lliurament** - Completa
- **Adreça de facturació** - Completa
- **Mètode de pagament** - Utilitzat
- **Número de seguiment** - Si està enviada (enllaç a transportista)

**Accions:**
- Botó "Descarregar factura" (PDF)
- Botó "Tornar a comprar" (afegeix productes al carret)
- Botó "Sol·licitar devolució" (si aplica)

---

## 5. Comunicació amb la Botiga

### 5.1. Missatgeria Interna

**Funcionalitat:**
- Llista de converses relacionades amb comandes
- Cada conversa vinculada a un número de comanda
- Notificació quan la botiga respon

**Estructura del missatge:**
- **Assumpte** - Relacionat amb la comanda
- **Missatge** - Àrea de text
- **Fitxers adjunts** - Opcional (imatges, documents)
- **Data i hora** - Timestamp

**Exemples d'ús:**
- Consulta sobre estat de comanda
- Problema amb producte rebut
- Sol·licitud de canvi o devolució
- Pregunta sobre producte abans de comprar

### 5.2. Notificacions per Email

**Tipus de notificacions:**
- ✅ **Confirmació de comanda** - Sempre
- ✅ **Pagament confirmat** - Sempre
- ✅ **Comanda enviada** - Sempre (amb seguiment)
- ✅ **Comanda lliurada** - Sempre
- ⚙️ **Promocions i ofertes** - Configurable (opt-in)
- ⚙️ **Recordatori de carret abandonat** - Configurable

**Configuració:**
- Checkbox per cada tipus de notificació opcional
- Email de confirmació sempre actiu (no es pot desactivar)

---

## 6. Preferències de Compte

### 6.1. Configuració de Privacitat

**Opcions:**
- Checkbox "Accepto rebre comunicacions comercials"
- Checkbox "Accepto que les meves dades es comparteixin amb transportistes" (obligatori per enviaments)

### 6.2. Gestió de Dades

**Funcionalitats:**
- Botó "Descarregar les meves dades" - Exporta tota la informació en format JSON/PDF
- Botó "Eliminar el meu compte" - Amb confirmació doble

**Avís legal:**
- Les comandes completades es conserven segons obligacions legals (facturació)
- Dades personals s'eliminen excepte les requerides per llei

---

## 7. Seguretat

### 7.1. Autenticació de Dos Factors (2FA) - Opcional

**Mètodes:**
- SMS al telèfon
- App d'autenticació (Google Authenticator, Authy)

**Configuració:**
- Toggle "Activar 2FA"
- Selecció de mètode
- Verificació inicial

### 7.2. Sessions Actives

**Informació:**
- **Dispositiu** - Navegador i sistema operatiu
- **Ubicació aproximada** - Ciutat/País (per IP)
- **Última activitat** - Data i hora
- **Botó "Tancar sessió"** per cada dispositiu

---

## 8. Formulari d'Edició Ràpida

### 8.1. Vista Compacta

**Camps editables en un sol formulari:**
- Nom complet
- Email
- Telèfon
- Adreça per defecte (selector)
- Targeta per defecte (selector)

**Botons:**
- "Desa canvis"
- "Cancel·la"

---

## 📊 Resum de Funcionalitats Essencials

### Imprescindibles (MVP)

| Funcionalitat | Prioritat | Descripció |
|---------------|-----------|------------|
| **Registre/Login** | 🔴 Crítica | Email + contrasenya |
| **Dades personals** | 🔴 Crítica | Nom, email, telèfon |
| **Adreça de lliurament** | 🔴 Crítica | Mínim 1 adreça |
| **Mètode de pagament** | 🔴 Crítica | Targeta o altre mètode |
| **Historial de comandes** | 🔴 Crítica | Veure comandes i estat |
| **Descarregar factura** | 🔴 Crítica | PDF de cada comanda |

### Recomanades (Fase 2)

| Funcionalitat | Prioritat | Descripció |
|---------------|-----------|------------|
| **Múltiples adreces** | 🟠 Alta | Gestió de diverses adreces |
| **Missatgeria interna** | 🟠 Alta | Comunicació amb botiga |
| **Notificacions email** | 🟠 Alta | Configurables |
| **2FA** | 🟡 Mitjana | Seguretat addicional |
| **Sessions actives** | 🟡 Mitjana | Control de dispositius |

### Opcionals (Fase 3)

| Funcionalitat | Prioritat | Descripció |
|---------------|-----------|------------|
| **Exportar dades** | 🟢 Baixa | GDPR compliance |
| **Eliminar compte** | 🟢 Baixa | GDPR compliance |
| **Adreça de facturació diferent** | 🟢 Baixa | Clients professionals |

---

## 🎯 Flux d'Usuari Típic

### 1. Registre Inicial
```
1. Usuari crea compte (email + contrasenya)
2. Confirma email
3. Afegeix nom i telèfon
4. Ja pot comprar
```

### 2. Primera Compra
```
1. Afegeix productes al carret
2. Va a checkout
3. Introdueix adreça de lliurament (es desa)
4. Introdueix dades de pagament (opcional: desar targeta)
5. Confirma comanda
6. Rep email de confirmació
```

### 3. Compres Posteriors
```
1. Afegeix productes al carret
2. Va a checkout
3. Selecciona adreça desada
4. Selecciona targeta desada (o introdueix CVV)
5. Confirma comanda
6. Rep email de confirmació
```

### 4. Seguiment de Comanda
```
1. Entra al seu compte
2. Va a "Les meves comandes"
3. Veu l'estat actualitzat
4. Pot descarregar factura
5. Pot contactar amb la botiga si cal
```

---

## 🔒 Consideracions de Seguretat

### Dades Sensibles

**Emmagatzematge:**
- Contrasenyes: **Hash amb bcrypt** (mai en text pla)
- Targetes: **Tokenització** via passarel·la de pagament
- CVV: **Mai s'emmagatzema**

**Transmissió:**
- **HTTPS obligatori** en tot el lloc
- **Certificat SSL/TLS** vàlid

### Compliment Legal (GDPR)

**Obligacions:**
- Consentiment explícit per comunicacions comercials
- Dret a exportar dades
- Dret a eliminar compte
- Política de privacitat clara
- Avís de cookies

---

## 📱 Consideracions de Disseny

### Responsivitat

**Desktop:**
- Formularis en 2 columnes
- Sidebar amb navegació de compte
- Vista ampla de comandes

**Mòbil:**
- Formularis en 1 columna
- Menú hamburguesa per navegació
- Cards compactes per comandes

### Accessibilitat

**Requisits:**
- Labels clars en tots els inputs
- Missatges d'error visibles
- Navegació per teclat
- Contrast adequat (WCAG AA)

---

## 🚀 Fases d'Implementació

### Fase 1: MVP (Mínim Viable)
**Durada estimada: 2-3 setmanes**

- [ ] Registre i login
- [ ] Perfil bàsic (nom, email, telèfon)
- [ ] 1 adreça de lliurament
- [ ] Integració amb passarel·la de pagament
- [ ] Historial de comandes (només lectura)
- [ ] Descarregar factura

### Fase 2: Funcionalitats Estàndard
**Durada estimada: 2 setmanes**

- [ ] Múltiples adreces
- [ ] Múltiples targetes (tokenitzades)
- [ ] Missatgeria interna
- [ ] Notificacions per email configurables
- [ ] Edició de perfil complet

### Fase 3: Seguretat i Compliment
**Durada estimada: 1 setmana**

- [ ] 2FA opcional
- [ ] Sessions actives
- [ ] Exportar dades (GDPR)
- [ ] Eliminar compte (GDPR)
- [ ] Logs d'activitat

---

## 📝 Notes Finals

### Diferències amb l'Informe Anterior

**Eliminat:**
- ❌ Perfil públic
- ❌ Foto de perfil
- ❌ Biografia
- ❌ Seguidors/Seguint
- ❌ Materials favorits
- ❌ Notificacions socials
- ❌ Interaccions públiques

**Mantingut i Simplificat:**
- ✅ Dades personals essencials
- ✅ Adreces (només funcional, no públic)
- ✅ Pagament (només funcional)
- ✅ Historial de comandes
- ✅ Comunicació directa amb botiga
- ✅ Notificacions transaccionals

### Escalabilitat Futura

Si en el futur es decideix afegir funcionalitats socials:
- El sistema actual és compatible
- Es poden afegir camps opcionals
- No cal reestructurar la base de dades
- Migració gradual possible

---

**Document creat el:** Abril 2026  
**Versió:** 2.0 - Essencial  
**Enfocament:** Comunicació Client ↔ Botiga  
**Autor:** Marc (Higgins Gràfic)
