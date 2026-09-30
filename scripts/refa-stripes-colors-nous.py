#!/usr/bin/env python3
"""Refa les `stripes` (les fileres de samarretes de la franja) amb els colors nous.

QUE SON

  - `full-color-stripe-5.webp` (2866x307): les 14 samarretes en una filera. Es la
    imatge que pinta la franja de la p1.
  - `full-color-stripe-doble.png/webp` (1487x643): les mateixes 14 en dues
    fileres de set, per a la p2.
  - `full-white-stripe*.webp`: les mateixes pero blanques (l'estat buit/velat).

COM ES REFAN

No cal tornar a muntar la filera: cada casella es TENYEIX. La foto de la
samarreta es la mateixa en tots els colors, o sigui que multiplicar la casella
vella pel quocient entre el color nou i el vell conserva la llum i els plecs
exactament com eren. Nome's es tenyeix la samarreta (la diferencia amb la
stripe blanca); el fons blanc es queda blanc.

L'ORDRE

L'ordre de la filera vella i el de la nova no coincideixen: entren
`irish-green`, `military-green`, `dark-chocolate`, `ice-grey`, `rs-sport-grey` i
`charcoal`, i surten `purple`, `light-pink`, `kiwi` i `forest-green`.

Us:
    python3 scripts/refa-stripes-colors-nous.py --prova
    python3 scripts/refa-stripes-colors-nous.py
"""

from __future__ import annotations

import argparse
import os
import statistics
import sys

from PIL import Image, ImageChops

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRIPE_DIR = 'public/placeholders/t-shirt_buttons/v5'
CERC = 'public/placeholders/cercador'
VERT = 'public/placeholders/tablet vertical'
BASE_NOUS = 'public/placeholders/apparel/t-shirt/mockup-gildan'
SUFIX = '6'

# Ordre de la filera VELLA, tal com esta a `full-color-stripe-5.webp`.
VIELLS = ['white', 'light-blue', 'royal', 'navy', 'purple', 'light-pink', 'daisy', 'gold',
          'red', 'kiwi', 'irish-green', 'military-green', 'forest-green', 'black']

# Ordre de la filera NOVA (dictat per l'amo, 29/09/2026).
NOUS = ['white', 'light-blue', 'royal', 'navy', 'irish-green', 'military-green', 'daisy',
        'gold', 'red', 'dark-chocolate', 'ice-grey', 'rs-sport-grey', 'charcoal', 'black']


def to_samarreta(cami):
    """El color mitja de la samarreta d'una imatge de 800x800."""
    im = Image.open(cami).convert('RGBA')
    px = [q[:3] for q in (im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata())
          if q[3] > 200]
    px.sort(key=lambda c: sum(c))
    mig = px[len(px) // 4: 3 * len(px) // 4]
    return tuple(statistics.median([c[k] for c in mig]) for k in range(3))


def to_casella(cell, blanca):
    """El color mitja de la samarreta dins d'una casella de la stripe."""
    d = ImageChops.difference(cell.convert('RGB'), blanca.convert('RGB')).convert('L')
    m = d.point(bytes(255 if v > 18 else 0 for v in range(256)))
    if m.getbbox() is None:
        return None
    px = [p for p, mm in zip(cell.convert('RGB').getdata(), (m.get_flattened_data()
          if hasattr(m, 'get_flattened_data') else m.getdata())) if mm]
    if not px:
        return None
    px.sort(key=lambda c: sum(c))
    mig = px[len(px) // 4: 3 * len(px) // 4] or px
    return tuple(statistics.median([c[k] for c in mig]) for k in range(3))


def tenyeix(cell, blanca, vell, nou):
    """La casella vella, tenyida amb el color nou (nome's la samarreta)."""
    d = ImageChops.difference(cell.convert('RGB'), blanca.convert('RGB')).convert('L')
    m = d.point(bytes(255 if v > 18 else 0 for v in range(256)))
    if m.getbbox() is None:
        return cell.convert('RGB')          # samarreta blanca: no s'hi toca res
    t = tuple(min(1.0, nou[k] / vell[k]) if vell[k] else 0.0 for k in range(3))
    rgb = cell.convert('RGB')
    canvis = []
    for k in range(3):
        r = t[k]
        canvis.append(bytes(min(255, round(v * r)) for v in range(256)))
    tenyit = Image.merge('RGB', [b.point(canvis[k]) for k, b in enumerate(rgb.split())])
    return Image.composite(tenyit, blanca.convert('RGB'), m)


def refa_filera(origen_color, origen_blanca, ample_casella, alcada, files):
    """Torna la filera nova (RGB) a partir de la vella i la blanca."""
    C = Image.open(origen_color).convert('RGBA')
    B = Image.open(origen_blanca).convert('RGBA')
    W, H = C.size
    amplada = ample_casella
    alcada_casella = alcada
    out = Image.new('RGB', (W, H), (255, 255, 255))
    for i in range(len(NOUS)):
        fila, col = divmod(i, 14 // files)
        x0 = col * amplada
        y0 = fila * alcada_casella
        cell = C.crop((x0, y0, x0 + amplada, y0 + alcada_casella))
        blanc = B.crop((x0, y0, x0 + amplada, y0 + alcada_casella))
        vell = to_casella(cell, blanc)
        if vell is None:
            vell = to_samarreta(f'{BASE_NOUS}/mockup-gildan-t-shirt-{VIELLS[i]}.webp')
        nou = to_samarreta(f'{BASE_NOUS}/mockup-gildan-t-shirt-{NOUS[i]}.webp')
        out.paste(tenyeix(cell, blanc, vell, nou), (x0, y0))
    return out, C


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--prova', action='store_true')
    args = ap.parse_args()

    feines = [
        (f'{STRIPE_DIR}/full-color-stripe-5.webp', f'{CERC}/full-white-stripe.webp',
         f'{STRIPE_DIR}/full-color-stripe-{SUFIX}.webp', 2866 // 14, 307, 1),
        (f'{VERT}/full-color-stripe-doble.png', f'{VERT}/full-white-stripe-doble.png',
         f'{VERT}/full-color-stripe-doble-{SUFIX}.png', 1487 // 7, 643 // 2, 2),
    ]
    for color, blanca, desti, amplada, alcada, files in feines:
        if not os.path.exists(color) or not os.path.exists(blanca):
            print('  FALTA:', color if not os.path.exists(color) else blanca)
            continue
        out, C = refa_filera(color, blanca, amplada, alcada, files)
        print(f'  {os.path.basename(color)} -> {os.path.basename(desti)}  {out.size}')
        if not args.prova:
            os.makedirs(os.path.join(ARREL, os.path.dirname(desti)), exist_ok=True)
            if desti.lower().endswith('.png'):
                out.save(os.path.join(ARREL, desti))
            else:
                out.save(os.path.join(ARREL, desti), 'WEBP', quality=95, method=4)
    return 0


if __name__ == '__main__':
    sys.exit(main())
