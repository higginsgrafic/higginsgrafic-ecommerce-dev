# Funcionalitat de Privacitat amb Hover/Polsació
## Sistema d'Ocultació de Dades Personals Sensibles

---

## 📋 Concepte General

Sistema de privacitat que oculta dades personals sensibles per defecte i les mostra només quan l'usuari interactua activament amb elles.

### Comportament:
- **Estat per defecte:** Dades ocultes amb punts gruixuts (••••) o asteriscos (****)
- **Desktop:** Mostrar dades reals amb **hover del ratolí**
- **Mòbil:** Mostrar dades reals amb **polsació contínua** (long press)

### 🔒 Principi de Longitud Fixa (Anti-Espionatge)

**IMPORTANT:** Totes les dades ocultes mostren **la mateixa quantitat de caràcters emmascara**, independentment de la longitud real de la dada.

**Exemple:**
- Email curt: `a@b.com` → `•••••` (5 punts)
- Email llarg: `higginsgraphic@gmail.com` → `•••••` (5 punts)
- Telèfon: `+34666777888` → `•••••` (5 punts)
- Targeta: `4532123456789012` → `•••••` (5 punts)

**Raó:** La **homogeneïtat camufla la diferència**. Si cada dada mostrés un nombre diferent de caràcters emmascara, un espia podria deduir informació sobre la longitud real de les dades (per exemple, saber que un email és curt o llarg, o que un telèfon té més o menys dígits).

**Longitud recomanada:** 5 caràcters (`•••••` o `*****`)
- Prou llarg per ser visible
- Prou curt per no ocupar massa espai
- Homogeni per a totes les dades

---

## 🎯 Dades Candidates per Ocultar

### Informació Personal Sensible

#### **Alta Sensibilitat** (Recomanat ocultar)
- **Email complet** → `•••••`
- **Telèfon** → `•••••`
- **Adreça completa** → `•••••`
- **Codi postal** → `•••••`
- **Data de naixement** → `•••••`
- **DNI/NIF** → `•••••`

#### **Mitjana Sensibilitat** (Opcional)
- **Nom complet** → `•••••`
- **Nom d'usuari** → `•••••`
- **IP d'inici de sessió** → `•••••`

#### **Informació Financera** (Sempre ocultar)
- **Número de targeta** → `•••••` (sense excepció, ni últims 4 dígits)
- **CVV** → `•••••` (sempre ocult, mai mostrar)
- **Data de caducitat** → `•••••`

**Nota:** Totes les dades emmascara mostren exactament **5 caràcters** (`•••••`), independentment de la longitud real. Això evita que es pugui deduir informació sobre la dada oculta.

---

## 💡 Implementació Tècnica

### Component React Exemple

```jsx
import { useState } from 'react';

const PrivateData = ({ 
  value, 
  type = 'text', 
  maskChar = '•',
  maskLength = 5  // Longitud fixa per a totes les dades
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Generar versió emmascara amb longitud fixa
  const getMaskedValue = () => {
    // SEMPRE retorna la mateixa longitud, independentment de la dada real
    return maskChar.repeat(maskLength);
  };
  
  // Handlers
  const handleMouseEnter = () => setIsRevealed(true);
  const handleMouseLeave = () => setIsRevealed(false);
  
  const handleTouchStart = () => setIsRevealed(true);
  const handleTouchEnd = () => setIsRevealed(false);
  
  return (
    <span
      className="private-data"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        fontFamily: isRevealed ? 'inherit' : 'monospace',
        letterSpacing: isRevealed ? 'normal' : '0.1em',
      }}
      title="Mantén premut per veure"
    >
      {isRevealed ? value : getMaskedValue()}
    </span>
  );
};

export default PrivateData;
```

### Ús del Component

```jsx
// Email
<PrivateData value="higginsgraphic@gmail.com" type="email" />

// Telèfon
<PrivateData value="+34 666 777 888" type="phone" />

// Targeta (longitud fixa, sense excepció)
<PrivateData value="4532 1234 5678 9012" type="card" />

// Adreça
<PrivateData value="Carrer St. Llorenc 34, Barcelona" type="address" />

// Data de naixement
<PrivateData value="15/03/1985" type="date" />
```

---

## 🎨 Variants de Disseny

### Opció 1: Punts Gruixuts (Recomanat)
```
Email: •••••
Telèfon: •••••
Targeta: •••••
Adreça: •••••
```

**Avantatges:**
- Més elegant visualment
- **Longitud fixa** (5 caràcters sempre)
- Impossible de deduir la longitud real
- Fàcil de llegir

### Opció 2: Asteriscos
```
Email: *****
Telèfon: *****
Targeta: *****
Adreça: *****
```

**Avantatges:**
- Més familiar (com passwords)
- Més contrast visual
- **Longitud fixa** (5 caràcters sempre)
- Homogeneïtat total

### Opció 3: Blocs Sòlids
```
Email: █████
Telèfon: █████
Targeta: █████
Adreça: █████
```

**Avantatges:**
- Màxima privacitat visual
- Impossible de deduir caràcters
- **Longitud fixa** (5 caràcters sempre)
- Homogeneïtat absoluta

### Opció 4: Blur CSS
```css
.private-data:not(:hover) {
  filter: blur(5px);
  transition: filter 0.2s ease;
}
```

**Avantatges:**
- Efecte modern
- Manté el layout exacte
- Transició suau

---

## 📱 Consideracions UX

### Desktop (Hover)
- **Pros:**
  - Interacció natural i ràpida
  - No requereix clic
  - Reversible instantàniament
- **Cons:**
  - No funciona en tàctil
  - Pot revelar-se accidentalment

### Mòbil (Long Press)
- **Pros:**
  - Interacció deliberada
  - Més segur (no accidental)
  - Compatible amb tàctil
- **Cons:**
  - Menys intuïtiu
  - Requereix instruccions

### Millora: Indicador Visual
```jsx
<span className="private-data-wrapper">
  <PrivateData value="..." />
  <span className="hint-icon" title="Mantén premut per veure">
    👁️
  </span>
</span>
```

---

## 🔒 Nivells de Privacitat Configurables

### Perfil d'Usuari: Configuració de Privacitat

```jsx
const privacyLevels = {
  NONE: {
    label: 'Sense ocultació',
    description: 'Totes les dades sempre visibles',
    mask: false,
  },
  PARTIAL: {
    label: 'Ocultació parcial',
    description: 'Només dades molt sensibles (targetes, DNI)',
    mask: ['card', 'dni', 'cvv'],
  },
  STANDARD: {
    label: 'Ocultació estàndard',
    description: 'Dades personals i financeres (recomanat)',
    mask: ['card', 'dni', 'email', 'phone', 'address'],
  },
  MAXIMUM: {
    label: 'Ocultació màxima',
    description: 'Totes les dades personals',
    mask: ['card', 'dni', 'email', 'phone', 'address', 'name', 'birthdate', 'ip'],
  },
};
```

---

## 🎯 Casos d'Ús

### 1. Pantalla Compartida
**Escenari:** L'usuari està compartint pantalla en una videoconferència
- Totes les dades sensibles ocultes per defecte
- Només es revelen amb hover/long press deliberat
- Evita exposició accidental

### 2. Espai Públic
**Escenari:** L'usuari consulta el seu perfil en un cafè o transport públic
- Protecció contra "shoulder surfing" (mirar per sobre l'espatlla)
- Dades visibles només quan l'usuari ho decideix

### 3. Captura de Pantalla
**Escenari:** L'usuari fa una captura per suport tècnic
- Les dades sensibles surten emmascara per defecte
- No cal editar la imatge manualment

### 4. Demostració/Tutorial
**Escenari:** Mostrar la plataforma a un client o en un vídeo
- Dades de prova visibles però protegides
- Aspecte professional sense exposar informació real

---

## 🛠️ Implementació per Seccions

### Compte (Account)
- ✅ **Email:** Ocultar domini o part local
- ✅ **Telèfon:** Ocultar dígits centrals
- ⚠️ **Nom d'usuari:** Opcional (si conté dades personals)
- ❌ **Nom complet:** Generalment visible (és el perfil de l'usuari)

### Seguretat (Security)
- ✅ **Telèfon 2FA:** Ocultar dígits centrals
- ✅ **IP d'inici de sessió:** Ocultar octets centrals
- ⚠️ **Ubicació:** Opcional (ciutat visible, adreça oculta)

### Adreces (Addresses)
- ✅ **Carrer i número:** Ocultar número o part del carrer
- ✅ **Codi postal:** Ocultar últims dígits
- ⚠️ **Ciutat/País:** Generalment visible

### Targetes (Credit Cards)
- ✅ **Número de targeta:** SEMPRE ocult (excepte últims 4)
- ✅ **CVV:** SEMPRE ocult (mai mostrar)
- ⚠️ **Data caducitat:** Opcional
- ❌ **Nom titular:** Generalment visible

---

## 🎨 Estils CSS Recomanats

```css
.private-data {
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-family: monospace;
  letter-spacing: 0.1em;
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.02);
}

.private-data:hover,
.private-data.revealed {
  font-family: inherit;
  letter-spacing: normal;
  color: inherit;
  background: rgba(0, 0, 0, 0.05);
}

.private-data::after {
  content: '👁️';
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.private-data:hover::after {
  opacity: 0.5;
}

/* Animació de revelació */
@keyframes reveal {
  0% {
    filter: blur(5px);
    opacity: 0.5;
  }
  100% {
    filter: blur(0);
    opacity: 1;
  }
}

.private-data.revealed {
  animation: reveal 0.3s ease;
}
```

---

## 📊 Configuració Recomanada per Defecte

### Nivell STANDARD (Recomanat)

| Dada | Estat per Defecte | Revelació |
|------|-------------------|-----------|
| Email | `•••••` | Hover/Long press |
| Telèfon | `•••••` | Hover/Long press |
| Targeta | `•••••` | Hover/Long press |
| CVV | `•••••` | **MAI** (sempre ocult) |
| Adreça | `•••••` | Hover/Long press |
| Codi Postal | `•••••` | Hover/Long press |
| IP | `•••••` | Hover/Long press |
| Data naixement | `•••••` | Hover/Long press |
| DNI/NIF | `•••••` | Hover/Long press |
| Nom complet | `Marc Francés` | **Sempre visible** |
| Ciutat | `Barcelona` | **Sempre visible** |
| País | `Espanya` | **Sempre visible** |

**Nota important:** Totes les dades ocultes mostren **exactament 5 caràcters** (`•••••`). Això garanteix que un observador extern no pugui deduir cap informació sobre la longitud real de les dades.

---

## ⚙️ Opcions de Configuració

### Preferències d'Usuari

```jsx
// Secció de Privacitat > Visualització de Dades

<div className="privacy-display-settings">
  <h3>Ocultació de Dades Sensibles</h3>
  
  <select value={privacyLevel} onChange={handlePrivacyChange}>
    <option value="NONE">Sense ocultació</option>
    <option value="PARTIAL">Ocultació parcial</option>
    <option value="STANDARD">Ocultació estàndard (recomanat)</option>
    <option value="MAXIMUM">Ocultació màxima</option>
  </select>
  
  <div className="privacy-info">
    <p>Les dades ocultes es poden veure passant el ratolí per sobre (desktop) o mantenint premut (mòbil)</p>
  </div>
  
  <div className="privacy-preview">
    <h4>Vista prèvia:</h4>
    <p>Email: <PrivateData value="exemple@gmail.com" /></p>
    <p>Telèfon: <PrivateData value="+34 666 777 888" /></p>
  </div>
</div>
```

---

## 🚀 Fases d'Implementació

### Fase 1: Prototip (MVP)
- [ ] Component `PrivateData` bàsic
- [ ] Suport hover (desktop)
- [ ] Suport long press (mòbil)
- [ ] Aplicar a targetes de crèdit

### Fase 2: Expansió
- [ ] Aplicar a emails i telèfons
- [ ] Configuració de nivells de privacitat
- [ ] Indicadors visuals (icona ull)
- [ ] Animacions de transició

### Fase 3: Avançat
- [ ] Preferències per tipus de dada
- [ ] Mode "presentació" (tot ocult)
- [ ] Estadístiques d'ús
- [ ] Integració amb sistema de permisos

---

## 📝 Notes Importants

### Seguretat
- ⚠️ **Això NO és encriptació:** Les dades segueixen sent accessibles al codi font HTML
- ⚠️ **Només és visual:** Protegeix contra mirades indiscretes, no contra inspecció tècnica
- ✅ **Complement, no substitut:** Usar juntament amb altres mesures de seguretat
- 🔒 **Longitud fixa:** Totes les dades ocultes mostren exactament 5 caràcters (`•••••`), evitant que es pugui deduir la longitud real de la informació
- 🎯 **Homogeneïtat anti-espionatge:** La uniformitat visual camufla les diferències entre dades curtes i llargues

### Accessibilitat
- Assegurar que els lectors de pantalla puguin accedir a les dades
- Proporcionar alternatives de teclat (Tab + Enter per revelar)
- Indicar clarament com revelar les dades

### Performance
- Evitar re-renders innecessaris
- Usar `useMemo` per valors emmascara
- Optimitzar per llistes llargues (virtualització)

---

## 🎯 Decisió Final

**Estat:** 💡 **Funcionalitat Proposada** (Pendent d'implementació)

**Recomanació:** Implementar en **Fase 2** del desenvolupament del perfil d'usuari, començant amb targetes de crèdit i expandint gradualment.

**Prioritat:** **Mitjana-Alta** (Millora significativa de privacitat i UX)

---

**Document creat el:** Abril 2026  
**Versió:** 1.0  
**Estat:** Proposta per a futura implementació  
**Autor:** Marc (Higgins Gràfic)
