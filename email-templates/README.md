# Plantilles d'email — Higgins Gràfic

Plantilles HTML responsive per als correus transaccionals de la botiga.

## Plantilles disponibles

### 1. `order-confirmation.html`
**Confirmació de comanda**
- Enviat just després del pagament
- Variables: `ORDER_NUMBER`, `PRODUCTS[]`, `SUBTOTAL`, `DISCOUNT`, `DISCOUNT_RATE`, `DISCOUNT_AMOUNT`, `SHIPPING`, `TAX`, `TOTAL`, `SHIPPING_NAME`, `SHIPPING_ADDRESS`, `SHIPPING_CITY`, `SHIPPING_POSTAL_CODE`, `SHIPPING_COUNTRY`, `TRACKING_URL`, `SITE_URL`

### 2. `order-shipped.html`
**Comanda enviada**
- Enviat quan la comanda surt del magatzem
- Variables: `ORDER_NUMBER`, `TRACKING_NUMBER`, `CARRIER`, `TRACKING_URL`, `ESTIMATED_DELIVERY`, `ITEM_COUNT`, `TOTAL`, `SITE_URL`

### 3. `welcome.html`
**Benvinguda / Confirmació de registre**
- Enviat quan l'usuari crea un compte
- Variables: `USER_NAME`, `SITE_URL`

### 4. `password-reset.html`
**Recuperació de contrasenya**
- Enviat quan l'usuari demana reset de contrasenya
- Variables: `USER_NAME`, `RESET_URL`, `EXPIRY_TIME`, `SITE_URL`

### 5. `contact-confirmation.html`
**Confirmació de missatge de contacte**
- Enviat quan l'usuari envia un missatge via formulari
- Variables: `USER_NAME`, `MESSAGE`, `SITE_URL`

## Estil i disseny

Totes les plantilles segueixen l'estil visual de la marca:

- **Tipografia:**
  - Títols: Oswald (300/700)
  - Subtítols: Roboto Condensed
  - Cos: Roboto
  - Números: Roboto Mono

- **Colors:**
  - Primari: `#141414` (negre)
  - Accent verd: `#10b981` (enviaments)
  - Accent vermell: `#dc2626` (descomptes)
  - Text: `#111827` / `#4b5563` / `#6b7280`
  - Fons: `#ffffff` / `#f9fafb` / `#f5f5f5`

- **Responsive:** Optimitzades per desktop i mòbil (breakpoint 600px)

## Integració

### Supabase Edge Functions

Per enviar emails amb aquestes plantilles, crea una edge function a `supabase/functions/send-email/`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { template, to, variables } = await req.json()
  
  // Llegir plantilla HTML
  const html = await Deno.readTextFile(`./templates/${template}.html`)
  
  // Substituir variables
  let processedHtml = html
  for (const [key, value] of Object.entries(variables)) {
    processedHtml = processedHtml.replaceAll(`{{${key}}}`, value)
  }
  
  // Enviar amb Resend / SendGrid / etc.
  // ...
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Variables amb arrays (productes)

Per processar `{{#PRODUCTS}}...{{/PRODUCTS}}`:

```typescript
// Exemple amb Mustache.js o similar
import Mustache from 'mustache'

const data = {
  ORDER_NUMBER: 'GRF-12345',
  PRODUCTS: [
    { NAME: 'Samarreta Vader', SIZE: 'M', QUANTITY: 1, PRICE: '24,99€', IMAGE: '...' },
    { NAME: 'Samarreta NX-01', SIZE: 'L', QUANTITY: 2, PRICE: '49,98€', IMAGE: '...' }
  ],
  TOTAL: '74,97€'
}

const html = Mustache.render(template, data)
```

## Testing

Per previsualitzar les plantilles:

1. Obre el fitxer HTML al navegador
2. Substitueix manualment les variables `{{VAR}}` amb valors de prova
3. O usa un servei com [Litmus](https://litmus.com) o [Email on Acid](https://www.emailonacid.com)

## Notes

- Les plantilles NO contenen publicitat ni contingut promocional
- Tots els correus són transaccionals (confirmacions, notificacions, etc.)
- Les fonts web (Oswald, Roboto) poden no carregar en alguns clients d'email — hi ha fallbacks sans-serif
- Testejat en Gmail, Outlook, Apple Mail, i clients mòbils
