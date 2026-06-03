# Inventari de Pàgines — Classificació PROD vs DEV

> Generat: 6 Febrer 2026 · Projecte: Higgins Gràfic Ecommerce  
> Objectiu: Decidir quines pàgines formen part de la botiga pública (PROD) i quines es queden al repositori de desenvolupament.

---

## 📊 Resum

| Categoria | Quantitat |
|-----------|-----------|
| **PROD — Botiga pública** | **~20 pàgines** |
| **ADMIN — Panell intern** | ~15 pàgines |
| **DEV/LAB — Prototips i eines** | ~45 pàgines |
| **Total al repositori** | ~80 pàgines |

---

## ✅ PÀGINES PROD — Botiga Pública (van a producció)

Aquestes són les pàgines que formen la botiga de cara al client final:

| # | Pàgina | Ruta | Funció |
|---|--------|------|--------|
| 1 | **HomeClean** | `/` | Pàgina d'inici principal |
| 2 | **ProductPage** | `/product/:id` | Fitxa de producte (pàgina genèrica) |
| 3 | **ProductDetailPage** | `/product/:id` | Fitxa de producte (detall) |
| 4 | **ProductDetailPageEnhanced** | `/product/:id` | Fitxa de producte millorada |
| 5 | **ProductsOverviewPage** | (catàleg) | Vista general de productes |
| 6 | **CollectionPage** | `/collection/:slug` | Pàgina de col·lecció (config-driven) |
| 7 | **SupabaseCollectionRoute** | `/collection/:slug` | Col·lecció des de Supabase |
| 8 | **CheckoutPage** | `/checkout` | Procés de compra (checkout) |
| 9 | **OrderConfirmationPage** | `/order-confirmation/:orderId` | Confirmació de comanda |
| 10 | **OrderTrackingPage** | `/track` | Seguiment de comanda |
| 11 | **OffersPage** | `/offers` | Pàgina d'ofertes |
| 12 | **ContactPage** | `/contact` | Contacte |
| 13 | **AboutPage** | `/about` | Sobre nosaltres |
| 14 | **FAQPage** | `/faq` | Preguntes freqüents |
| 15 | **ShippingPage** | `/shipping` | Informació d'enviament |
| 16 | **SizeGuidePage** | `/sizing` | Guia de talles |
| 17 | **PrivacyPage** | `/privacy` | Política de privacitat |
| 18 | **TermsPage** | `/terms` | Termes i condicions |
| 19 | **CreativeCommonsPage** | `/cc` | Llicències Creative Commons |
| 20 | **NotFoundPage** | `*` | Pàgina 404 |
| 21 | **IndexPage** | `/index` (o landing) | Landing page alternativa |
| 22 | **NewPage** | `/new` | Novetats (si s'usa) |

---

## 🔧 PÀGINES ADMIN — Panell intern (NO van a botiga pública)

Aquestes es mantenen al repositori DEV o es protegeixen amb autenticació:

| # | Pàgina | Ruta | Funció |
|---|--------|------|--------|
| 1 | AdminStudioHomePage | `/admin` | Dashboard admin |
| 2 | AdminDemosPage | `/admin/demos` | Demos admin |
| 3 | AdminLoginPage | `/admin-login` | Login admin |
| 4 | AdminControlsPage | `/admin/controls` | Controls admin |
| 5 | AdminMediaPage | `/admin/media` | Gestió de mitjans |
| 6 | AdminUploadPage | `/admin/upload` | Pujada d'arxius |
| 7 | AdminPlantillesPage | `/admin/plantilles` | Plantilles admin |
| 8 | AdminWipPage | `/admin/wip` | Admin en construcció |
| 9 | ECConfigPage | `/admin/ec-config` | Configuració ecommerce |
| 10 | PromotionsManagerPage | `/admin/promotions` | Gestió de promocions |
| 11 | SystemMessagesPage | `/admin/system-messages` | Missatges del sistema |
| 12 | HeroSettingsPage | `/admin/hero` | Configuració hero |
| 13 | ColleccioSettingsPage | `/admin/collections` | Configuració col·leccions |
| 14 | FulfillmentPage | `/admin/fulfillment` | Gestió fulfillment |
| 15 | FulfillmentSettingsPage | `/admin/fulfillment-settings` | Configuració fulfillment |
| 16 | MockupsManagerPage | `/admin/mockups` | Gestió mockups |
| 17 | GelatoProductsManagerPage | `/admin/gelato-products` | Gestió productes Gelato |
| 18 | GelatoTemplatesPage | `/admin/gelato-templates` | Templates Gelato |
| 19 | GelatoBlankProductsPage | `/admin/gelato-blank` | Productes blank Gelato |
| 20 | AppsPage | `/apps` | Aplicacions |
| 21 | DocumentationPage | `/docs` | Documentació |
| 22 | DocumentationFilesPage | `/documentation-files` | Arxius documentació |
| 23 | UserIconPicker | `/user-icon-picker` | Selector icones |

---

## 🧪 PÀGINES DEV/LAB — Prototips i eines (NO van a producció)

Aquestes NO han d'aparèixer al bundle de producció. Són prototips, experiments i eines de desenvolupament:

### Lab
| # | Pàgina | Ruta |
|---|--------|------|
| 1 | LabHomePage | `/lab` |
| 2 | LabDemosPage | `/lab/demos` |
| 3 | LabWipPage | `/lab/wip` |

### Dev Tools
| # | Pàgina | Ruta |
|---|--------|------|
| 4 | DevComponentsCatalogPage | `/proves/dev-components` |
| 5 | DevLayoutBuilderPage | `/proves/layout-builder` |
| 6 | DevLinksPage | `/proves/dev-links` |
| 7 | ContactSheetPage | `/dev/contact-sheet` |
| 8 | SiteMapPage | `/dev/site-map` |

### ECommerce Preview
| # | Pàgina | Ruta |
|---|--------|------|
| 9 | ECPreviewPage | `/ec-preview` |
| 10 | ECPreviewLitePage | `/ec-preview-lite` |

### Constructor / Prototips de col·lecció
| # | Pàgina | Ruta |
|---|--------|------|
| 11 | ConstructorColleccioPage | `/constructor/colleccio` |
| 12 | ConstructorColleccio01Page | `/constructor/colleccio01` |
| 13 | ConstructorColleccio02Page | `/constructor/colleccio02` |
| 14 | ConstructorColleccio03Page | `/constructor/colleccio03` |
| 15 | ConstructorColleccio04Page | `/constructor/colleccio04` |
| 16 | ConstructorColleccio05Page | `/constructor/colleccio05` |
| 17 | ConstructorPdpPage | `/constructor/pdp` |
| 18 | HtmlBasePage | `/constructor/html-base` |
| 19 | TdpPage | `/constructor/tdp` |
| 20 | FullWideSlidePage | `/full-wide-slide` |
| 21 | FullWideSlideDemoPage | `/constructor/full-wide-slide` |
| 22 | PlantillaCatalegComponentsPage | `/plantilla-cataleg-components` |

### Col·lecció / Experiments de layout
| # | Pàgina | Ruta |
|---|--------|------|
| 23 | NikeTambePage | `/proves/demo-nike-tambe` |
| 24 | RuletaDemoPage | (admin draft) |
| 25 | ThumbFramePage | (no enrutada?) |
| 26 | AustenPage | (col·lecció Austen) |
| 27 | CubePage | (col·lecció Cube) |
| 28 | FirstContactPage | (col·lecció First Contact) |
| 29 | GraficPage | (pàgina gràfica) |
| 30 | MiscellaniaPage | (col·lecció Miscellania) |
| 31 | TheHumanInsidePage | (col·lecció) |
| 32 | UnitatsCanviPage | (??) |
| 33 | GelatoProductDetailPage | (detall Gelato) |

### Config (dev-only helpers)
| # | Pàgina | Ruta |
|---|--------|------|
| 34 | ECConfigPage | `/admin/ec-config` |

> **Nota:** Algunes pàgines llistades com a "Col·lecció" (FirstContact, TheHumanInside, Austen, Cube, Miscellania) tenen àlies al router: `/first-contact`, `/the-human-inside`, `/austen`, `/cube`, `/miscellania`. Són prototips de col·lecció, no productes reals.

---

## 🎯 Accions per al sync DEV → PROD

1. **Mantenir al bundle PROD només les ~20 pàgines de botiga pública.**
2. **Eliminar del bundle** totes les pàgines Admin, Lab, Dev Tools, Constructor i prototips (~60 pàgines).
3. **Verificar** que els components compartits (Footer, ErrorBoundary, Breadcrumbs, CCLogo, etc.) no tinguin dependències amb eines de dev.
4. **Revisar** si `NewPage` i `IndexPage` s'usen realment com a pàgines públiques.

---

## 📝 Notes addicionals

- **FullWideSlideDemoHeader** (importat a App.jsx línia 26): Component de dev que es renderitza al header. Cal condicionar o eliminar per PROD.
- **DevHeader** (importat a App.jsx línia 28): Header de desenvolupament. Fora de PROD.
- **DevGuidesOverlay, BeltReferenceOverlay, Pauta4ColsOverlay**: Overlays de disseny. Fora de PROD.
- **NikeInspiredHeader**: Cal verificar si és un header de producció o un experiment.
- **useDebugOverlays**: Hook que gestiona tot el sistema de guies. Fora de PROD.