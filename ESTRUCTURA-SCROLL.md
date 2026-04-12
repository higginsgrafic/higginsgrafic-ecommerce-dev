# Estructura del Scroll Vertical - Pàgines 3 i 4

## PÀGINA 3 - CISTELL + COMANDA

```
┌─────────────────────────────────────────────────────────┐
│                    VIEWPORT VISIBLE                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │              CARRUSEL DE PRODUCTES                  │ │
│ │         (CartV1 - scroll horitzontal)               │ │
│ │                                                     │ │
│ │  [Targeta 1] [Targeta 2] [Targeta 3] ...          │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↓
                   SCROLL VERTICAL
                         ↓
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │                RESUM DE LA COMANDA                  │ │
│ │                  (CheckoutV1)                       │ │
│ │                                                     │ │
│ │  - Llista de productes                             │ │
│ │  - Subtotal                                        │ │
│ │  - Enviament                                       │ │
│ │  - Total                                           │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## PÀGINA 4 - USUARI + USUARI XL

```
┌─────────────────────────────────────────────────────────┐
│                    VIEWPORT VISIBLE                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │              PERFIL D'USUARI                        │ │
│ │            (UserV1 - placeholder)                   │ │
│ │                                                     │ │
│ │         [Fons blau clar #ADD8E6]                   │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↓
                   SCROLL VERTICAL
                         ↓
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │           INFORMACIÓ DEL COMPTE                     │ │
│ │              (UserV1 XL)                            │ │
│ │                                                     │ │
│ │  - Nom i cognoms                                   │ │
│ │  - Correu electrònic                               │ │
│ │  - Telèfon                                         │ │
│ │  - Adreça                                          │ │
│ │  - Ciutat                                          │ │
│ │  - Codi postal                                     │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## NOTES IMPORTANTS:

1. **Pàgines 1 i 2** (STRIPE i CERCADOR) NO tenen scroll vertical
2. **Pàgines 3 i 4** tenen wrapper amb `overflow-y: auto`
3. El **carrusel** i el **placeholder d'usuari** ocupen la vista inicial
4. El contingut **expandible** apareix quan fas scroll vertical cap avall
5. El **slider horitzontal** continua funcionant per navegar entre pàgines
