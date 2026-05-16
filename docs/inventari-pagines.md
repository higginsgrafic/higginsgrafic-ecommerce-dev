# Inventari de pàgines

Font de la veritat: `src/dev/pagesManifest.js`.
Visualització en viu: [`/dev/contact-sheet`](/dev/contact-sheet).

Llegenda de tags:

- **keep** — Pàgina activa, es manté.
- **review** — Pendent de decisió (mantenir / refactor / eliminar).
- **dev-only** — Eina interna, no exposar a producció.
- **admin** — Zona privada d'administració.
- **legacy-redirect** — Redirecció heretada (no es renderitza directament).

Per a cada pàgina, anota la teva decisió a la columna **Decisió**.

---

## Home

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/` | HomeClean | keep |  |

## Col·leccions

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/first-contact` | FirstContactPage | keep |  |
| `/thin` | TheHumanInsidePage | keep |  |
| `/miscellania` | MiscellaniaPage | keep |  |

## Constructors

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/constructor/tdp` | TdpPage | keep |  |
| `/constructor/full-wide-slide` | FullWideSlidePage | keep |  |
| `/full-wide-slide` | FullWideSlidePage (alias) | review |  |
| `/plantilla-cataleg-components` | PlantillaCatalegComponentsPage | review |  |

## Comerç

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/checkout` | CheckoutPage | keep |  |
| `/track` | OrderTrackingPage | keep |  |
| `/offers` | OffersPage | keep |  |
| `/product/:id` | ProductDetailPageEnhanced | keep · dinàmic |  |
| `/product-gelato/:id` | Gelato Product Detail | keep · dinàmic |  |
| `/proves/product/:id` | Product (proves) | review · dinàmic |  |
| `/order-confirmation/:orderId` | OrderConfirmation | keep · dinàmic |  |

## Servei (footer)

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/about` | AboutPage | keep |  |
| `/contact` | ContactPage | keep |  |
| `/faq` | FAQPage | keep |  |
| `/shipping` | ShippingPage | keep |  |
| `/sizing` | SizeGuidePage | keep |  |
| `/privacy` | PrivacyPage | keep |  |
| `/terms` | TermsPage | keep |  |
| `/cc` | CreativeCommonsPage | keep |  |

## Lab / Proves

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/lab` | LabHomePage | dev-only |  |
| `/lab/demos` | LabDemosPage | dev-only |  |
| `/lab/wip` | LabWipPage | dev-only |  |
| `/lab/proves` | (inline motion) | dev-only |  |
| `/proves/demo-nike-tambe` | NikeTambePage | dev-only |  |
| `/proves/dev-links` | DevLinksPage | dev-only |  |
| `/proves/dev-components` | DevComponentsCatalogPage | dev-only |  |
| `/proves/layout-builder` | DevLayoutBuilderPage | dev-only |  |
| `/new` | NewPage | review |  |

## Tècnic

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/ec-preview` | EC Preview (full) | dev-only |  |
| `/ec-preview-lite` | EC Preview Lite | dev-only |  |
| `/user-icon-picker` | UserIconPicker | dev-only |  |
| `/documentation-files` | DocumentationFilesPage | dev-only |  |
| `/dev/contact-sheet` | ContactSheetPage | dev-only |  |

## Admin

| Path | Component | Tag | Decisió |
| --- | --- | --- | --- |
| `/admin-login` | AdminLoginPage | admin |  |
| `/admin` | AdminStudioHomePage | admin |  |
| `/admin/controls` | AdminControlsPage | admin |  |
| `/admin/plantilles` | AdminPlantillesPage | admin |  |
| `/admin/wip` | AdminWipPage | admin |  |
| `/admin/demos` | AdminDemosPage | admin |  |
| `/admin/index` | IndexPage | admin |  |
| `/admin/promotions` | PromotionsManagerPage | admin |  |
| `/admin/ec-config` | ECConfigPage | admin |  |
| `/admin/system-messages` | SystemMessagesPage | admin |  |
| `/admin/media` | AdminMediaPage | admin |  |
| `/admin/hero` | HeroSettingsPage | admin |  |
| `/admin/collections` | ColleccioSettingsPage | admin |  |
| `/admin/mockups` | MockupsManagerPage | admin |  |
| `/admin/upload` | AdminUploadPage | admin |  |
| `/admin/fulfillment` | FulfillmentPage | admin |  |
| `/admin/fulfillment-settings` | FulfillmentSettingsPage | admin |  |
| `/admin/gelato-sync` | GelatoProductsManagerPage | admin |  |
| `/admin/gelato-blank` | GelatoBlankProductsPage | admin |  |
| `/admin/gelato-templates` | GelatoTemplatesPage | admin |  |
| `/admin/products-overview` | ProductsOverviewPage | admin |  |
| `/admin/unitats` | UnitatsCanviPage | admin |  |
| `/admin/draft/ruleta` | RuletaDemoPage | admin |  |
| `/admin/studio` | AdminStudioHomePage (legacy) | legacy-redirect |  |
| `/fulfillment/:id` | ProductDetailPageEnhanced | admin · dinàmic |  |

## Redireccions heretades

| Des de | Cap a |
| --- | --- |
| `/the-human-inside` | `/thin` |
| `/proves` | `/lab/proves` |
| `/wishlist` | `/` |
| `/tdp` | `/constructor/tdp` |
| `/dev-links` | `/proves/dev-links` |
| `/dev-components` | `/proves/dev-components` |
| `/layout-builder` | `/proves/layout-builder` |
| `/nike-tambe` | `/proves/demo-nike-tambe` |
| `/status` | `/track` |
| `/ruleta-demo` | `/admin/draft/ruleta` |
| `/index` | `/admin/index` |
| `/promotions` | `/admin/promotions` |
| `/ec-config` | `/admin/ec-config` |
| `/system-messages` | `/admin/system-messages` |
| `/hero-settings` | `/admin/hero` |
| `/colleccio-settings` | `/admin/collections` |
| `/mockups` | `/admin/mockups` |
| `/fulfillment` | `/admin/fulfillment` |
| `/fulfillment-settings` | `/admin/fulfillment-settings` |
| `/admin/draft` | `/admin/draft/ruleta` |
