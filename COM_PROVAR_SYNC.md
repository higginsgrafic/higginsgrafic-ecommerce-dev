# Com provar la sincronització amb Gelato

## Pas a Pas

### 1. Iniciar el servidor
```bash
npm run dev
```

### 2. Obrir la consola del navegador
- Premeu **F12** o **Ctrl+Shift+I** (Windows/Linux) o **Cmd+Option+I** (Mac)
- Aneu a la pestanya **Console**

### 3. Anar a la pàgina d'administració
Obriu: `http://localhost:3000/admin`

### 4. Clicar "Sincronitzar amb Gelato"
Hauríeu de veure a la consola missatges com aquests:

```
🚀 Iniciant sincronització amb Gelato...
📍 Clau API configurada: Sí
📞 Cridant syncGelatoProducts...
🔄 [SYNC] Iniciant sincronització productes de Gelato...
🔄 [SYNC] Cridant syncGelatoCatalog()...
📦 Obtenint productes de Gelato...
ℹ️ Nota: S'utilitzaran els primers 30 productes disponibles al vostre compte
🌐 [API] Cridant: https://product.gelatoapis.com/v3/products
✅ Trobats X productes al vostre catàleg
✅ Total sincronitzats: X productes
📚 Col·leccions assignades: first-contact, the-human-inside, austen, cube, outcasted
🔄 [SYNC] syncGelatoCatalog() ha retornat: [array de productes]
🔄 [SYNC] Nombre de productes: X
```

## Si no funciona

### Cas 1: Veieu "No s'han trobat productes"
Això vol dir que el vostre compte de Gelato no té productes configurats.

**Solució:**
1. Aneu a https://dashboard.gelato.com
2. Aneu a la secció "Products" o "Catalog"
3. Afegiu productes al vostre catàleg
4. Torneu a provar la sincronització

### Cas 2: Veieu un error HTTP 401 o 403
La clau API no és vàlida o ha expirat.

**Solució:**
1. Aneu a https://dashboard.gelato.com
2. Aneu a la secció "API Keys"
3. Genereu una nova clau API
4. Actualitzeu el fitxer `.env` amb la nova clau
5. Reinicieu el servidor (`npm run dev`)

### Cas 3: Veieu un error de xarxa
Problema de connexió.

**Solució:**
1. Verifiqueu la vostra connexió a Internet
2. Verifiqueu que no hi ha un firewall bloquejant les peticions a `gelatoapis.com`
3. Proveu de fer un `curl` manual:
```bash
curl -H "X-API-KEY: VOSTRA_CLAU_API" https://product.gelatoapis.com/v3/products?limit=1
```

### Cas 4: No veieu cap missatge a la consola
1. Assegureu-vos que la pestanya "Console" està oberta
2. Netegeu la consola (icona 🚫 o "Clear console")
3. Torneu a clicar el botó de sincronització
4. Si encara no veieu res, proveu d'obrir la consola en una finestra nova del navegador

## Verificar que ha funcionat

Després de la sincronització, aneu a una pàgina de col·lecció:
- http://localhost:3000/first-contact
- http://localhost:3000/the-human-inside
- http://localhost:3000/austen
- http://localhost:3000/cube
- http://localhost:3000/outcasted

Hauríeu de veure productes (els primers 4 de cada col·lecció es mostren com a showroom).

## Test ràpid de l'API

Si voleu provar directament l'API sense passar per la interfície:

1. Obriu el fitxer `debug-sync.html` al navegador
2. Cliqueu "Provar Sincronització"
3. Veureu el resultat directament a la pàgina

## Informació tècnica

**Clau API configurada:** `VITE_GELATO_API_KEY (amaga-la al .env)`
**Endpoint:** `https://product.gelatoapis.com/v3`
**Base de dades:** Supabase (`jnuuejlxuyqhhkfucuxg.supabase.co`)
**Mode:** Producció (no sandbox)
