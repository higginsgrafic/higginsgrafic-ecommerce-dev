# Descàrrega del Projecte Complet

Aquest projecte inclou una funcionalitat per descarregar tot el codi font, incloent el fitxer `.env` amb les credencials de Supabase.

## Com descarregar el projecte

### Opció 1: Des de la interfície web

1. Ves a la pàgina d'administració: `/admin`
2. A la secció "Descarregar projecte complet", fes clic al botó **"Descarregar projecte"**
3. L'arxiu `.tar.gz` es descarregarà automàticament al teu ordinador

### Opció 2: Regenerar l'arxiu manualment

Si necessites regenerar l'arxiu de descàrrega (per exemple, després de fer canvis al projecte):

```bash
# Opció A: Utilitzant npm
npm run generate-download

# Opció B: Executant l'script directament
./scripts/create-download.sh
```

L'arxiu generat estarà disponible a: `public/project-download.tar.gz`

## Contingut de l'arxiu

L'arxiu de descàrrega inclou:

- Tot el codi font del projecte
- Fitxers de configuració (package.json, vite.config.js, etc.)
- Fitxer `.env` amb les credencials de Supabase i Gelato
- Totes les imatges i recursos estàtics
- Scripts i migracions de base de dades

**Exclou:**
- Carpeta `node_modules` (cal executar `npm install` després d'extreure)
- Carpeta `.git` (historial de git)
- Carpeta `dist` (build de producció)

## Extreure l'arxiu descarregat

Un cop hagis descarregat l'arxiu al teu ordinador:

```bash
# Extreure l'arxiu
tar -xzf grafic-ecommerce-YYYY-MM-DD.tar.gz

# Entrar al directori
cd grafic-ecommerce

# Instal·lar dependències
npm install

# Iniciar el servidor de desenvolupament
npm run dev
```

## Seguretat

L'arxiu conté el fitxer `.env` amb les teves credencials de Supabase. Assegura't de:

- No pujar aquest arxiu a repositoris públics
- No compartir-lo amb persones no autoritzades
- Mantenir-lo en un lloc segur al teu ordinador

Si necessites compartir el projecte amb algú, considera eliminar o modificar el fitxer `.env` abans de compartir-lo.
